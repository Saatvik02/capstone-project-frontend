import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { Text, Progress, Box, Flex, VStack, Button, CircularProgress, useToast, useMediaQuery } from "@chakra-ui/react";
import area from '@turf/area';

const SearchField = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) {
            console.log("Map not yet initialized");
            return;
        }
        console.log("Map initialized:", map);

        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider,
            style: "bar",
            showMarker: true,
            showPopup: true,
            retainZoomLevel: false,
            animateZoom: true,
            autoClose: true,
            searchLabel: "Type a location to start mapping...",
            keepResult: true,
        });

        map.addControl(searchControl);

        setTimeout(() => {
            const searchContainer = document.querySelector(".leaflet-control-geosearch .results");
            if (searchContainer) {
                searchContainer.style.background = "white";
                searchContainer.style.color = "black";
                searchContainer.style.border = "0px";
            }

            const searchInput = document.querySelector(".leaflet-control-geosearch input");
            if (searchInput) {
                searchInput.style.background = "white";
                searchInput.style.color = "black";
                searchInput.style.border = "0px";
                searchInput.style.fontSize = "0.85rem";
            }
            const style = document.createElement("style");
            style.innerHTML = `.leaflet-control-geosearch input::placeholder { color: gray !important; opacity: 1; }`;
            document.head.appendChild(style);
        }, 100);

        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
};

const MapSelector = () => {
    const [drawnGeoJson, setDrawnGeoJson] = useState(null);
    const [previousGeoJson, setPreviousGeoJson] = useState(null);
    const [regionInfo, setRegionInfo] = useState(null);
    const [progress, setProgress] = useState(0);
    const [outputReceived, setOutputReceived] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressInfo, setProgressInfo] = useState(null);
    const [isGreaterThan550] = useMediaQuery("(min-width: 550px)");
    const toast = useToast();
    const toast_id = 'toasting';
    const featureGroupRef = useRef();

    const MAX_AREA_KM2 = 20;

    const clearData = () => {
        setDrawnGeoJson(null);
        setPreviousGeoJson(null);
        setRegionInfo(null);
        setProgress(0);
        setOutputReceived(false);
        setLoading(false);
        setProgressInfo(null);
    };

    const displayToast = (message) => {
        !toast.isActive(toast_id) && toast({
            id: toast_id,
            title: 'Action Failed!',
            description: message,
            status: 'error',
            duration: isGreaterThan550 ? 4000 : 3000,
            variant: 'solid',
            isClosable: true,
            position: 'top',
            containerStyle: isGreaterThan550 ? {
                minWidth: 'lg',
                maxWidth: 'lg',
                fontSize: 'lg'
            } : {},
        });
    };

    const fetchPixelData = async () => {
        if (!drawnGeoJson || !drawnGeoJson.geometry || !drawnGeoJson.geometry.coordinates.length) {
            displayToast("Please select an AOI (Area of Interest) on the map to proceed");
            return;
        }
        setProgress(0);
        setProgressInfo("Creating GeoJSON File...");
        setLoading(true);

        let obj = {};
        obj.area = calculateAreaKm2(drawnGeoJson);
        let currentDate = new Date();
        let pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - 15);
        let formatDate = (date) => date.toISOString().split('T')[0];
        obj.satelliteDate = `${formatDate(pastDate)} to ${formatDate(currentDate)}`;

        try {
            await new Promise((resolve) => setTimeout(resolve, 700));
            setProgress(5);
            await new Promise((resolve) => setTimeout(resolve, 700));
            setProgress(10);
            setProgressInfo("GeoJSON prepared. Initiating data fetch...");

            const ws = new WebSocket("ws://localhost:8001/ws");

            let sentinel1Finished = false;
            let sentinel2Finished = false;

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "sentinel1_finished" && !sentinel1Finished) {
                    sentinel1Finished = true;
                    if (sentinel2Finished) {
                        gradualProgress(35, 50, "All satellite data retrieved. Combining data...");
                    } else {
                        gradualProgress(20, 35, "Sentinel-1 data retrieved. Awaiting Sentinel-2 data...");
                    }
                } else if (data.type === "sentinel2_finished" && !sentinel2Finished) {
                    sentinel2Finished = true;
                    if (sentinel1Finished) {
                        gradualProgress(35, 50, "All satellite data retrieved. Combining data...");
                    } else {
                        gradualProgress(20, 35, "Sentinel-2 data retrieved. Awaiting Sentinel-1 data...");
                    }
                }
            };

            const response = await fetch("http://localhost:8001/api/fetch-indices/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(drawnGeoJson),
            });

            if (!sentinel1Finished || !sentinel2Finished) {
                gradualProgress(10, 20, "Fetching Sentinel-1 and Sentinel-2 data...");
            }

            const data = await response.json();

            if (!sentinel1Finished || !sentinel2Finished) {
                gradualProgress(50, 60, "All satellite data retrieved. Combining data...");
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            gradualProgress(60, 70, "Combining Sentinel-1 and Sentinel-2 data...");
            await new Promise((resolve) => setTimeout(resolve, 700));

            gradualProgress(70, 85, "Running deep learning model for mapping...");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            gradualProgress(85, 100, "Processing complete. Rendering results...");
            setRegionInfo(data);
            setOutputReceived(true);

            ws.close();

            // add data into obj
            setRegionInfo(obj)
        } catch (error) {
            displayToast(error.message || "An unexpected error occurred.");
            setRegionInfo(null)
            setOutputReceived(false)
            set
        } finally {
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
                setProgressInfo("Ready for next request.");
            }, 1000);
        }
    };

    const gradualProgress = (start, end, message) => {
        let progressValue = start;
        setProgressInfo(message);

        const interval = setInterval(() => {
            progressValue += 2;
            setProgress(progressValue);
            if (progressValue >= end) clearInterval(interval);
        }, 200);
    };

    const calculateAreaKm2 = (geoJson) => {
        const areaM2 = area(geoJson);
        return areaM2 / 1_000_000;
    };

    const onCreated = (e) => {
        const layer = e.layer;
        const drawnGeoJson = layer.toGeoJSON();
        const areaKm2 = calculateAreaKm2(drawnGeoJson);

        console.log("User Drawn GeoJSON:", drawnGeoJson);
        console.log("Area (km²):", areaKm2);

        if (areaKm2 > MAX_AREA_KM2) {
            displayToast(`The drawn area (${areaKm2.toFixed(2)} km²) exceeds the maximum limit of ${MAX_AREA_KM2} km². Please draw a smaller region.`);
            e.layer.remove();
            setDrawnGeoJson(null);
            setRegionInfo(null)
            setPreviousGeoJson(null);
        } else {
            setDrawnGeoJson(drawnGeoJson);
            setPreviousGeoJson(drawnGeoJson);
        }
    };

    const onEdited = (e) => {
        const layers = e.layers;
        const fg = featureGroupRef.current;

        layers.eachLayer((layer) => {
            const updatedGeoJson = layer.toGeoJSON();
            const areaKm2 = calculateAreaKm2(updatedGeoJson);

            console.log("Edited GeoJSON:", updatedGeoJson);
            console.log("Area (km²):", areaKm2);
            console.log("Previous GeoJSON:", previousGeoJson);

            if (areaKm2 > MAX_AREA_KM2) {
                displayToast(`The edited area (${areaKm2.toFixed(2)} km²) exceeds the maximum limit of ${MAX_AREA_KM2} km². Reverting to previous shape.`);
                if (previousGeoJson && fg) {
                    setDrawnGeoJson(previousGeoJson);
                    fg.clearLayers();
                    const revertedLayer = L.geoJSON(previousGeoJson, {
                        onEachFeature: (feature, l) => {
                            l.editing = new L.EditToolbar.Edit(fg._map, { featureGroup: fg });
                        }
                    });
                    revertedLayer.addTo(fg);
                    console.log("Reverted layer added to map");
                } else {
                    layer.remove();
                    setDrawnGeoJson(null);
                    console.log("No previous GeoJSON, removed layer");
                }
            } else {
                setDrawnGeoJson(updatedGeoJson);
                setPreviousGeoJson(updatedGeoJson);
            }
        });
    };

    return (
        <Flex justifyContent={'center'} bg={'gray.300'} fontFamily="Signika Negative, serif" pt={'8rem'} pb={'4rem'} width="100vw" minHeight="100vh">
            <Flex direction={'column'} width={'80%'} alignItems={'center'} textAlign={'justify'}>
                <Text color={'black'} fontWeight={'bold'} fontSize={'3xl'} pb={2}>Analyze Ragi Coverage</Text>
                <Flex height={'10vh'} width={'100%'} direction={'column'} alignItems={'center'} justifyContent={'center'}>
                    {!loading && !outputReceived && (
                        <>
                            <Text fontSize="xl" fontWeight="medium" color="black">Select a Region to Identify Ragi Growing Areas</Text>
                            <Text fontSize="md" color="gray.700">Use the search bar and draw a polygon/rectangle to select your area (max {MAX_AREA_KM2} km²).</Text>
                        </>
                    )}
                    {!loading && outputReceived && (
                        <>
                            <Text fontSize="xl" fontWeight="medium" color="black">Data Analysis Successfully Completed!</Text>
                        </>
                    )}
                    {loading && (
                        <VStack width={'inherit'} color={'black'} mt={1} align="start" spacing={1}
                            style={{
                                opacity: progress > 0 ? 1 : 0,
                                transition: "opacity 0.25s ease-in-out"
                            }}
                        >
                            <Text fontSize="lg" fontWeight="bold">Processing Data</Text>
                            <Box w="100%">
                                <Progress value={progress} size="lg" borderRadius={'1rem'} variant="subtle" bg={'green.900'} hasStripe isAnimated colorScheme="green" />
                                <Text mt={1} fontSize="md" textAlign="right">{progress}%</Text>
                            </Box>
                            <Text fontSize="md" color="gray.800">
                                {progressInfo}
                            </Text>
                        </VStack>
                    )}
                </Flex>
                <Flex width={'100vw'} justifyContent={'space-evenly'}>
                    <Box mt={5} zIndex={1} width="70vw" height="70vh" border="1px solid gray" borderRadius="0.5rem" overflow="hidden">
                        <MapContainer id="map" center={[12.97, 77.59]} zoom={10} style={{ width: "100%", height: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <SearchField />
                            <FeatureGroup ref={featureGroupRef}>
                                <EditControl
                                    position="topright"
                                    onCreated={onCreated}
                                    onEdited={onEdited}
                                    onDeleted={() => {
                                        setDrawnGeoJson(null);
                                        setPreviousGeoJson(null);
                                    }}
                                    draw={{ polygon: true, rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false }}
                                />
                            </FeatureGroup>
                        </MapContainer>
                    </Box>
                    <Flex direction={'column'}>
                        <Box p="1rem" mt="1.25rem" color="gray.700" w="22vw" borderRadius="10px" boxShadow="0px 0px 10px rgba(0,0,0,0.3)">
                            <Text fontSize="lg" pb="0.5rem" textAlign="center" fontWeight="bold">Region Details</Text>
                            {loading ? (
                                <Flex justifyContent={'center'} alignItems={'center'}>
                                    <Text textAlign="center" fontWeight={600} color="blue.500">Fetching region details</Text>
                                    <CircularProgress isIndeterminate color="blue.500" size={"1.5rem"} ml={2} />
                                </Flex>
                            ) : outputReceived && regionInfo ? (
                                <>
                                    <Text><b>Area:</b> {regionInfo?.area} km²</Text>
                                    <Text><b>Satellite Data Duration:</b> {regionInfo?.satelliteDuration}</Text>
                                    <Text><b>Ragi Coverage:</b> {regionInfo?.ragiCoverage}%</Text>
                                    <Text><b>Non-Ragi Coverage:</b> {regionInfo?.nonRagiCoverage}%</Text>
                                </>
                            ) : (
                                <Text>No region selected. Please choose a region to continue.</Text>
                            )}
                        </Box>
                        <Button mt={3} _hover={{ border: "1px solid green", bg: "green.300" }} colorScheme="green" onClick={outputReceived ? clearData : fetchPixelData} isDisabled={loading} _disabled={{ bg: 'green.200', cursor: 'not-allowed' }} rightIcon={loading && <CircularProgress isIndeterminate color="green.500" size={"1.5rem"} mr={2} />}>
                            {loading ? (
                                "Analyzing..."
                            ) : outputReceived ? (
                                "Start New Analysis ?"
                            ) : (
                                "Analyze Ragi Coverage"
                            )}
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default MapSelector;