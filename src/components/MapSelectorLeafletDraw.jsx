import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import {
  Text,
  Progress,
  Box,
  Flex,
  VStack,
  Button,
  CircularProgress,
  useToast,
  useMediaQuery,
  Select,
} from "@chakra-ui/react";
import area from "@turf/area";
import axiosInstance from "../axiosInstance";
import { FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";
import * as Turf from "@turf/turf"; // Import Turf.js for point-in-polygon checks

const SearchField = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      console.log("Map not yet initialized");
      return;
    }

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
      const searchContainer = document.querySelector(
        ".leaflet-control-geosearch .results"
      );
      if (searchContainer) {
        searchContainer.style.background = "white";
        searchContainer.style.color = "black";
        searchContainer.style.border = "0px";
      }

      const searchInput = document.querySelector(
        ".leaflet-control-geosearch input"
      );
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

const MapContent = forwardRef(
  (
    {
      setDrawnGeoJson,
      setPreviousGeoJson,
      setRegionInfo,
      displayToast,
      MAX_AREA_KM2,
      calculateAreaKm2,
      predictionData,
      setFlag,
      previousGeoJson,
    },
    ref
  ) => {
    const map = useMap();
    const featureGroupRef = useRef();

    // Expose clearLayers method via ref
    useImperativeHandle(ref, () => ({
      clearLayers: () => {
        if (featureGroupRef.current) {
          featureGroupRef.current.clearLayers();
        }
      },
    }));

    const analyzeTileColors = async (geoJson) => {
      const bounds = L.geoJSON(geoJson).getBounds();

      const zoom = map.getZoom() || 10;

      const tileSize = 256;
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      const tileSW = latLngToTileCoords(southWest, zoom);
      const tileNE = latLngToTileCoords(northEast, zoom);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context for canvas!");
        return false;
      }

      const geoJsonLayer = L.geoJSON(geoJson);

      for (let x = Math.floor(tileSW.x); x <= Math.ceil(tileNE.x); x++) {
        for (let y = Math.floor(tileNE.y); y <= Math.ceil(tileSW.y); y++) {
          const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

          const img = new Image();
          img.crossOrigin = "Anonymous";
          await new Promise((resolve, reject) => {
            img.onload = () => {
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load tile: ${tileUrl}`);
              reject();
            };
            img.src = tileUrl;
          });

          canvas.width = tileSize;
          canvas.height = tileSize;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, tileSize, tileSize).data;

          for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            const pixelX = (i / 4) % tileSize;
            const pixelY = Math.floor(i / 4 / tileSize);
            const tilePoint = L.point(
              x * tileSize + pixelX,
              y * tileSize + pixelY
            );
            const latLng = L.CRS.EPSG3857.pointToLatLng(tilePoint, zoom);

            if (
              geoJsonLayer.getBounds().contains(latLng) &&
              Turf.booleanPointInPolygon([latLng.lng, latLng.lat], geoJson)
            ) {
              const isGreen = g > r && g > b && g > 80 && Math.abs(r - b) < 50;
              if (!isGreen) {
                console.log(
                  `Non-green pixel detected at (${pixelX}, ${pixelY}) in tile (${x}, ${y}) - RGB: (${r}, ${g}, ${b})`
                );
                // displayToast("The selected region contains non-grassland features (e.g., water, buildings). Please select a grassland-only area.");
                return false;
              }
            }
          }
        }
      }

      console.log("All tiles analyzed - region is grassland-only");
      return true;
    };

    const latLngToTileCoords = (latLng, zoom) => {
      const point = map.project(latLng, zoom);
      const tilePoint = point.divideBy(256).floor();
      return tilePoint;
    };

    const onCreated = async (e) => {
      const layer = e.layer;
      const drawnGeoJson = layer.toGeoJSON();
      const areaKm2 = calculateAreaKm2(drawnGeoJson);

      if (areaKm2 > MAX_AREA_KM2) {
        displayToast(
          `The drawn area (${areaKm2.toFixed(
            2
          )} km²) exceeds the maximum limit of ${MAX_AREA_KM2} km².`
        );
        e.layer.remove();
        setDrawnGeoJson(null);
        setRegionInfo(null);
        setPreviousGeoJson(null);
      } else {
        // const isGrasslandOnly = await analyzeTileColors(drawnGeoJson);
        const isGrasslandOnly = true;
        if (isGrasslandOnly) {
          setDrawnGeoJson(drawnGeoJson);
          setPreviousGeoJson(drawnGeoJson);
        } else {
          setFlag(false);
          setDrawnGeoJson(drawnGeoJson);
          setPreviousGeoJson(drawnGeoJson);
          // e.layer.remove();
          // setDrawnGeoJson(null);
          // setRegionInfo(null);
          // setPreviousGeoJson(null);
        }
      }
    };

    const onEdited = (e) => {
      const layers = e.layers;
      const fg = featureGroupRef.current;

      layers.eachLayer((layer) => {
        const updatedGeoJson = layer.toGeoJSON();
        const areaKm2 = calculateAreaKm2(updatedGeoJson);

        if (areaKm2 > MAX_AREA_KM2) {
          displayToast(
            `The edited area (${areaKm2.toFixed(
              2
            )} km²) exceeds the maximum limit of ${MAX_AREA_KM2} km². Reverting to previous shape.`
          );
          if (previousGeoJson && fg) {
            setDrawnGeoJson(previousGeoJson);
            fg.clearLayers();
            const revertedLayer = L.geoJSON(previousGeoJson, {
              onEachFeature: (feature, l) => {
                l.editing = new L.EditToolbar.Edit(fg._map, {
                  featureGroup: fg,
                });
              },
            });
            revertedLayer.addTo(fg);
          } else {
            layer.remove();
            setDrawnGeoJson(null);
          }
        } else {
          setDrawnGeoJson(updatedGeoJson);
          setPreviousGeoJson(updatedGeoJson);
        }
      });
    };

    return (
      <>
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onEdited={onEdited}
            onDeleted={() => {
              setDrawnGeoJson(null);
              setPreviousGeoJson(null);
            }}
            draw={{
              polygon: true,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
        {predictionData && (
          <GeoJSON
            data={predictionData}
            pointToLayer={(feature, latlng) => {
              const color =
                feature.properties.prediction === 1 ? "green" : "red";
              return L.circleMarker(latlng, {
                radius: 4,
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
              });
            }}
          />
        )}
      </>
    );
  }
);

// Main MapSelector component
const MapSelector = () => {
  const [drawnGeoJson, setDrawnGeoJson] = useState(null);
  const [previousGeoJson, setPreviousGeoJson] = useState(null);
  const [regionInfo, setRegionInfo] = useState(null);
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [outputReceived, setOutputReceived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);
  const [isGreaterThan550] = useMediaQuery("(min-width: 550px)");
  const [sentinel1, setSentinel1] = useState(null);
  const [sentinel2, setSentinel2] = useState(null);
  const toast = useToast();
  const toast_id = "toasting";
  const [predictionData, setPredictionData] = useState(null);
  const mapContentRef = useRef();
  const [flag, setFlag] = useState(true);

  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const years = [2024, 2023, 2022, 2021, 2020, 2019];
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const MotionButton = motion(Button);
  const MAX_AREA_KM2 = 20;

  const displayToast = (message) => {
    !toast.isActive(toast_id) &&
      toast({
        id: toast_id,
        title: "Action Failed!",
        description: message,
        status: "error",
        duration: isGreaterThan550 ? 4000 : 3000,
        variant: "solid",
        isClosable: true,
        position: "top",
        containerStyle: isGreaterThan550
          ? { minWidth: "lg", maxWidth: "lg", fontSize: "lg" }
          : {},
      });
  };

  useEffect(() => {
    const calculateEndDate = () => {
      const startDate = new Date(startYear, startMonth - 1, 1);
      const predictedDate = new Date(startDate);
      predictedDate.setMonth(startDate.getMonth() + 5);

      const predictedYear = predictedDate.getFullYear();
      const predictedMonth = predictedDate.getMonth() + 1;

      let lastDay;
      switch (predictedMonth) {
        case 2:
          lastDay = 28;
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          lastDay = 30;
          break;
        default:
          lastDay = 31;
      }
      if (predictedYear != endYear || predictedMonth != endMonth) {
        displayToast(
          `The selected date range is invalid. Please select a range of 6 Months`
        );
      }

      setStartDate(`${startYear}-${startMonth}-01`);
      setEndDate(`${endYear}-${endMonth}-${lastDay}`);
    };
    if (startYear && startMonth && endYear && endMonth) {
      calculateEndDate();
    }
  }, [startYear, endYear, startMonth, endMonth]);

  const clearData = () => {
    setStartDate("");
    setEndDate("");
    setStartMonth("");
    setEndMonth("");
    setStartYear("");
    setEndYear("");
    setDrawnGeoJson(null);
    setPreviousGeoJson(null);
    setRegionInfo(null);
    setProgress(0);
    setDisplayProgress(0);
    setOutputReceived(false);
    setLoading(false);
    setProgressInfo(null);
    setPredictionData(null);
    if (mapContentRef.current) {
      mapContentRef.current.clearLayers();
    }
  };

  const fetchPixelData = async (flag) => {
    if (
      !drawnGeoJson ||
      !drawnGeoJson.geometry ||
      !drawnGeoJson.geometry.coordinates.length
    ) {
      displayToast(
        "Please select an AOI (Area of Interest) on the map to proceed"
      );
      return;
    }

    if (!startMonth || !endMonth || !startYear || !endYear) {
      displayToast("Please select a date range to proceed");
      return;
    }

    setLoading(true);
    setProgress(0);
    setDisplayProgress(0);
    setProgressInfo("Preparing request...");
    gradualProgress(0, 10, "Creating GeoJSON Data...");

    // const ws = new WebSocket("ws://localhost:8000/ws/progress");
    const ws = new WebSocket("wss://backend.agroscope.site/ws/progress");

    let resolveWsPromise;
    const wsPromise = new Promise((resolve, reject) => {
      resolveWsPromise = resolve;

      ws.onopen = () => console.log("WebSocket connection established");
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket message:", data);
        if (data.type === "progress") {
          gradualProgress(data.startProgress, data.endProgress, data.message);
        } else if (data.type === "error") {
          reject(new Error(data.message || "WebSocket communication error"));
        }
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(new Error("WebSocket connection failed"));
      };
      ws.onclose = () => console.log("WebSocket connection closed");
    });

    try {
      const response = await axiosInstance.post("/fetch-indices/", {
        geojson: drawnGeoJson,
        flag: flag,
        startDate: startDate,
        endDate: endDate,
      });
      console.log(response.data);
      setPredictionData(response.data.output.map);
      setSentinel1(response.data.results.s1);
      setSentinel2(response.data.results.s2);

      const metrics = response.data.output.metrics;

      resolveWsPromise("WebSocket progress completed");
      await Promise.all([Promise.resolve(response), wsPromise]);

      gradualProgress(90, 99, "Rendering Results on Frontend...");
      const areaKm2 = calculateAreaKm2(drawnGeoJson);
      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setDate(currentDate.getDate() - 15);
      const formatDate = (date) => date.toISOString().split("T")[0];

      let obj = {
        area: areaKm2.toFixed(2),
        satelliteDate: `${formatDate(pastDate)} to ${formatDate(currentDate)}`,
        ragiCoverage: parseFloat(metrics.ragiCoverage),
        nonRagiCoverage: parseFloat(metrics.nonRagiCoverage),
      };
      console.log(obj);
      setRegionInfo(obj);
      setOutputReceived(true);
      ws.close();
    } catch (error) {
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

      let progress = start + (end - start) * (elapsed / duration);
      if (progress >= end) progress = end;

      setProgress(progress);
      setDisplayProgress(Math.round(progress));
      if (progress < end) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const calculateAreaKm2 = (geoJson) => {
    const areaM2 = area(geoJson);
    return areaM2 / 1_000_000;
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

  const downloadSentinel1Data = () =>
    sentinel1
      ? downloadJSON(sentinel1, "sentinel_1_data.json")
      : displayToast("Error Downloading Sentinel 1 Data");
  const downloadSentinel2Data = () =>
    sentinel2
      ? downloadJSON(sentinel2, "sentinel_2_data.json")
      : displayToast("Error Downloading Sentinel 2 Data");

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      justifyContent="center"
      alignItems="flex-start"
      px={{ base: 4, md: 8 }}
      bgGradient="linear(to-b, #F4FFC3, #E4E4D0)"
      fontFamily="Signika Negative, serif"
      pt="8rem"
      pb="4rem"
      minHeight="100vh"
      width="100vw"
    >
      <Flex
        direction="column"
        width={{ base: "100%", lg: "80%" }}
        alignItems="center"
        textAlign="justify"
      >
        <Text color="#2C3E50" fontWeight={"bold"} fontSize={"3xl"}>
          Analyze Ragi Coverage
        </Text>
        <Flex
          height={"10vh"}
          width={"100%"}
          direction={"column"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          {!loading && !outputReceived && (
            <>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="medium"
                color="#2C3E50"
              >
                Select a Region to Identify Ragi Growing Areas
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color="gray.700"
                lineHeight="1.4"
              >
                Use the search bar and draw a polygon/rectangle to select your
                area (max {MAX_AREA_KM2} km²).
              </Text>
            </>
          )}
          {!loading && outputReceived && (
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="medium"
              color="#2C3E50"
            >
              Data Analysis Successfully Completed!
            </Text>
          )}
          {loading && (
            <VStack
              width={"inherit"}
              color={"black"}
              mt={1}
              align="start"
              spacing={1}
              style={{
                opacity: progress > 0 ? 1 : 0,
                transition: "opacity 0.25s ease-in-out",
              }}
            >
              <Text fontSize="lg" fontWeight="bold">
                Processing Data
              </Text>
              <Box w="100%">
                <Progress
                  value={progress}
                  size="lg"
                  borderRadius={"1rem"}
                  variant="subtle"
                  bg={"green.900"}
                  hasStripe
                  isAnimated
                  colorScheme="green"
                  sx={{ transition: "width 1.5s ease-in-out" }}
                />
                <Flex
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Text fontSize="md" color="gray.800">
                    {progressInfo}
                  </Text>
                  <Text mt={1} fontSize="md" textAlign="right">
                    {displayProgress}%
                  </Text>
                </Flex>
              </Box>
            </VStack>
          )}
        </Flex>
        <Flex
          direction={{ base: "column", xl: "row" }}
          width="100%"
          justifyContent="space-evenly"
          mt={5}
        >
          <Box
            zIndex={1}
            width={{ base: "100%", xl: "70%" }}
            height={{ base: "50vh", md: "60vh", xl: "70vh" }}
            border="1px solid gray"
            borderRadius="0.5rem"
            overflow="hidden"
            mb={{ base: 4, xl: 0 }}
          >
            <MapContainer
              id="map"
              center={[12.97, 77.59]}
              zoom={10}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <SearchField />
              <MapContent
                ref={mapContentRef}
                setDrawnGeoJson={setDrawnGeoJson}
                setPreviousGeoJson={setPreviousGeoJson}
                previousGeoJson={previousGeoJson}
                setRegionInfo={setRegionInfo}
                displayToast={displayToast}
                MAX_AREA_KM2={MAX_AREA_KM2}
                calculateAreaKm2={calculateAreaKm2}
                predictionData={predictionData}
                setFlag={setFlag}
              />
            </MapContainer>
          </Box>
          <Flex
            direction="column"
            width={{ base: "100%", xl: "28%" }}
            alignSelf="flex-start"
          >
            <Box
              textAlign="left"
              mt="1.25rem"
              p="1rem"
              mb="1rem"
              color="gray.700"
              w="100%"
              borderRadius="10px"
              boxShadow="0px 0px 10px rgba(0,0,0,0.3)"
              bg="#FDF6EC"
            >
              <Text
                fontSize="lg"
                pb="0.5rem"
                textAlign="center"
                fontWeight="bold"
              >
                Select Date Range
              </Text>
              <Flex direction="column" gap={3}>
                <Flex gap={2} background={"white"}>
                  <Select
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    style={{
                      background: "white !important",
                      border: 0,
                      outline: 0,
                      width: "100%",
                    }}
                  >
                    <option
                      value=""
                      disabled
                      style={{ background: "white", border: 0 }}
                    >
                      Start Year
                    </option>
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                        style={{ background: "white", border: 0 }}
                      >
                        {year}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    isDisabled={!startYear}
                    style={{
                      background: "white !important",
                      border: 0,
                      outline: 0,
                      width: "100%",
                    }}
                  >
                    <option
                      value=""
                      disabled
                      style={{ background: "white", border: 0 }}
                    >
                      Start Month
                    </option>
                    {months.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                        style={{ background: "white", border: 0 }}
                      >
                        {month.label}
                      </option>
                    ))}
                  </Select>
                </Flex>
                <Flex gap={2}>
                  <Select
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    isDisabled={!startYear || !startMonth}
                    style={{
                      background: "white !important",
                      border: 0,
                      outline: 0,
                      width: "100%",
                    }}
                  >
                    <option
                      value=""
                      disabled
                      style={{ background: "white", border: 0 }}
                    >
                      End Year
                    </option>
                    {years
                      .filter((year) => year >= startYear)
                      .map((year) => (
                        <option
                          key={year}
                          value={year}
                          style={{ background: "white", border: 0 }}
                        >
                          {year}
                        </option>
                      ))}
                  </Select>
                  <Select
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    isDisabled={!endYear}
                    style={{
                      background: "white !important",
                      border: 0,
                      outline: 0,
                      width: "100%",
                    }}
                  >
                    <option
                      value=""
                      disabled
                      style={{ background: "white", border: 0 }}
                    >
                      End Month
                    </option>
                    {months.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                        style={{ background: "white", border: 0 }}
                      >
                        {month.label}
                      </option>
                    ))}
                  </Select>
                </Flex>
              </Flex>
            </Box>

            <Box
              textAlign={"left"}
              p="1rem"
              mb="0.5rem"
              color="gray.700"
              w="100%"
              borderRadius="10px"
              boxShadow="0px 0px 10px rgba(0,0,0,0.3)"
              bg="#FDF6EC"
            >
              <Text
                fontSize="lg"
                pb="0.5rem"
                textAlign="center"
                fontWeight="bold"
              >
                Region Details
              </Text>
              {loading ? (
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Text textAlign="center" fontWeight={600} color="blue.500">
                    Fetching Region Details
                  </Text>
                  <CircularProgress
                    isIndeterminate
                    color="blue.500"
                    size={"1.5rem"}
                    ml={2}
                  />
                </Flex>
              ) : outputReceived && regionInfo ? (
                <>
                  <Text>
                    <b>Area:</b> {regionInfo?.area} km²
                  </Text>
                  <Text>
                    <b>Ragi Coverage:</b> {regionInfo?.ragiCoverage || 0}%
                  </Text>
                  <Text>
                    <b>Non-Ragi Coverage:</b> {regionInfo?.nonRagiCoverage || 0}
                    %
                  </Text>
                </>
              ) : (
                <Text color="#2C3E50">
                  No region selected. Please choose a region to continue.
                </Text>
              )}
            </Box>
            {outputReceived && regionInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <MotionButton
                  w={"100%"}
                  mt={3}
                  _hover={{ border: "none", bg: "blue.300" }}
                  _focus={{ outline: "0" }}
                  onClick={downloadSentinel1Data}
                  colorScheme="blue"
                  rightIcon={<FaDownload color="blue.500" size={"1rem"} />}
                >
                  Download Sentinel 1 JSON Data
                </MotionButton>
                <MotionButton
                  w={"100%"}
                  mt={3}
                  _hover={{ border: "none", bg: "blue.300" }}
                  _focus={{ outline: "0" }}
                  onClick={downloadSentinel2Data}
                  colorScheme="blue"
                  rightIcon={<FaDownload color="blue.500" size={"1rem"} />}
                >
                  Download Sentinel 2 JSON Data
                </MotionButton>
              </motion.div>
            )}
            <Button
              mt={3}
              _hover={{ border: "none", bg: "green.300" }}
              _focus={{ outline: "0" }}
              colorScheme="green"
              onClick={outputReceived ? clearData : () => fetchPixelData(flag)}
              isDisabled={loading}
              _disabled={{ bg: "green.200", cursor: "not-allowed" }}
              rightIcon={
                loading && (
                  <CircularProgress
                    isIndeterminate
                    color="green.500"
                    size={"1.5rem"}
                    mr={2}
                  />
                )
              }
            >
              {loading
                ? "Analyzing..."
                : outputReceived
                ? "Start New Analysis ?"
                : "Analyze Ragi Coverage"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MapSelector;
