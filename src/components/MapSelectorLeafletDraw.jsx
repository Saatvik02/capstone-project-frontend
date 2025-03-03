import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { Box, Text } from "@chakra-ui/react";

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
    const [geoData, setGeoData] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [drawnGeoJson, setDrawnGeoJson] = useState(null);

    useEffect(() => {
        fetch("/data/india_districts.geojson")
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error("Failed to load GeoJSON:", err));
    }, []);

    const fetchPixelData = async (geoJsonData) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/fetch-indices/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geoJsonData),
            });
            const data = await response.json();
        } catch (error) {
            console.error("Error fetching pixel data:", error);
        }
    };

    const onCreated = (e) => {
        const layer = e.layer;
        const drawnGeoJson = layer.toGeoJSON();
        console.log("User Drawn GeoJSON:", drawnGeoJson);
        setDrawnGeoJson(drawnGeoJson);
        fetchPixelData(drawnGeoJson);
    };

    return (
        <Box height={'100vh'} mt={'5'} width={'100vw'} display={'flex'} bg={'gray.300'} justifyContent={'center'} alignItems={'center'}>
            <Box zIndex={1} width="80vw" height="70vh" margin="auto" border="1px solid black" borderRadius="10px" overflow="hidden">
                <MapContainer id="map" center={[12.97, 77.59]} zoom={10} style={{ width: "100%", height: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SearchField />
                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={onCreated}
                            draw={{ polygon: true, rectangle: true, circle: false, circlemarker: false, marker: false, polyline: false }}
                        />
                    </FeatureGroup>
                    {geoData && (
                        <GeoJSON
                            data={geoData}
                            style={(feature) => ({
                                fillColor: selectedFeature && selectedFeature.properties.NAME_2 === feature.properties.NAME_2 ? "red" : "white",
                                weight: 1,
                                color: "white",
                                fillOpacity: 0.1,
                            })}
                        />
                    )}
                </MapContainer>
                {selectedFeature && (
                    <Text mt={4} textAlign="center" fontSize="lg" fontWeight="bold">
                        Selected District: {selectedFeature.properties.NAME_2}
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default MapSelector;