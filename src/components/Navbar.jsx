import React, { useState } from "react";
import { Box, Flex, Button, Link, Spacer, Container, Image, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody, VStack, useBreakpointValue
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

const Navbar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMobile = useBreakpointValue({ base: true, md: false });

    const NavLinks = ({ direction = "row", spacing = "2rem", onClose }) => (
        <Flex
            direction={direction}
            gap={spacing}
            align={direction === "column" ? "center" : "inherit"}
        >
            {["HOME", "ABOUT"].map((item, index) => (
                <Link
                    key={index}
                    href={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                    fontSize={{ base: "1.2rem", md: "1.4rem" }}
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="1px"
                    position="relative"
                    onClick={onClose}
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
    );

    const ExploreButton = ({ onClose }) => (
        <Link href="/explore" onClick={onClose}>
            <Button
                bg="linear-gradient(135deg, #E0E7D9, #C5D1C5)"
                color="#243e2f"
                px="2rem"
                py="0.8rem"
                borderRadius="8px"
                fontWeight="600"
                fontSize={{ base: "1.1rem", md: "1.2rem" }}
                boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                transition="all 0.3s ease-in-out"
                _hover={{
                    bg: "linear-gradient(135deg, #A7C7A7, #7FA07F)",
                    color: "white",
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    border: "0"
                }}
                _focus={{
                    outline: "none",
                    boxShadow: "none"
                }}
            >
                EXPLORE
            </Button>
        </Link>
    );

    return (
        <Box
            position="fixed"
            width="100%"
            zIndex={10}
            as="nav"
            bg="rgba(79, 111, 82, 0.85)"
            backdropFilter="blur(10px)"
            color="#f4f1ed"
            py="1rem"
            boxShadow="0 4px 12px rgba(36, 62, 47, 0.3)"
            fontFamily="Signika Negative, sans-serif"
        >
            <Container maxW="85%">
                <Flex align="center" justify="space-between">
                    <Link
                        href="/"
                        fontSize={{ base: "1.5rem", md: "2rem" }}
                        fontFamily="'Anton SC', sans-serif"
                        fontWeight="500"
                        letterSpacing="2px"
                        _hover={{
                            color: "white",
                            transform: "scale(1.05)",
                            transition: "0.3s ease-in-out"
                        }}
                    >
                        <Flex direction="row" align="center">
                            <Image src="/logo.png" alt="Logo" boxSize={{ base: "2rem", md: "2.4rem" }} mr="1rem" />
                            AGROSCOPE
                        </Flex>
                    </Link>

                    {isMobile ? (
                        <IconButton
                            aria-label="Open menu"
                            icon={<HamburgerIcon />}
                            onClick={onOpen}
                            variant="ghost"
                            color="white"
                            size="md"
                            _hover={{ bg: "whiteAlpha.200" }}
                        />
                    ) : (
                        <>
                            <Spacer />
                            <NavLinks />
                            <Spacer />
                            <ExploreButton />
                        </>
                    )}
                </Flex>
            </Container>

            {/* Mobile Menu Drawer */}
            <Drawer isOpen={isOpen} onClose={onClose} placement="right">
                <DrawerOverlay  />
                <DrawerContent bg="rgba(79, 111, 82, 0.95)" color="#f4f1ed">
                    <DrawerCloseButton size="lg" />
                    <DrawerBody>
                        <VStack spacing="2rem" mt="4rem">
                            <NavLinks direction="column" spacing="2rem" onClose={onClose} />
                            <ExploreButton onClose={onClose} />
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Navbar;
