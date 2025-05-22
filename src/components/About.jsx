import { Box, Heading, Text, Container, VStack, Divider } from "@chakra-ui/react";

const About = () => {
    return (
        <Box bgGradient="linear(to-b, #F4FFC3, #E4E4D0)" fontFamily="Signika Negative, sans-serif" minW="100vw" minH="100vh" py={20}>
            <Container maxW={["85%", "container.lg"]} mt={12} py={12} bg="#FDF6EC" boxShadow="2xl" borderRadius="lg" p={[8, 12]}>
                <VStack spacing={10} align="start">
                    <Heading as="h1" size="2xl" color="#1A4D2E" fontWeight="bold" textAlign="center" w="full" fontFamily="Signika Negative, sans-serif">
                        About AGROSCOPE
                    </Heading>
                    <Text fontSize="lg" textAlign="justify" color="gray.700" lineHeight="1.8" >
                        <b>AGROSCOPE</b> is an advanced satellite-based crop detection tool designed to help farmers, researchers, and policymakers
                        identify ragi-growing regions dynamically. Using cutting-edge remote sensing technology and deep learning algorithms,
                        AGROSCOPE processes Sentinel-1 and Sentinel-2 satellite data to provide highly accurate and real-time crop mapping insights.
                        This tool aims to enhance agricultural planning, optimize resource allocation, and contribute to precision farming strategies.
                    </Text>
                    <Divider borderColor="gray.400" />

                    <Heading as="h2" size="xl" color="#2C3E50" fontWeight="bold" fontFamily="Signika Negative, sans-serif">
                        How It Works
                    </Heading>
                    <Text fontSize="lg" textAlign="justify" color="gray.700" lineHeight="1.8">
                        AGROSCOPE operates in a simple yet effective manner. Users start by selecting a region of interest on an interactive map.
                        Once a region is chosen, the system automatically fetches high-resolution Sentinel-1 and Sentinel-2 satellite imagery
                        from the past two weeks. The data is preprocessed to extract relevant spectral and radar-based features such as NDVI,
                        NDWI, and SAR backscatter values. These extracted features are then fed into a deep learning model, which classifies
                        each pixel into <b>Ragi</b> or <b>Non-Ragi</b> categories. Finally, the identified ragi-growing areas are highlighted on the map,
                        enabling users to visually analyze crop distribution in their chosen region.
                    </Text>
                    <Divider borderColor="gray.400" />

                    <Heading as="h2" size="xl" color="#2C3E50" fontWeight="bold" fontFamily="Signika Negative, sans-serif">
                        Key Features
                    </Heading>
                    <VStack spacing={4} align="start">
                        <Text fontSize="lg" color="gray.700"><b>🌍 AI-Powered Crop Detection:</b> Leverages deep learning for accurate classification of ragi crops.</Text>
                        <Text fontSize="lg" color="gray.700"><b>📡 Satellite-Based Monitoring:</b> Uses Sentinel-1 and Sentinel-2 imagery to assess crop health and distribution.</Text>
                        <Text fontSize="lg" color="gray.700"><b>🗺️ Interactive Map Interface:</b> Allows easy selection of regions and visualization of classified crop areas.</Text>
                        <Text fontSize="lg" color="gray.700"><b>⚡ Fast and Efficient Processing:</b> Generates results in real-time without requiring extensive user input.</Text>
                        <Text fontSize="lg" color="gray.700"><b>📈 Scalability:</b> Designed to support multiple regions and scale dynamically based on input area.</Text>
                    </VStack>
                    <Divider borderColor="gray.400" />

                    <Heading as="h2" size="xl" color="#2C3E50" fontWeight="bold" fontFamily="Signika Negative, sans-serif">
                        Why Use AGROSCOPE?
                    </Heading>
                    <Text fontSize="lg" textAlign="justify" color="gray.700" lineHeight="1.8">
                        AGROSCOPE provides an unparalleled advantage in modern agriculture by offering real-time and data-driven insights.
                        Whether you're a <b>farmer</b> looking to optimize yield, a <b>researcher</b> analyzing crop patterns, or a <b>policymaker</b> strategizing
                        agricultural policies, AGROSCOPE serves as a valuable tool for decision-making. By automating the process of ragi detection
                        using satellite data, it eliminates the need for manual surveys and significantly reduces operational costs. Additionally,
                        its ability to highlight spatial crop distribution allows for better land-use planning and sustainability measures.
                    </Text>
                    <Divider borderColor="gray.400" />

                    <Heading as="h2" size="xl" color="#2C3E50" fontWeight="bold" fontFamily="Signika Negative, sans-serif">
                        Future Enhancements
                    </Heading>
                    <VStack spacing={4} align="start">
                        <Text fontSize="lg" color="gray.700"><b>🌾 Multi-Crop Classification:</b> Extending support to detect other crops beyond ragi.</Text>
                        <Text fontSize="lg" color="gray.700"><b>☁️ Integration with Weather Data:</b> Incorporating real-time weather updates to assess crop growth conditions.</Text>
                        <Text fontSize="lg" color="gray.700"><b>📊 Yield Prediction Models:</b> Developing AI models to estimate crop yield based on historical and real-time data.</Text>
                    </VStack>
                    <Text fontSize="lg" color="gray.700" textAlign="center" fontStyle="italic" mt={6}>
                        Stay tuned for future updates as we make AGROSCOPE the most comprehensive satellite-based crop mapping tool! 🚀
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
};

export default About;
