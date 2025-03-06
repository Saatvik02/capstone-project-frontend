import React from "react";
import { Box, Flex, Button, Link, Spacer, Container } from "@chakra-ui/react";

const Navbar = () => {
    return (
        <Box
            position="fixed"
            width="100%"
            zIndex={10}
            as="nav"
            bg="rgba(79, 111, 82, 0.85)" // Glassmorphism effect
            backdropFilter="blur(10px)"
            color="#f4f1ed"
            py="1rem"
            boxShadow="0 4px 12px rgba(36, 62, 47, 0.3)"
            fontFamily="Signika Negative, sans-serif"
        >
            <Container maxW="85%">
                <Flex align="center">
                    {/* Brand Name */}
                    <Link
                        href="/"
                        fontSize="2rem"
                        fontFamily="'Anton SC', sans-serif"
                        fontWeight="500"
                        letterSpacing="2px"
                        _hover={{
                            color: "white",
                            transform: "scale(1.05)",
                            transition: "0.3s ease-in-out"
                        }}
                    >
                        AGROSCOPE
                    </Link>
                    <Spacer />

                    {/* Navigation Links */}
                    <Flex gap="2rem">
                        {["HOME", "ABOUT"].map((item, index) => (
                            <Link
                                key={index}
                                href={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                                fontSize="1.4rem"
                                fontWeight="600"
                                textTransform="uppercase"
                                letterSpacing="1px"
                                position="relative"
                                _after={{
                                    content: '""',
                                    position: "absolute",
                                    width: "100%",
                                    height: "2px",
                                    bottom: "-4px",
                                    left: "0",
                                    backgroundColor: "#d1d5db",
                                    transform: "scaleX(0)",
                                    transition: "transform 0.3s ease-in-out"
                                }}
                                _hover={{
                                    color: "#d1d5db",
                                    _after: { transform: "scaleX(1)" }
                                }}
                            >
                                {item}
                            </Link>
                        ))}
                    </Flex>
                    <Spacer />

                    <Link href="/explore">
                        <Button
                           bg="linear-gradient(135deg, #E0E7D9, #C5D1C5)"
                           color="#243e2f"
                           px="2rem"
                           py="0.8rem"
                           borderRadius="8px"
                           fontWeight="600"
                           fontSize="1.2rem"
                           boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                           transition="all 0.3s ease-in-out"
                           _hover={{
                               bg: "linear-gradient(135deg, #A7C7A7, #7FA07F)",
                               color: "white",
                               transform: "scale(1.05)",
                               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                           }}
                           _focus={{
                               outline: "none",
                               boxShadow: "none"
                           }}
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
