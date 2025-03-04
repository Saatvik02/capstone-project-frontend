import React from "react";
import { Box, Flex, Text, Button, Link, Spacer, Container } from "@chakra-ui/react";

const Navbar = () => {
    return (
        <Box 
            position="fixed" 
            width="100%"  
            zIndex={2} 
            as="nav" 
            bg="#4F6F52" 
            color="#f4f1ed" 
            py="1rem" 
            boxShadow="0 2px 10px rgba(36,62,47,255)" 
            fontFamily="Signika Negative, serif"
        >
            <Container maxW="80%">  {/* Restricts width for better spacing */}
                <Flex align="center">
                    {/* AGROSCOPE Logo */}
                    <Link href="/" >
                        <Text 
                            fontSize="2rem" 
                            fontFamily="'Anton SC', sans-serif" 
                            fontWeight="400"
                            _hover={{color: "#d1d5db"}}
                            
                        >
                            AGROSCOPE
                        </Text>
                    </Link>
                    

                    <Spacer /> {/* Pushes links to center */}

                    {/* Navigation Links */}
                    <Flex gap="1.5rem">
                        <Link href="/" fontSize="1.5rem" fontWeight="600" _hover={{ color: "#d1d5db" }}>
                            HOME
                        </Link>
                        <Link href="/about" fontSize="1.5rem" fontWeight="600" _hover={{ color: "#d1d5db" }}>
                            ABOUT
                        </Link>
                    </Flex>

                    <Spacer /> {/* Pushes button to right */}

                    {/* Explore Button */}
                    <Link href="/explore">
                        <Button 
                            bg="#f4f1ed" 
                            color="#243e2f" 
                            px="1.5rem" 
                            py="0.75rem"
                            borderRadius="0.5rem"
                            _hover={{
                                bg: "#1A4D2E",
                                color: "#f4f1ed",
                            }}
                            fontWeight="600"
                            fontSize="1.2rem"
                            border="0"
                        >
                            EXPLORE
                        </Button>
                    </Link>
                </Flex>
            </Container>
        </Box>
    );
};

export default Navbar;
