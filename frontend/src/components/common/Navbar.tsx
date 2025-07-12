import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Link,
  Spacer,
  useColorMode,
  useMediaQuery,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { FiMoon, FiSun, FiMenu } from "react-icons/fi";
import LightLogo from "../../../public/assets/images/Extractify_Logo_Light.png";
import DarkLogo from "../../../public/assets/images/Extractify_Logo_Dark.png";

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobileOrTablet] = useMediaQuery("(max-width: 1024px)");
  const buttonSize = isMobileOrTablet ? "sm" : "md";
  const logo = useColorModeValue(LightLogo, DarkLogo);

  return (
    <Box
      as="nav"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      boxShadow="sm"
      position="fixed"
      top={0}
      width="100%"
      zIndex={10}
      px={{ base: 4, md: 8 }}
      py={4}
    >
      <Flex alignItems="center" justifyContent="space-between">
        {/* Logo and Primary Navigation */}
        <Flex alignItems="center">
          <Image src={logo} alt="Logo" height={{ base: 8, md: 10 }} />

          {/* Primary Links, hidden on mobile or tablet */}
          {!isMobileOrTablet && (
            <Flex ml={8}>
              {['Products', 'Platform', 'Resources'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  mx={4}
                  fontSize={{ base: 'sm', md: 'md' }}
                  _hover={{ textDecoration: 'none', color: 'blue.500' }}
                >
                  {item}
                </Link>
              ))}
            </Flex>
          )}
        </Flex>

        <Spacer />

        {/* Secondary Navigation and Buttons */}
        <Flex alignItems="center">
          {/* Secondary Links, hidden on mobile or tablet */}
          {!isMobileOrTablet && (
            <>
              {['Demo', 'Pricing'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  mx={4}
                  fontSize={{ base: 'sm', md: 'md' }}
                  _hover={{ textDecoration: 'none', color: 'blue.500' }}
                >
                  {item}
                </Link>
              ))}
            </>
          )}

          {/* Dark Mode Toggle */}
          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            aria-label="Toggle Dark Mode"
            onClick={toggleColorMode}
            mx={2}
            size={buttonSize}
          />

          {/* Try it Free Button */}
          <Button colorScheme="purple" size={buttonSize} borderRadius="md" px={{ base: 4, md: 6 }} mr={2}>
            Try it Free
          </Button>

          {/* Mobile Hamburger Icon */}
          {isMobileOrTablet && (
            <IconButton
              icon={<FiMenu />}
              aria-label="Open Menu"
              onClick={onOpen}
              size="md"
              variant="outline"
            />
          )}
        </Flex>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>

          <DrawerBody>
            <Flex direction="column" align="start" mt={4}>
              {/* Primary Links */}
              {['Products', 'Platform', 'Resources'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  my={2}
                  fontSize="lg"
                  _hover={{ textDecoration: 'none', color: 'blue.500' }}
                  onClick={onClose}
                >
                  {item}
                </Link>
              ))}

              {/* Secondary Links */}
              {['Demo', 'Pricing'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  my={2}
                  fontSize="lg"
                  _hover={{ textDecoration: 'none', color: 'blue.500' }}
                  onClick={onClose}
                >
                  {item}
                </Link>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
