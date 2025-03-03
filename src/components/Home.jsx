import { Box, Button, Container, Heading, Text, VStack, Image, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box fontFamily="Signika Negative, serif">
      <Box bg="gray.300" color="black" py={20} mt={20} textAlign="center">
        <Container maxW="container.md">
          <Heading fontSize={{ base: "3xl", md: "5xl" }} letterSpacing={'0.1rem'} fontFamily={"Anton SC, sans-serif"}>AGROSCOPE</Heading>
          <Text fontSize="1.4rem" mt={4}>Identify Ragi-Growing Regions Using Satellite Imagery and Deep Learning.</Text>
          <Button as={Link} to="/explore" mt={6} bg={"#2e6b4b"} _hover={{color:"#2e6b4b", bg:"gray.300", border:"1px solid black"}} size="lg">Start Exploring</Button>
        </Container>
      </Box>

      <Container bg={'gray.300'} color={'black'} borderY={'2px solid black'} maxW="full" py={16} textAlign="center">
        <Heading size="xl" mb={12}>How It Works</Heading>
        <HStack spacing={12} wrap="wrap" justify="center">
          <Box maxW="sm" textAlign="center">
            <Image src="/Images/location.jpg" boxSize="100px" mx="auto" mb={4} />
            <Text fontSize="lg" fontWeight="bold">Select a Region</Text>
            <Text>Enter your location to analyze ragi cultivation.</Text>
          </Box>
          <Box maxW="sm" textAlign="center">
            <Image src="/Images/satellite.jpg" boxSize="100px" mx="auto" mb={4} />
            <Text fontSize="lg" fontWeight="bold">Satellite Data Processing</Text>
            <Text>Our system fetches and processes Sentinel-1 and Sentinel-2 images.</Text>
          </Box>
          <Box maxW="sm" textAlign="center">
            <Image src="/Images/prediction.jpeg" boxSize="100px" mx="auto" mb={4} />
            <Text fontSize="lg" fontWeight="bold">Prediction & Visualization</Text>
            <Text>See highlighted ragi-growing areas on an interactive map.</Text>
          </Box>
        </HStack>
      </Container>

      <Box bg="gray.300" color={'black'}  py={16}>
        <Container maxW={'full'} display={'flex'} flexDirection={'column'} textAlign="center">
          <Heading size="xl" mb={12}>Key Features</Heading>
          <HStack spacing={10} wrap="wrap" direction={'row'} justify="center">
            <Box maxW="sm" textAlign="center">
            <Image src="/Images/real-time.png" boxSize="120px" mx="auto" mb={4} />
              <Text fontSize="lg" fontWeight="bold">Real-Time Analysis</Text>
              <Text>Fetch and analyze the latest satellite crop data dynamically.</Text>
            </Box>
            <Box maxW="sm" textAlign="center">
            <Image src="/Images/accuracy.png" boxSize="120px" mx="auto" mb={4} />
              <Text fontSize="lg" fontWeight="bold">High Accuracy</Text>
              <Text>Our deep learning model ensures precise crop identification and crop mapping.</Text>
            </Box>
            <Box maxW="sm" textAlign="center">
            <Image src="/Images/user-friendly.jpg" boxSize="120px" mx="auto" mb={4} />
              <Text fontSize="lg" fontWeight="bold">User-Friendly Interface</Text>
              <Text>Simple and intuitive design for seamless user experience.</Text>
            </Box>
          </HStack>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;
