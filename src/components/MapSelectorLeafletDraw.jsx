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
import axiosInstance from "../axiosInstance";
import { FaDownload } from "react-icons/fa"
import { motion } from "framer-motion";

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
    const [displayProgress, setDisplayProgress] = useState(0)
    const [outputReceived, setOutputReceived] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progressInfo, setProgressInfo] = useState(null);
    const [isGreaterThan550] = useMediaQuery("(min-width: 550px)");
    const [sentinel1, setSentinel1] = useState(null)
    const [sentinel2, setSentinel2] = useState(null)
    const toast = useToast();
    const toast_id = 'toasting';
    const featureGroupRef = useRef();

    const MotionButton = motion(Button);
    const MAX_AREA_KM2 = 20;

    const clearData = () => {
        setDrawnGeoJson(null);
        setPreviousGeoJson(null);
        setRegionInfo(null);
        setProgress(0);
        setDisplayProgress(0);
        setOutputReceived(false);
        setLoading(false);
        setProgressInfo(null);
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
        }
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
        // Step 1: Creating GeoJSON Data (handled locally, 0% to 10%)
        if (!drawnGeoJson || !drawnGeoJson.geometry || !drawnGeoJson.geometry.coordinates.length) {
            displayToast("Please select an AOI (Area of Interest) on the map to proceed");
            return;
        }
        setLoading(true);
        setProgress(0);
        setDisplayProgress(0);
        setProgressInfo("Preparing request...");
        gradualProgress(0, 10, "Creating GeoJSON Data...");
    
        const ws = new WebSocket("ws://localhost:8000/ws/progress");
    
        let resolveWsPromise; 
        const wsPromise = new Promise((resolve, reject) => {
            resolveWsPromise = resolve;
    
            ws.onopen = () => {
                console.log("WebSocket connection established");
            };
    
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WebSocket message:", data);
    
                if (data.type === "progress") {
                    gradualProgress(data.startProgress, data.endProgress, data.message);
                } else if (data.type === "error") {
                    console.log("Inside data type error");
                    reject(new Error(data.message || "WebSocket communication error"));
                }
            };
    
            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(new Error("WebSocket connection failed"));
            };
    
            ws.onclose = () => {
                console.log("WebSocket connection closed");
            };
        });
    
        try {
            const response = await axiosInstance.post("/fetch-indices/", drawnGeoJson);
            console.log(response.data);
            setSentinel1(response.data.s1);
            setSentinel2(response.data.s2);
    
            resolveWsPromise("WebSocket progress completed");
            await Promise.all([Promise.resolve(response), wsPromise]);
    
            // Step 6: Rendering Data on Frontend (90% to 100%)
            gradualProgress(90, 99, "Rendering Results on Frontend...");
            const areaKm2 = calculateAreaKm2(drawnGeoJson);
            const currentDate = new Date();
            const pastDate = new Date();
            pastDate.setDate(currentDate.getDate() - 15);
            const formatDate = (date) => date.toISOString().split('T')[0];
    
            let obj = {
                area: areaKm2.toFixed(2),
                satelliteDate: `${formatDate(pastDate)} to ${formatDate(currentDate)}`,
            }
            
            setRegionInfo(obj);
            setOutputReceived(true);
            ws.close();
        } catch (error) {
            console.log("error:", error);
            displayToast(error.message || "An unexpected error occurred.");
            setRegionInfo(null);
            setOutputReceived(false);
            ws.close();
        } finally {
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
                setDisplayProgress(0);
                setProgressInfo("Ready for next request.");
            }, 1000);
        }
    };

    const gradualProgress = (start, end, message) => {
        setProgressInfo(message);
        let startTime;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const duration = 1500;

            let progress = start + ((end - start) * (elapsed / duration));

            if (progress >= end) {
                progress = end;
            }

            setProgress(progress);
            setDisplayProgress(Math.round(progress));
            if (progress < end) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
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

    const downloadJSON = (data, filename) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const downloadSentinel1Data = () => sentinel1 ? downloadJSON(sentinel1, "sentinel_1_data.json") : displayToast('Error Downloading Sentinel 1 Data')
    const downloadSentinel2Data = () => sentinel2 ? downloadJSON(sentinel2, "sentinel_2_data.json") : displayToast('Error Downloading Sentinel 2 Data')

    return (
        <Flex justifyContent={'center'} bgGradient="linear(to-b, #F4FFC3, #E4E4D0)" fontFamily="Signika Negative, serif" pt={'8rem'} pb={'4rem'} width="100vw" minHeight="100vh">
            <Flex direction={'column'} width={'80%'} alignItems={'center'} textAlign={'justify'}>
                <Text color="#2C3E50" fontWeight={'bold'} fontSize={'3xl'} pb={2}>Analyze Ragi Coverage</Text>
                <Flex height={'10vh'} width={'100%'} direction={'column'} alignItems={'center'} justifyContent={'center'}>
                    {!loading && !outputReceived && (
                        <>
                            <Text fontSize="xl" fontWeight="medium" color="#2C3E50">Select a Region to Identify Ragi Growing Areas</Text>
                            <Text fontSize="md" color="gray.700">Use the search bar and draw a polygon/rectangle to select your area (max {MAX_AREA_KM2} km²).</Text>
                        </>
                    )}
                    {!loading && outputReceived && (
                        <>
                            <Text fontSize="xl" fontWeight="medium" color="#2C3E50">Data Analysis Successfully Completed!</Text>
                        </>
                    )}
                    {loading && (
                        <VStack width={'inherit'} color={'black'} mt={1} align="start" spacing={1} style={{ opacity: progress > 0 ? 1 : 0, transition: "opacity 0.25s ease-in-out" }}>
                            <Text fontSize="lg" fontWeight="bold">Processing Data</Text>
                            <Box w="100%">
                                <Progress value={progress} size="lg" borderRadius={'1rem'} variant="subtle" bg={'green.900'} hasStripe isAnimated colorScheme="green" sx={{ transition: "width 1.5s ease-in-out" }} />
                                <Flex direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                                    <Text fontSize="md" color="gray.800">{progressInfo}</Text>
                                    <Text mt={1} fontSize="md" textAlign="right">{displayProgress}%</Text>
                                </Flex>
                            </Box>
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
                    <Flex direction={'column'} w="22vw">
                        <Box textAlign={'left'} p="1rem" mt="1.25rem" color="gray.700" w="22vw" borderRadius="10px" boxShadow="0px 0px 10px rgba(0,0,0,0.3)" bg="#FDF6EC">
                            <Text fontSize="lg" pb="0.5rem" textAlign="center" fontWeight="bold" >Region Details</Text>
                            {loading ? (
                                <Flex justifyContent={'center'} alignItems={'center'}>
                                    <Text textAlign="center" fontWeight={600} color="blue.500">Fetching Region Details</Text>
                                    <CircularProgress isIndeterminate color="blue.500" size={"1.5rem"} ml={2} />
                                </Flex>
                            ) : outputReceived && regionInfo ? (
                                <>
                                    <Text><b>Area:</b> {regionInfo?.area} km²</Text>
                                    <Text><b>Satellite Data Duration:</b> {regionInfo?.satelliteDate}</Text>
                                    <Text><b>Ragi Coverage:</b> {regionInfo?.ragiCoverage || 0}%</Text>
                                    <Text><b>Non-Ragi Coverage:</b> {regionInfo?.nonRagiCoverage || 0}%</Text>
                                </>
                            ) : (
                                <Text color="#2C3E50">No region selected. Please choose a region to continue.</Text>
                            )}
                        </Box>
                        {outputReceived && regionInfo && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                                <MotionButton w={'full'} mt={3} _hover={{  border: "none", bg: "blue.300" }} _focus={{outline:"0"}} onClick={downloadSentinel1Data} colorScheme="blue" rightIcon={<FaDownload color="blue.500" size={"1rem"} />}>
                                    Download Sentinel 1 JSON Data
                                </MotionButton>

                                <MotionButton w={'full'} mt={3} _hover={{  border: "none", bg: "blue.300" }} _focus={{outline:"0"}} onClick={downloadSentinel2Data} colorScheme="blue" rightIcon={<FaDownload color="blue.500" size={"1rem"} />}>
                                    Download Sentinel 2 JSON Data
                                </MotionButton>
                            </motion.div>
                        )}
                        <Button mt={3} _hover={{ border: "none", bg: "green.300" }} _focus={{outline:"0"}} colorScheme="green" onClick={outputReceived ? clearData : fetchPixelData} isDisabled={loading} _disabled={{ bg: 'green.200', cursor: 'not-allowed' }} rightIcon={loading && <CircularProgress isIndeterminate color="green.500" size={"1.5rem"} mr={2} />}>
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