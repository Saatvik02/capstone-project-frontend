import { Box, Flex, Text, Link, HStack, Icon, Divider, VStack, Center } from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <Box bg="#4F6F52" color="gray.300" py={6} px={6}>
            <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-between"
                align="flex-start"
                wrap="wrap"
                maxW="container.xl"
                mx="auto"
            >
                {/* About Section */}
                <Box maxW="280px" mb={{ base: 4, md: 0 }}>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
                        About AGROSCOPE
                    </Text>
                    <Text fontSize="sm" textAlign="justify">
                        AGROSCOPE leverages AI and satellite imagery to provide accurate crop mapping,
                        helping farmers and researchers track ragi fields with cutting-edge remote sensing.
                    </Text>
                </Box>

                {/* Quick Links */}
                <Box>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
                        Quick Links
                    </Text>
                    <Flex direction={["row","column"]} flexWrap={"wrap"} gap={2} fontSize="sm" mb={2}>
                        <Link href="/" _hover={{ color: "green.200" }}>Home</Link>
                        <Link href="/about" _hover={{ color: "green.200" }}>About</Link>
                        <Link href="/explore" _hover={{ color: "green.200" }}>Explore</Link>
                    </Flex>
                </Box>

                {/* Resources */}
                <Box>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
                        Resources
                    </Text>
                    <Flex direction={["row" ,"column"]} flexWrap={"wrap"} gap={2} fontSize="sm" mb={2}>
                        <Link href="https://www.esa.int/Applications/Observing_the_Earth/Copernicus/The_Sentinel_missions" target="_blank" _hover={{ color: "green.200" }}>Sentinel Missions</Link>
                        <Link href="https://www.copernicus.eu/en/access-data/conventional-data-access-hubs" target="_blank" _hover={{ color: "green.200" }}>Copernicus Hub</Link>
                        <Link href="https://www.sentinel-hub.com/explore/eobrowser/" target="_blank" _hover={{ color: "green.200" }}>EO Browser</Link>
                        <Link href="https://earthengine.google.com/" target="_blank" _hover={{ color: "green.200" }}>Google Earth Engine</Link>
                    </Flex>
                </Box>

                {/* Contact Us */}
                <Box>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
                        Contact Us
                    </Text>
                    <Flex direction={["row" ,"column"]} flexWrap={"wrap"} gap={2} fontSize="sm" mb={2}>
                        <HStack>
                            <Icon as={FaEnvelope} color="green.300" />
                            <Text>support@agroscope.com</Text>
                        </HStack>
                        <HStack>
                            <Icon as={FaPhone} color="green.300" />
                            <Text>+91 81475 34421</Text>
                        </HStack>
                        <HStack>
                            <Icon as={FaMapMarkerAlt} color="green.300" />
                            <Text>Bangalore, India</Text>
                        </HStack>
                    </Flex>

                    {/* Social Icons */}
                    <HStack spacing={3} mt={3}>
                        <Link href="https://facebook.com" target="_blank" _hover={{ transform: "scale(1.1)", transition: "0.2s" }}>
                            <Icon as={FaFacebook} boxSize={5} color="white" />
                        </Link>
                        <Link href="https://x.com" target="_blank" _hover={{ transform: "scale(1.1)", transition: "0.2s" }}>
                            <Icon as={FaTwitter} boxSize={5} color="white" />
                        </Link>
                        <Link href="https://instagram.com" target="_blank" _hover={{ transform: "scale(1.1)", transition: "0.2s" }}>
                            <Icon as={FaInstagram} boxSize={5} color="white" />
                        </Link>
                        <Link href="https://in.linkedin.com/" target="_blank" _hover={{ transform: "scale(1.1)", transition: "0.2s" }}>
                            <Icon as={FaLinkedin} boxSize={5} color="white" />
                        </Link>
                    </HStack>
                </Box>
            </Flex>

            {/* Divider Line */}
            <Divider my={4} borderColor="gray.500" />

            {/* Copyright Section */}
            <Center>
                <Text fontSize="xs" color="gray.200">
                    © {new Date().getFullYear()} AGROSCOPE. All rights reserved.
                </Text>
            </Center>
        </Box>
    );
};

export default Footer;
