import { Box, Text, Link, Flex } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      position="fixed"
      bottom="0"
      left="0"
      width="100%"
      bg="gray.100"
      py={4}
      zIndex="1000"
      boxShadow="md"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="center"
        align="center"
        textAlign="center"
        px={4}
      >
        <Text fontSize="sm" color="gray.600">
          © {new Date().getFullYear()}{" "}
          <Link
            href="https://www.winvinaya.com"
            isExternal
            color="teal.500"
            fontWeight="medium"
            _hover={{ textDecoration: "underline" }}
          >
            WinVinaya Infosystems
          </Link>
          . All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
