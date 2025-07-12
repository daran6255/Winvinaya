import React from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

const CenteredSpinner: React.FC = () => {
    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            height="100vh"
        >
            <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
            />
        </Flex>
    );
};

export default CenteredSpinner;
