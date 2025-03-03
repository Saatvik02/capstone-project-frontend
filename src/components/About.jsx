import { Box, Heading, Text, Container, VStack, Divider } from "@chakra-ui/react";

const About = () => {
    return (
        <Box bg={'gray.300'} fontFamily= "Signika Negative, serif" minW={'100vw'} minH={'100vh'} mt={20}>
            <Container maxW="container.lg" py={10}>
                <VStack spacing={6} align="start">
                    <Heading as="h1"  size="xl" color="green.700">
                        About AGROSCOPE
                    </Heading>
                    <Text fontSize="1.25rem" textAlign={'justify'}  color="gray.700">
                        AGROSCOPE is an advanced satellite-based crop detection tool designed to help farmers, researchers, and policymakers
                        identify ragi-growing regions dynamically. Using cutting-edge remote sensing technology and deep learning algorithms,
                        AGROSCOPE processes Sentinel-1 and Sentinel-2 satellite data to provide highly accurate and real-time crop mapping insights.
                        This tool aims to enhance agricultural planning, optimize resource allocation, and contribute to precision farming strategies.
                    </Text>
                    <Divider />

                    <Heading as="h2" size="lg" color="green.700">
                        How It Works
                    </Heading>
                    <Text fontSize="1.25rem" textAlign={'justify'} color="gray.700">
                        AGROSCOPE operates in a simple yet effective manner. Users start by selecting a region of interest on an interactive map.
                        Once a region is chosen, the system automatically fetches high-resolution Sentinel-1 and Sentinel-2 satellite imagery
                        from the past two weeks. The data is preprocessed to extract relevant spectral and radar-based features such as NDVI,
                        NDWI, and SAR backscatter values. These extracted features are then fed into a deep learning model, which classifies
                        each pixel into Ragi or Non-Ragi categories. Finally, the identified ragi-growing areas are highlighted on the map,
                        enabling users to visually analyze crop distribution in their chosen region.
                    </Text>
                    <Divider />

                    <Heading as="h2" size="lg" color="green.700">
                        Key Features
                    </Heading>
                    <Text fontSize="1.25rem" textAlign={'justify'} color="gray.700">
                        <b>AI-Powered Crop Detection:</b> Leverages deep learning for accurate classification of ragi crops.
                        <br /><b>Satellite-Based Monitoring:</b> Uses Sentinel-1 and Sentinel-2 imagery to assess crop health and distribution.
                        <br /><b>User-Friendly Map Interface:</b> Allows easy selection of regions and visualization of classified crop areas.
                        <br /><b>Fast and Efficient Processing:</b> Generates results in real-time without requiring extensive user input.
                        <br /><b>Scalability:</b> Designed to support multiple regions and scale dynamically based on input area.
                    </Text>
                    <Divider />

                    <Heading as="h2" size="lg" color="green.700">
                        Why Use AGROSCOPE?
                    </Heading>
                    <Text fontSize="1.25rem" textAlign={'justify'} color="gray.700">
                        AGROSCOPE provides an unparalleled advantage in modern agriculture by offering real-time and data-driven insights.
                        Whether you're a farmer looking to optimize yield, a researcher analyzing crop patterns, or a policymaker strategizing
                        agricultural policies, AGROSCOPE serves as a valuable tool for decision-making. By automating the process of ragi detection
                        using satellite data, it eliminates the need for manual surveys and significantly reduces operational costs. Additionally,
                        its ability to highlight spatial crop distribution allows for better land-use planning and sustainability measures.
                    </Text>
                    <Divider />

                    <Heading as="h2" size="lg" color="green.700">
                        Future Enhancements
                    </Heading>
                    <Text fontSize="1.25rem" textAlign={'justify'} color="gray.700">
                        We are continuously working on improving AGROSCOPE to enhance its accuracy and expand its functionalities. Some of our planned enhancements include:
                        <br /><b>Multi-Crop Classification:</b> Extending support to detect other crops beyond ragi.
                        <br /><b>Integration with Weather Data:</b> Incorporating real-time weather updates to assess crop growth conditions.
                        <br /><b>Yield Prediction Models:</b> Developing AI models to estimate crop yield based on historical and real-time data.
                        <br /> <br />Stay tuned for future updates and enhancements as we strive to make AGROSCOPE the most comprehensive satellite-based crop mapping tool available.
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
};

export default About;