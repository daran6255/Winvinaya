import { useEffect, useState } from "react";
import {
  Box, Button, Table,
  Thead, Tbody, Tr, Th,
  Td, Spinner, Badge,
  useDisclosure, Modal,
  ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter,
  FormControl, FormLabel,
  Input, Tooltip, Flex,
  Select,
  SimpleGrid, TableContainer,
  VStack,
} from "@chakra-ui/react";
import {
  getAllSourcing,
  addSourcing,
  updateSourcing,
} from "../../helpers/sourcing_services";
import {
  getAllCandidates,
} from "../../helpers/candidates_registration_services";
import {
  Candidate,
  Sourcing,
  SourcingCreateRequest,
  SkillLevel,
} from "../../helpers/model";
import { skills } from "../../constants/skills";


const domains = ["ITFS", "ITST", "BFSI", "Tally", "Zoho"];
const skillLevels = [
  { value: "0", label: "Level 0 (0-10%)", tooltip: "0% - 10% proficiency" },
  { value: "1", label: "Level 1 (10-30%)", tooltip: "10% - 30% proficiency" },
  { value: "2", label: "Level 2 (30-50%)", tooltip: "30% - 50% proficiency" },
  { value: "3", label: "Level 3 (50-60%)", tooltip: "50% - 60% proficiency" },
  { value: "4", label: "Level 4 (60-80%)", tooltip: "60% - 80% proficiency" },
  { value: "5", label: "Level 5 (80-100%)", tooltip: "80% - 100% proficiency" },
];

const SourcingPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sourcing, setSourcing] = useState<Sourcing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  const [form, setForm] = useState<SourcingCreateRequest>({
    candidate_id: "",
    trained_by_winvinaya: "No",
    willing_for_training: undefined,
    skills: [],
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadData = async () => {
    setLoading(true);
    try {
      const [candidatesRes, sourcingRes] = await Promise.all([
        getAllCandidates(),
        getAllSourcing(),
      ]);
      if (candidatesRes.status === "success") {
        setCandidates(candidatesRes.result as Candidate[]);
      }
      if (sourcingRes.status === "success") {
        setSourcing(sourcingRes.result as Sourcing[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);

    // Check if sourcing exists for this candidate
    const existing = sourcing.find((s) => s.candidate_id === candidate.id);

    if (existing) {
      setForm({
        candidate_id: candidate.id,
        trained_by_winvinaya: existing.trained_by_winvinaya,
        batch_id: existing.batch_id,
        domain: existing.domain,
        duration_from_month: existing.duration_from_month,
        duration_from_year: existing.duration_from_year,
        duration_to_month: existing.duration_to_month,
        duration_to_year: existing.duration_to_year,
        willing_for_training: existing.willing_for_training,
        skills: existing.skills,
      });
    } else {
      setForm({
        candidate_id: candidate.id,
        trained_by_winvinaya: "No",
        willing_for_training: undefined,
        skills: [],
      });
    }
    onOpen();
  };

const handleChange = <K extends keyof SourcingCreateRequest>(
  key: K,
  value: SourcingCreateRequest[K]
) => {
  setForm((prev) => ({
    ...prev,
    [key]: value,
  }));
};

  const handleSkillChange = (index: number, field: keyof SkillLevel, value: string) => {
    const updated = [...(form.skills || [])];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setForm((prev) => ({
      ...prev,
      skills: updated,
    }));
  };

  const addSkillField = () => {
    setForm((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { skill: "", level: "" }],
    }));
  };

  const saveSourcing = async () => {
    try {
      if (selectedCandidate) {
        const existing = sourcing.find(
          (s) => s.candidate_id === selectedCandidate.id
        );
        if (existing) {
          await updateSourcing(existing.id, form);
        } else {
          await addSourcing(form);
        }
        onClose();
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isVerified = (candidateId: string) => {
    return sourcing.some((s) => s.candidate_id === candidateId);
  };

  if (loading) return <Spinner />;
return(
 <Box mt={5}>
  {/* Search and Filter */}
  <Flex mb={4} gap={4}>
    <FormControl maxW="250px">
      <FormLabel fontSize="sm">Search Candidates</FormLabel>
      <Input
        size="sm"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </FormControl>
  </Flex>

<TableContainer
  borderWidth="1px"
  borderRadius="lg"
  maxH="250px"
  overflowY="auto"
  boxShadow="md"
>
  <Table variant="simple">
    <Thead position="sticky" top={0} zIndex={1} bg="white">
      <Tr>
        <Th>Name</Th>
        <Th>Email</Th>
        <Th>Phone</Th>
        <Th>Trained by WinVinaya</Th>
        <Th>Resume</Th>
        <Th>Verified</Th>
        <Th>Action</Th>
      </Tr>
    </Thead>
    <Tbody>
      {candidates
        .filter((c) => {
          const matchesSearch =
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())

          return matchesSearch;
        })
        .map((c) => {
          const sourcingData = sourcing.find(
            (s) => s.candidate_id === c.id
          );

          return (
            <Tr key={c.id}>
              <Td>{c.name}</Td>
              <Td>{c.email}</Td>
              <Td>{c.phone}</Td>
              <Td>
                {sourcingData ? (
                  <Badge
                    colorScheme={
                      sourcingData.trained_by_winvinaya === "Yes"
                        ? "green"
                        : "red"
                    }
                  >
                    {sourcingData.trained_by_winvinaya}
                  </Badge>
                ) : (
                  <Badge colorScheme="gray">N/A</Badge>
                )}
              </Td>
              <Td>
                {c.resume_path ? (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => window.open(c.resume_path, "_blank")}
                  >
                    View
                  </Button>
                ) : (
                  <Badge colorScheme="gray">N/A</Badge>
                )}
              </Td>
              <Td>
                {isVerified(c.id) ? (
                  <Badge colorScheme="green">Yes</Badge>
                ) : (
                  <Badge colorScheme="red">No</Badge>
                )}
              </Td>
              <Td>
                <Button size="sm" onClick={() => handleOpenModal(c)}>
                  {isVerified(c.id) ? "Edit" : "Add"}
                </Button>
              </Td>
            </Tr>
          );
        })}
    </Tbody>
  </Table>
</TableContainer>



      {/* Sourcing Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sourcing Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCandidate && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>Candidate Name</FormLabel>
                  <Input
                    value={selectedCandidate.name}
                    isReadOnly
                  />
                </FormControl>
                {selectedCandidate?.disability_certificate_path && (
                    <FormControl>
                      <FormLabel>Disability Certificate</FormLabel>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        variant="outline"
                        onClick={() =>
                          window.open(selectedCandidate.disability_certificate_path, "_blank")
                        }
                      >
                        View Disability Certificate
                      </Button>
                    </FormControl>
                  )}
                <FormControl>
                  <FormLabel>Trained by WinVinaya?</FormLabel>
                  <Select
                    value={form.trained_by_winvinaya}
                    onChange={(e) =>
                      handleChange(
                        "trained_by_winvinaya",
                        e.target.value as "Yes" | "No"
                      )
                    }
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </FormControl>

                {form.trained_by_winvinaya === "Yes" && (
                  <>
                    <SimpleGrid columns={2} spacing={3}>
                      <FormControl>
                        <FormLabel>Batch ID</FormLabel>
                        <Input
                          value={form.batch_id || ""}
                          onChange={(e) =>
                            handleChange("batch_id", e.target.value)
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Domain</FormLabel>
                        <Select
                          placeholder="Select domain"
                          value={form.domain || ""}
                          onChange={(e) =>
                            handleChange("domain", e.target.value)
                          }
                        >
                          {domains.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={4} spacing={3}>
                      <FormControl>
                        <FormLabel>From Month</FormLabel>
                        <Input
                          type="number"
                          value={form.duration_from_month || ""}
                          onChange={(e) =>
                            handleChange(
                              "duration_from_month",
                              Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>From Year</FormLabel>
                        <Input
                          type="number"
                          value={form.duration_from_year || ""}
                          onChange={(e) =>
                            handleChange(
                              "duration_from_year",
                              Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>To Month</FormLabel>
                        <Input
                          type="number"
                          value={form.duration_to_month || ""}
                          onChange={(e) =>
                            handleChange(
                              "duration_to_month",
                              Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>To Year</FormLabel>
                        <Input
                          type="number"
                          value={form.duration_to_year || ""}
                          onChange={(e) =>
                            handleChange(
                              "duration_to_year",
                              Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                    </SimpleGrid>
                  </>
                )}

                {form.trained_by_winvinaya === "No" && (
                  <FormControl>
                    <FormLabel>Willing for Training?</FormLabel>
                    <Select
                      placeholder="Select option"
                      value={form.willing_for_training || ""}
                      onChange={(e) =>
                        handleChange(
                          "willing_for_training",
                          e.target.value as "Yes" | "No"
                        )
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </FormControl>
                )}

				<Box>
				<Button onClick={addSkillField} size="sm">
					Add Skill
				</Button>
				<VStack spacing={2} mt={3}>
					{form.skills?.map((s, idx) => (
					<SimpleGrid columns={3} spacing={3} key={idx}>
						{/* Skill dropdown */}
						<FormControl>
						<FormLabel>Skill</FormLabel>
						<Select
							placeholder="Select skill"
							value={s.skill}
							onChange={(e) =>
							handleSkillChange(idx, "skill", e.target.value)
							}
						>
							{skills.map((skill: string) => (
							<option key={skill} value={skill}>
								{skill}
							</option>
							))}
						</Select>
						</FormControl>
						{/* Level dropdown */}
						<FormControl>
						<FormLabel>Level</FormLabel>
						<Select
							placeholder="Select level"
							value={s.level}
							onChange={(e) =>
							handleSkillChange(idx, "level", e.target.value)
							}
						>
							{skillLevels.map((level) => (
							<option key={level.value} value={level.value}>
								{level.label}
							</option>
							))}
						</Select>
						</FormControl>

						{/* Tooltip icon */}
						<Flex align="center" justify="center">
						<Tooltip
							label={
							skillLevels.find((l) => l.value === s.level)?.tooltip || ""
							}
							hasArrow
							placement="top"
						>
							<span style={{ cursor: "pointer" }}>ℹ️</span>
						</Tooltip>
						</Flex>
					</SimpleGrid>
					))}
				</VStack>
				</Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={saveSourcing}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SourcingPage;
