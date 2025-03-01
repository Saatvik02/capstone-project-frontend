import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const MapSelector = () => {
    const [geoData, setGeoData] = useState(null);
    const [bandVal, setBandVal] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);

    // Load GeoJSON from public/data/
    useEffect(() => {
        fetch("/data/india_taluk.geojson")
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error("Failed to load GeoJSON:", err));
    }, []);

    // Handle district selection
    const onEachFeature = (feature, layer) => {
        layer.on("click", () => {
            setSelectedFeature(feature);    
            console.log("Selected Region GeoJSON:", feature.geometry)
            fetchPixelData(feature.geometry)
        });
    };
    const handleCreated = (e) => {
        const { layer } = e;
        const geoJson = layer.toGeoJSON(); // Convert drawn shape to GeoJSON
        setSelectedGeoJSON(geoJson);
        onRegionSelect(geoJson); // Pass GeoJSON to parent component
        console.log("Selected GeoJSON:", JSON.stringify(geoJson));
      };

    const fetchPixelData = async(geoJsonData) => {
        try {
            setBandVal("loading...")
            const response = await fetch("http://127.0.0.1:8000/api/fetch-bands/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geoJsonData)
            });
            const data = await response.json();
            console.log("Pixel Data:", data.pixels);
            setBandVal(data.pixels)
        } catch (error) {
            console.error("Error fetching pixel data:", error);
        }
    }

    return (
        <>
            <div style={{ width: "100%", height: "500px", margin: "auto", border: "2px solid #ddd", borderRadius: "10px", overflow: "hidden" }}>
                <MapContainer 
                    center={[12.97, 77.59]} 
                    zoom={5} 
                    style={{ width: "100%", height: "100%" }}
                    // crs={L.CRS.EPSG4326}  // Force Leaflet to use WGS84 (same as your GeoJSON)
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {geoData && (
                        <GeoJSON
                            data={geoData}
                            onEachFeature={onEachFeature}
                            style={(feature) => ({
                                fillColor: selectedFeature && selectedFeature.properties.NAME_2 === feature.properties.NAME_2 ? "red" : "white",
                                weight: 1,
                                color: "white",
                                fillOpacity: 0.1
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
            <div style={{
                color:"black",
                marginTop: "10px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "500px",
                overflowY: "auto",
                backgroundColor: "#f9f9f9",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
            }}>
                <strong>Band values for each pixel in the region:</strong>
                <pre>{JSON.stringify(bandVal, null, 2)}</pre>
            </div>
        </>
    );
};

export default MapSelector;
