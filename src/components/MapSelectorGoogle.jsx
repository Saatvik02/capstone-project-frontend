import { useState } from "react";
import { GoogleMap, useJsApiLoader, DrawingManager } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 12.97, lng: 77.59 }; // Default center (e.g., Bangalore)

const MapSelector = ({ onRegionSelect }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: ["drawing"], // Include the drawing library
  });

  const [selectedGeoJSON, setSelectedGeoJSON] = useState(null);

  const onPolygonComplete = (polygon) => {
    const paths = polygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));

    // Convert to GeoJSON format
    const geoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [paths.map(({ lng, lat }) => [lng, lat])], // Convert to GeoJSON format
      },
    };

    setSelectedGeoJSON(geoJson);
    onRegionSelect(geoJson); // Pass to parent component
    console.log("Selected GeoJSON:", JSON.stringify(geoJson));
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
        <DrawingManager
          options={{
            drawingControl: true,
            drawingControlOptions: {
              position: window.google.maps.ControlPosition.TOP_CENTER,
              drawingModes: ["polygon"], // Allow users to draw polygons only
            },
            polygonOptions: {
              fillColor: "red",
              fillOpacity: 0.3,
              strokeWeight: 1,
            },
          }}
          onPolygonComplete={onPolygonComplete}
        />
      </GoogleMap>

      {/* Display GeoJSON result */}
      {selectedGeoJSON && (
        <div style={{ overflowY: "auto", maxHeight: "150px", border: "1px solid #ddd", padding: "10px", marginTop: "10px" }}>
          <pre>{JSON.stringify(selectedGeoJSON, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MapSelector;
