import { Box, Button, Container, Heading, Text, VStack, Image, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box fontFamily="Signika Negative, sans-serif" bg="#FAF3E0" color="#1E201E">
      <Box bgGradient="linear(to-b, #F4FFC3, #E4E4D0)" py={24} mt={20} textAlign="center" borderRadius="lg" boxShadow="lg">
        <Container maxW="container.md">
          <Heading fontSize={{ base: "4xl", md: "5xl" }} letterSpacing={'0.1rem'} fontFamily="Anton SC, sans-serif" color="#2C3E50">
            AGROSCOPE
          </Heading>
          <Text fontSize={{ base: "lg", md: "xl" }} mt={4} fontWeight="medium" color="#34495E">
            Identify Ragi-Growing Regions Using Satellite Imagery and Deep Learning.
          </Text>
          <Button as={Link} to="/explore" mt={6} bgGradient="linear(to-r, #4F6F52, #1A4D2E)" color="white" _hover={{ opacity: 0.9 , color:"white"}} size="lg" borderRadius="full" px={8} py={6} fontSize="lg" boxShadow="md">
            Start Exploring
          </Button>
        </Container>
      </Box>

      <Container bg="#FDF6EC" color="#2C3E50" borderY="1px dashed #B0B0B0" maxW="full" py={20} textAlign="center">
        <Heading size="2xl" mb={12} fontWeight="bold" fontFamily="Signika Negative, sans-serif">How It Works</Heading>
        <HStack spacing={12} wrap="wrap" justify="center">
          {[
            { src: "/Images/location.jpg", title: "Select a Region", desc: "Enter your location to analyze ragi cultivation." },
            { src: "/Images/satellite.jpg", title: "Satellite Data Processing", desc: "Our system fetches and processes Sentinel-1 and Sentinel-2 images." },
            { src: "/Images/prediction.jpeg", title: "Prediction & Visualization", desc: "See highlighted ragi-growing areas on an interactive map." }
          ].map((item, index) => (
            <Box maxW="sm" textAlign="center" key={index} p={6} borderRadius="lg" bg="white" boxShadow="xl" w={"300px"} h="280px" _hover={{ transform: "scale(1.05)", transition: "0.3s ease-in-out" }}>
              <Image src={item.src} boxSize="100px" mx="auto" mb={4} borderRadius="50%" boxShadow="md" />
              <Text fontSize="xl" fontWeight="bold" color="#1A4D2E">{item.title}</Text>
              <Text fontSize="md" color="#5D6D7E">{item.desc}</Text>
            </Box>
          ))}
        </HStack>
      </Container>

      <Box bgGradient="linear(to-b, #F4FFC3, #E4E4D0)" py={20} textAlign="center" color="#2C3E50">
        <Container maxW="full">
          <Heading size="2xl" mb={12} fontWeight="bold" fontFamily="Signika Negative, sans-serif">Key Features</Heading>
          <HStack spacing={10} wrap="wrap" justify="center">
            {[
              { src: "/Images/real-time.png", title: "Real-Time Analysis", desc: "Fetch and analyze the latest satellite crop data dynamically." },
              { src: "/Images/accuracy.png", title: "High Accuracy", desc: "Our deep learning model ensures precise crop identification and mapping." },
              { src: "/Images/user-friendly.jpg", title: "User-Friendly Interface", desc: "Simple and intuitive design for a seamless experience." }
            ].map((item, index) => (
              <Box maxW="sm" textAlign="center" key={index} p={6} borderRadius="lg" bg="white" boxShadow="xl" w={"300px"} h="280px" _hover={{ transform: "scale(1.05)", transition: "0.3s ease-in-out" }}>
                <Image src={item.src} boxSize="120px" mx="auto" mb={4} borderRadius="50%" boxShadow="md" />
                <Text fontSize="xl" fontWeight="bold" color="#1A4D2E">{item.title}</Text>
                <Text fontSize="md" color="#5D6D7E">{item.desc}</Text>
              </Box>
            ))}
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
