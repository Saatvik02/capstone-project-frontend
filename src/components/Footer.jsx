import { Box, Flex, Text, Link, HStack, Icon, Divider, VStack } from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <Box bg="#4F6F52" color="gray.400" py={5}>
            <Flex
                direction={{ base: "column", md: "row" }}
                justify="space-around"
                align="flex-start"
                wrap="wrap"
                px={10}
            >
                <Flex direction={'column'} justifyContent={'center'} width="25%" mb={{ base: 6, md: 0 }}>
                    <Text fontSize="lg" fontWeight="bold" color="white" mb={3}>
                        About AGROSCOPE
                    </Text>
                    <Text fontSize="sm" textAlign={'justify'}>
                        AGROSCOPE leverages AI and satellite imagery to provide accurate crop mapping.
                        Helping farmers and researchers track ragi fields with cutting-edge remote sensing.
                    </Text>
                </Flex>

                <Flex direction={'column'} justifyContent={'center'} alignItems={'center'} width="25%">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" color="white" mb={3}>
                            Quick Links
                        </Text>
                        <Flex direction="column" fontSize="sm">
                            <Link href="/" _hover={{ color: "green.400" }}>Home</Link>
                            <Link href="/about" _hover={{ color: "green.400" }}>About</Link>
                            <Link href="/explore" _hover={{ color: "green.400" }}>Explore</Link>
                        </Flex>
                    </Box>
                </Flex>

                <Flex direction={'column'} justifyContent={'center'} alignItems={'center'} width="25%">
                    <Box>
                        <Text fontSize="lg" fontWeight="bold" color="white" mb={3}>
                            Resources
                        </Text>
                        <Flex direction="column" fontSize="sm">
                            <Link href="https://www.esa.int/Applications/Observing_the_Earth/Copernicus/The_Sentinel_missions" target="_blank" _hover={{ color: "green.400" }}>Sentinel Missions</Link>
                            <Link href="https://www.copernicus.eu/en/access-data/conventional-data-access-hubs" target="_blank" _hover={{ color: "green.400" }}>Copernicus Open Access Hub</Link>
                            <Link href="https://www.sentinel-hub.com/explore/eobrowser/" target="_blank" _hover={{ color: "green.400" }}>EO Browser</Link>
                            <Link href="https://earthengine.google.com/" target="_blank" _hover={{ color: "green.400" }}>Google Earth Engine</Link>
                        </Flex>
                    </Box>
                </Flex>

                <Flex direction={'column'} justifyContent={'center'} alignItems={'center'} width="25%">
                    <Box>

                        <Text fontSize="lg" fontWeight="bold" color="white" mb={3}>
                            Contact Us
                        </Text>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <HStack>
                                <Icon as={FaEnvelope} />
                                <Text>support@agroscope.com</Text>
                            </HStack>
                            <HStack>
                                <Icon as={FaPhone} />
                                <Text>+91 81475 34421</Text>
                            </HStack>
                            <HStack>
                                <Icon as={FaMapMarkerAlt} />
                                <Text>Bangalore, India</Text>
                            </HStack>
                        </VStack>

                        <HStack spacing={4} mt={4}>
                            <Link href="https://facebook.com" target="_blank" _hover={{ color: "green.400" }}>
                                <Icon as={FaFacebook} boxSize={6} />
                            </Link>
                            <Link href="https://x.com" target="_blank" _hover={{ color: "green.400" }}>
                                <Icon as={FaTwitter} boxSize={6} />
                            </Link>
                            <Link href="https://instagram.com" target="_blank" _hover={{ color: "green.400" }}>
                                <Icon as={FaInstagram} boxSize={6} />
                            </Link>
                            <Link href="https://linkedin.com" target="_blank" _hover={{ color: "green.400" }}>
                                <Icon as={FaLinkedin} boxSize={6} />
                            </Link>
                        </HStack>
                    </Box>
                </Flex>
            </Flex>

            <Divider my={6} borderColor="gray.500" />

            <Text textAlign="center" fontSize="sm" color="gray.300">
                © {new Date().getFullYear()} AGROSCOPE. All rights reserved.
            </Text>
        </Box>
    );
};

export default Footer;
