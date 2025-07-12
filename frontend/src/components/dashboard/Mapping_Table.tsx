import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Text,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import { autoMapAllJobs } from "../../helpers/job_mapped_services";
import { getJobById } from "../../helpers/jobs_services";
import { getCandidateById } from "../../helpers/candidates_registration_services";
import {
  AutoMapAllJobsResponse,
  JobResponse,
  CandidateResponse,
  Job,
  MappingSummary,
  Candidate,
} from "../../helpers/model";

const MappingTable: React.FC<{ jobmela_id: string }> = ({ jobmela_id }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type MappedCandidate = {
    id: string;
    name: string;
    matchedSkills: { skill: string; level: string }[];
  };

  type MappingRow = {
    jobId: string;
    jobName: string;
    jobSkills: string[];
    numOpenings: number;
    companyName: string;
    candidates: MappedCandidate[];
  };

  const [data, setData] = useState<MappingRow[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCandidate, setSelectedCandidate] = useState<{
    jobName: string;
    jobSkills: string[];
    candidateName: string;
    matchedSkills: { skill: string; level: string }[];
  } | null>(null);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [onlyMapped, setOnlyMapped] = useState(false);

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        setLoading(true);
        setError(null);

        const res: AutoMapAllJobsResponse = await autoMapAllJobs(jobmela_id);
        const summary: MappingSummary[] = res.mappings || [];

        const resolvedData = await Promise.all(
          summary.map(async (mapItem) => {
            const jobRes: JobResponse = await getJobById(mapItem.job_id);
            const jobObj = jobRes.result as Job;
            const jobName = jobObj?.jobRole || "Unknown";
            const jobSkills = jobObj?.skills || [];
            const numOpenings = jobObj?.numOpenings ?? 0;
            const companyName = jobObj?.companyName || "Unknown";

            const candidates = await Promise.all(
              mapItem.mapped_candidates.map(async (c) => {
                const candRes: CandidateResponse =
                  await getCandidateById(c.id);
                const candObj =
                  candRes.status === "success" &&
                  !Array.isArray(candRes.result)
                    ? (candRes.result as Candidate)
                    : null;

                return {
                  id: c.id,
                  name: candObj?.name || "Unknown",
                  matchedSkills: c.matched_skills,
                };
              })
            );

            return {
              jobId: mapItem.job_id,
              jobName,
              jobSkills,
              numOpenings,
              companyName,
              candidates,
            };
          })
        );

        setData(resolvedData);
      } catch (err: unknown) {
        const errorMsg =
          (err as { message?: string })?.message ||
          "Error fetching mapping data";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, [jobmela_id]);

  const openCandidateModal = (row: MappingRow, candidate: MappedCandidate) => {
    setSelectedCandidate({
      jobName: row.jobName,
      jobSkills: row.jobSkills,
      candidateName: candidate.name,
      matchedSkills: candidate.matchedSkills,
    });
    onOpen();
  };

  // Collect all companies for dropdown
  const uniqueCompanies = Array.from(
    new Set(data.map((row) => row.companyName))
  ).sort();

  // Apply search and filters
  const filteredData = data.filter((row) => {
    const matchesSearch =
      row.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.candidates.some((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCompany =
      companyFilter === "All" || row.companyName === companyFilter;

    const matchesMapped = !onlyMapped || row.candidates.length > 0;

    return matchesSearch && matchesCompany && matchesMapped;
  });

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" />
        <Text mt={2}>Loading mapping data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <>
      {/* Filters UI */}
      <Flex
        mb={4}
        gap={4}
        flexWrap="wrap"
        justifyContent="space-between"
      >
        <Input
          placeholder="Search job, company, or candidate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />

        <Select
          placeholder="Filter by company"
          value={companyFilter === "All" ? "" : companyFilter}
          onChange={(e) =>
            setCompanyFilter(e.target.value || "All")
          }
          maxW="250px"
        >
          {uniqueCompanies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </Select>

        <Checkbox
          isChecked={onlyMapped}
          onChange={(e) => setOnlyMapped(e.target.checked)}
        >
          Show only jobs with mapped candidates
        </Checkbox>
      </Flex>

      <Box mt={6}>
        <TableContainer
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          maxH="300px"
          overflowY="auto"
          overflowX="auto"
        >
          <Table variant="striped" size="sm">
            <Thead bg="gray.100" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th color="gray.700" fontSize="14px" fontWeight="700" py={3}>
                  Job Role
                </Th>
                <Th color="gray.700" fontSize="14px" fontWeight="700" py={3}>
                  Company
                </Th>
                <Th color="gray.700" fontSize="14px" fontWeight="700" py={3}>
                  Vacancy
                </Th>
                <Th color="gray.700" fontSize="14px" fontWeight="700" py={3}>
                  Mapped Candidates
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={4}>
                    No results found.
                  </Td>
                </Tr>
              ) : (
                filteredData.map((row) => (
                  <Tr
                    key={row.jobId}
                    _hover={{ backgroundColor: "gray.50" }}
                  >
                    <Td fontWeight="medium" fontSize="sm">
                      {row.jobName}
                    </Td>
                    <Td fontSize="sm">{row.companyName}</Td>
                    <Td fontSize="sm" fontWeight="bold">
                      {row.numOpenings}
                    </Td>
                    <Td fontSize="sm" whiteSpace="normal">
                      {row.candidates.length > 0 ? (
                        <Box display="flex" flexWrap="wrap">
                          {row.candidates.map((c, idx) => (
                            <Box
                              key={c.id}
                              as="span"
                              color="blue.600"
                              fontWeight="bold"
                              cursor="pointer"
                              _hover={{ textDecoration: "underline" }}
                              onClick={() => openCandidateModal(row, c)}
                              mr={idx < row.candidates.length - 1 ? 1 : 0}
                            >
                              {c.name}
                              {idx < row.candidates.length - 1 && (
                                <span>,&nbsp;</span>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text color="gray.500">
                          No candidates mapped
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Candidate Mapping Details</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {selectedCandidate && (
        <Box width="100%">
          <Table variant="simple" size="sm">
            <Tbody>
              <Tr>
                <Th width="40%">Candidate Name</Th>
                <Td>{selectedCandidate.candidateName}</Td>
              </Tr>
              <Tr>
                <Th>Job Role</Th>
                <Td>{selectedCandidate.jobName}</Td>
              </Tr>
              <Tr>
                <Th>Job Required Skills</Th>
                <Td>
                  {selectedCandidate.jobSkills.length > 0 ? (
                    <Flex wrap="wrap" gap={2}>
                      {selectedCandidate.jobSkills.map((skill, idx) => (
                        <Badge key={idx} colorScheme="green">
                          {skill}
                        </Badge>
                      ))}
                    </Flex>
                  ) : (
                    <Text color="gray.500">No required skills specified.</Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Th>Matched Skills</Th>
                <Td>
                  {selectedCandidate.matchedSkills.length > 0 ? (
                    <Table size="xs" variant="striped">
                      <Thead>
                        <Tr>
                          <Th>Skill</Th>
                          <Th>Level</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedCandidate.matchedSkills.map((ms, idx) => (
                          <Tr key={idx}>
                            <Td>{ms.skill}</Td>
                            <Td>{ms.level}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500">No matched skills.</Text>
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      )}
    </ModalBody>
    <ModalFooter>
      <Button onClick={onClose}>Close</Button>
    </ModalFooter>
  </ModalContent>
      </Modal>
    </>
  );
};

export default MappingTable;
