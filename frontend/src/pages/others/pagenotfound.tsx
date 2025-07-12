import React from 'react';
import { Box, Heading, Text, Button, VStack, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const PageNotFound: React.FC = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            textAlign="center"
            bg="gray.50"
            p={4}
        >
            <VStack spacing={6}>
                <Image
                    src="https://via.placeholder.com/400x300?text=404"
                    alt="Page Not Found"
                    maxWidth="400px"
                    borderRadius="md"
                />
                <Heading size="2xl" color="teal.500">
                    404 - Page Not Found
                </Heading>
                <Text fontSize="lg" color="gray.600">
                    Oops! The page you are looking for does not exist. It might have been removed, renamed, or did not exist in the first place.
                </Text>
                <Link to="/login">
                    <Button colorScheme="teal" size="lg">
                        Go Back Home
                    </Button>
                </Link>
            </VStack>
        </Box>
    );
};

export default PageNotFound;
