import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";

interface Candidate {
  id: string;
  name: string;
  trained_by_winvinaya: string;
  skills: string[];
}

interface Props {
  candidatesData: Candidate[];
  headerBg: string;
  borderColor: string;
  textColor: string;
  evenRowBg: string;
  oddRowBg: string;
}

const CandidatesTable: React.FC<Props> = ({
  candidatesData,
  headerBg,
  borderColor,
  textColor,
  evenRowBg,
  oddRowBg,
}) => {
  return (
    <Box mt={5}>
      <TableContainer
        borderWidth="1px"
        borderRadius="lg"
        maxH="250px"
        overflowY="auto"
        bg={textColor}
        boxShadow="md"
      >
        <Table variant="simple">
          <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th
                color={textColor}
                borderBottom={`1px solid ${borderColor}`}
                fontSize="14px"
                fontWeight="600"
                py={3}
              >
                Name
              </Th>
              <Th
                color={textColor}
                borderBottom={`1px solid ${borderColor}`}
                fontSize="14px"
                fontWeight="600"
                py={3}
              >
                Trained by WinVinaya
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {candidatesData.length === 0 ? (
              <Tr>
                <Td colSpan={2} textAlign="center" py={4} color={textColor}>
                  No candidates found.
                </Td>
              </Tr>
            ) : (
              candidatesData.map((candidate, index) => (
                <Tr
                  key={candidate.id}
                  bg={index % 2 === 0 ? oddRowBg : evenRowBg}
                  transition="background 0.3s ease"
                >
                  <Td borderBottom={`1px solid ${borderColor}`} fontWeight="300" py={3}>
                    {candidate.name}
                  </Td>
                  <Td borderBottom={`1px solid ${borderColor}`} fontWeight="300" py={3}>
                    {candidate.trained_by_winvinaya}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CandidatesTable;
