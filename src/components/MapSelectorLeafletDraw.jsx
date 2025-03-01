import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

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
            searchLabel: "Enter location...",
            keepResult: true,
        });
    
        map.addControl(searchControl);
    
        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);

    return null;
};


const MapSelector = () => {
    const [geoData, setGeoData] = useState(null);
    const [bandVal, setBandVal] = useState(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [drawnGeoJson, setDrawnGeoJson] = useState(null);

    useEffect(() => {
        fetch("/data/india_districts.geojson")
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error("Failed to load GeoJSON:", err));
    }, []);

    // Handle district selection
    const onEachFeature = (feature, layer) => {
        layer.on("click", () => {
            setSelectedFeature(feature);
            console.log("Selected Region GeoJSON:", feature.geometry);
            fetchPixelData(feature.geometry);
        });
    };

    const fetchPixelData = async (geoJsonData) => {
        try {
            setBandVal("loading...");
            const response = await fetch("http://127.0.0.1:8000/api/fetch-bands/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geoJsonData),
            });
            const data = await response.json();
            console.log("Pixel Data:", data.pixels);
            console.log("Image: ", data.image)
            setBandVal(data.pixels);
            setImgSrc(data.image)
        } catch (error) {
            console.error("Error fetching pixel data:", error);
            setBandVal("Error fetching pixel data");
        }
    };

    // Function to handle when a user draws a new region
    const onCreated = (e) => {
        const layer = e.layer;
        const drawnGeoJson = layer.toGeoJSON();
        console.log("User Drawn GeoJSON:", drawnGeoJson);
        setDrawnGeoJson(drawnGeoJson);
        fetchPixelData(drawnGeoJson);
    };

    return (
        <>
            <div
                style={{
                    width: "80vw",
                    height: "500px",
                    margin: "auto",
                    border: "2px solid black",
                    borderRadius: "10px",
                    overflow: "hidden",
                }}
            >
                <MapContainer id="map" center={[12.97, 77.59]} zoom={10} style={{ width: "100%", height: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Feature Group for drawing */}
                    <SearchField/>

                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onCreated={onCreated}
                            draw={{
                                polygon: true,
                                rectangle: true,
                                circle: false,
                                circlemarker: false,
                                marker: false,
                                polyline: false,
                            }}
                        />
                    </FeatureGroup>

                    {geoData && (
                        <GeoJSON
                            data={geoData}
                            // onEachFeature={onEachFeature}
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
                    <div style={{ marginTop: "10px", textAlign: "center", fontSize: "18px" }}>
                        Selected District: <b>{selectedFeature.properties.NAME_2}</b>
                    </div>
                )}
            </div>

            {/* <div
                style={{
                    color: "black",
                    marginTop: "10px",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    height: "500px",
                    overflowY: "auto",
                    backgroundColor: "#f9f9f9",
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                }}
            >
                <strong>Band values for each pixel in the region:</strong>
                <pre>{JSON.stringify(bandVal, null, 2)}</pre>
            </div> */}
            {imgSrc && <img src={imgSrc} alt="Sentinel-2" />}
        </>
    );
};

export default MapSelector;
