import React, { useState } from "react";
import {
  Box,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Select,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  useDisclosure,
  FormControl,
  FormLabel,
  VStack,
  Checkbox,
  CheckboxGroup,
  SimpleGrid,
  IconButton,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { MinusIcon, AddIcon } from "@chakra-ui/icons";

import {
  CompanyWithJobs,
  Job,
  JobResponse,
  JobUpdatePayload,
} from "../../helpers/model";
import {
  getAllJobs,
  deleteJob,
  updateJob,
} from "../../helpers/jobs_services";

import { skills as allSkills } from "../../constants/skills";
import { degrees as allDegrees } from "../../constants/degrees";


interface Props {
  companyData: CompanyWithJobs[];
  headerBg: string;
  textColor: string;
  evenRowBg: string;
  oddRowBg: string;
}

const colorSchemes = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "cyan",
  "teal",
  "red",
  "yellow",
  "gray",
];

const getColorForRole = (role: string): string => {
  let hash = 0;
  for (let i = 0; i < role.length; i++) {
    hash = role.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorSchemes[Math.abs(hash) % colorSchemes.length];
};

const CompanyTable: React.FC<Props> = ({
  companyData,
  headerBg,
  textColor,
  evenRowBg,
  oddRowBg,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState<boolean>(false);
  const [jobForm, setJobForm] = useState<JobUpdatePayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<
    Record<keyof JobUpdatePayload, string>
  >>({});

  const uniqueTypes = Array.from(
    new Set(companyData.map((c) => c.type))
  ).filter((t) => t);

  const filteredData = companyData.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? company.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const handleJobClick = async (jobId: string) => {
    setJobLoading(true);
    onOpen();

    try {
      const res: JobResponse = await getAllJobs();
      if (res.status === "success") {
        const allJobs = Array.isArray(res.result) ? res.result : [res.result];
        const job = allJobs.find((j) => j?.id === jobId);
        setJobDetails(job ?? null);
        if (job) {
          setJobForm({
            companyName: job.companyName,
            jobRole: job.jobRole,
            skills: job.skills,
            experienceLevel: job.experienceLevel,
            educationQualification: job.educationQualification,
            numOpenings: job.numOpenings,
            location: job.location,
            disabilityPreferred: job.disabilityPreferred,
            approxSalary: job.approxSalary,
            rolesAndResponsibilities: job.rolesAndResponsibilities,
            description: job.description,
          });
        } else {
          setJobForm(null);
        }
      }
    } catch (error) {
      console.error(error);
      setJobDetails(null);
      setJobForm(null);
    } finally {
      setJobLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setJobForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : prev
    );
  };

  const handleSave = async () => {
    if (!jobDetails || !jobForm) return;
    setSaving(true);
    try {
      await updateJob(jobDetails.id, jobForm);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!jobDetails) return;
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    setSaving(true);
    try {
      await deleteJob(jobDetails.id);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box mt={5}>
      {/* FILTERS UI */}
      <HStack spacing={4} mb={4}>
        <Input
          placeholder="Search Company Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          maxW="250px"
          bg="white"
        />
        <Select
          placeholder="Filter by Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="sm"
          maxW="200px"
          bg="white"
        >
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Text color={textColor} fontSize="sm">
          Showing {filteredData.length} companies
        </Text>
      </HStack>

      {/* TABLE */}
      <TableContainer
        borderRadius="lg"
        boxShadow="lg"
        overflowY="auto"
        minW="600px"
        maxH="350px"
        bgGradient="linear(to-br, whiteAlpha.800, gray.50)"
      >
        <Table variant="unstyled" size="sm">
          <Thead position="sticky" top={0} zIndex={1}>
            <Tr bg={headerBg}>
              <Th color={textColor}>Company Name</Th>
              <Th color={textColor}>Type</Th>
              <Th color={textColor}>Job Roles</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.length === 0 ? (
              <Tr>
                <Td colSpan={3} textAlign="center" py={6} color={textColor}>
                  No companies found.
                </Td>
              </Tr>
            ) : (
              filteredData.map((company, index) => (
                <Tr
                  key={company.id}
                  bg={index % 2 === 0 ? oddRowBg : evenRowBg}
                >
                  <Td py={3} fontWeight="medium" color={textColor}>
                    {company.name}
                  </Td>
                  <Td py={3} color={textColor}>
                    {company.type}
                  </Td>
                  <Td py={3}>
                    <Flex wrap="wrap" gap={2}>
                      {company.jobs.map((job) => (
                        <Badge
                          key={job.id}
                          colorScheme={getColorForRole(job.role)}
                          variant="subtle"
                          px={3}
                          py={1}
                          fontSize="xs"
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => handleJobClick(job.id)}
                        >
                          {job.role}
                        </Badge>
                      ))}
                    </Flex>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* JOB DETAILS MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {jobLoading && <Spinner />}
            {!jobLoading && jobForm && (
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    name="companyName"
                    value={jobForm.companyName || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Job Role</FormLabel>
                  <Input
                    name="jobRole"
                    value={jobForm.jobRole || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.skills}>
                  <FormLabel>Skills</FormLabel>
                  <Box
                    maxH="200px"
                    overflowY="auto"
                    border="1px solid"
                    borderRadius="md"
                    p={3}
                  >
                    <CheckboxGroup
                      value={jobForm.skills || []}
                      onChange={(selected) => {
                        const arr = Array.isArray(selected)
                          ? selected
                          : [selected];
                        setJobForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                skills: arr.map(String),
                              }
                            : prev
                        );
                      }}
                    >
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                        {allSkills.length > 0 ? (
                          allSkills.map((skill) => (
                            <Checkbox key={skill} value={skill}>
                              {skill}
                            </Checkbox>
                          ))
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            No skills found
                          </Text>
                        )}
                      </SimpleGrid>
                    </CheckboxGroup>
                  </Box>
                  <FormErrorMessage>{errors.skills}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.educationQualification}>
                  <FormLabel>Education Qualification</FormLabel>
                  <Box
                    maxH="200px"
                    overflowY="auto"
                    border="1px solid"
                    borderRadius="md"
                    p={3}
                  >
                    <CheckboxGroup
                      value={jobForm.educationQualification || []}
                      onChange={(selected) => {
                        const arr = Array.isArray(selected) ? selected : [selected];
                        setJobForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                educationQualification: arr.map(String),
                              }
                            : prev
                        );
                      }}
                    >
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                        {allDegrees.length > 0 ? (
                          allDegrees.map((degree) => (
                            <Checkbox key={degree} value={degree}>
                              {degree}
                            </Checkbox>
                          ))
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            No degrees found
                          </Text>
                        )}
                      </SimpleGrid>
                    </CheckboxGroup>
                  </Box>
                  <FormErrorMessage>{errors.educationQualification}</FormErrorMessage>
                </FormControl>


                <FormControl isRequired>
                  <FormLabel>Number of Openings</FormLabel>
                  <HStack>
                    <IconButton
                      aria-label="Decrease"
                      icon={<MinusIcon />}
                      size="sm"
                      onClick={() =>
                        setJobForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                numOpenings: Math.max(
                                  1,
                                  prev.numOpenings - 1
                                ),
                              }
                            : prev
                        )
                      }
                      isDisabled={jobForm.numOpenings === 1}
                    />
                    <Input
                      type="number"
                      value={jobForm.numOpenings || 1}
                      readOnly
                      width="80px"
                      textAlign="center"
                    />
                    <IconButton
                      aria-label="Increase"
                      icon={<AddIcon />}
                      size="sm"
                      onClick={() =>
                        setJobForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                numOpenings: prev.numOpenings + 1,
                              }
                            : prev
                        )
                      }
                    />
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={jobForm.location || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Disability Preferred</FormLabel>
                  <Input
                    name="disabilityPreferred"
                    value={jobForm.disabilityPreferred || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Approx Salary</FormLabel>
                  <Input
                    name="approxSalary"
                    value={jobForm.approxSalary || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Roles and Responsibilities</FormLabel>
                  <Textarea
                    name="rolesAndResponsibilities"
                    value={jobForm.rolesAndResponsibilities || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    value={jobForm.description || ""}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={!!errors.experienceLevel}
                >
                  <FormLabel>Experience</FormLabel>
                  <Select
                    name="experienceLevel"
                    placeholder="Select experience level"
                    value={jobForm.experienceLevel || ""}
                    onChange={handleChange}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2+ years">2+ years</option>
                  </Select>
                  <FormErrorMessage>
                    {errors.experienceLevel}
                  </FormErrorMessage>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              isLoading={saving}
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              colorScheme="blue"
              isLoading={saving}
              onClick={handleSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CompanyTable;
