import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  VStack,
  Icon,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Grid,
  Text,
  HStack,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { Plus, Calendar, MapPin, Users, Edit2, Trash2 } from "lucide-react";
import { createJobMela, deleteJobMela, updateJobMela, getAllJobMelas } from "../../helpers/jobmela_service";
import { JobMela, JobMelaCreateRequest } from "../../helpers/model";
import useCustomToast from "../../hooks/useCustomToast";
import { AxiosError } from "axios";

const JobmelaLayout: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showToast = useCustomToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<JobMelaCreateRequest>({
    jobmela_name: "",
    jobmela_date: "",
    jobmela_location: "",
    jobmela_partner: "",
  });

  const [jobmelas, setJobmelas] = useState<JobMela[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const fetchJobmelas = useCallback(async () => {
    try {
      const res = await getAllJobMelas();
      if (res.status === "success" && Array.isArray(res.result)) {
        setJobmelas(res.result);
      } else {
        throw new Error(typeof res.result === "string" ? res.result : "Unexpected response format");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      showToast("Error", err.message || "Failed to fetch Job Melas", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchJobmelas();
  }, [fetchJobmelas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedId !== null) {
        await updateJobMela(selectedId, formData);
        showToast("Success", "Job Mela updated successfully", "success");
      } else {
        await createJobMela(formData);
        showToast("Success", "Job Mela created successfully", "success");
      }
      onClose();
      setFormData({ jobmela_name: "", jobmela_date: "", jobmela_location: "", jobmela_partner: "" });
      setIsEditing(false);
      setSelectedId(null);
      fetchJobmelas();
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      showToast("Error", err.message || "Failed to save Job Mela", "error");
    }
  };

  const handleEdit = (jm: JobMela) => {
    setFormData(jm);
    setIsEditing(true);
    setSelectedId(jm.id);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId !== null) {
      try {
        await deleteJobMela(deleteId);
        showToast("Success", "Job Mela deleted", "success");
        setIsDeleteOpen(false);
        fetchJobmelas();
      } catch {
        showToast("Error", "Failed to delete", "error");
      }
    }
  };

  const today = new Date();
  const upcomingJobmelas = jobmelas
    .filter(jm => new Date(jm.jobmela_date) >= today)
    .map(jm => ({
      ...jm,
      daysLeft: Math.ceil((new Date(jm.jobmela_date).getTime() - today.getTime()) / (1000 * 3600 * 24))
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const pastJobmelas = jobmelas
    .filter(jm => new Date(jm.jobmela_date) < today)
    .sort((a, b) => new Date(a.jobmela_date).getTime() - new Date(b.jobmela_date).getTime());

  const sortedJobmelas = [...upcomingJobmelas, ...pastJobmelas];

  return (
    <VStack spacing={6} align="stretch" p={6}>
      <Flex justify="flex-end">
        <Button leftIcon={<Icon as={Plus} />} colorScheme="teal" variant="outline" onClick={() => { setIsEditing(false); onOpen(); }}>
          Add Job Mela
        </Button>
      </Flex>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} gap={8}>
        {sortedJobmelas.map((jm) => {
          const isPast = new Date(jm.jobmela_date) < today;
          return (
            <Box
              key={jm.id}
              p={6}
              borderRadius="2xl"
              bgGradient={isPast ? "linear(to-r, gray.200, gray.300)" : "#DCA06D"}
              color="gray.800"
              opacity={isPast ? 0.7 : 1}
              shadow="xl"
              border="1px solid"
              borderColor={isPast ? "gray.300" : "teal.300"}
              position="relative"
              onClick={() => navigate(`/jobmela/${jm.id}`)}
            >
              <Flex justify="space-between" align="center" mb={3}>
                {/* Left: Badge */}
                {isPast ? (
                  <Box
                    bg="gray.500"
                    color="white"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontSize="xs"
                    display="inline-block"
                  >
                    Past Event
                  </Box>
                ) : (
                  <Box
                    bg="teal.600"
                    color="white"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontSize="xs"
                    display="inline-block"
                  >
                    Upcoming • {jm.daysLeft} day{jm.daysLeft === 1 ? "" : "s"} left
                  </Box>
                )}

                {/* Right: Icons */}
                <HStack spacing={2}>
                  {!isPast && (
                    <IconButton
                      aria-label="Edit"
                      icon={<Edit2 size={16} />}
                      size="sm"
                      onClick={() => handleEdit(jm)}
                    />
                  )}
                  <IconButton
                    aria-label="Delete"
                    icon={<Trash2 size={16} />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      setDeleteId(jm.id);
                      setIsDeleteOpen(true);
                    }}
                  />
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xl" fontWeight="bold" noOfLines={2}>{jm.jobmela_name}</Text>
              </Flex>

              <VStack spacing={3} align="start">
                <HStack><Icon as={Calendar} boxSize={5} color="teal.600" /><Text fontSize="sm"><b>Date:</b> {jm.jobmela_date}</Text></HStack>
                <HStack><Icon as={MapPin} boxSize={5} color="pink.500" /><Text fontSize="sm"><b>Location:</b> {jm.jobmela_location}</Text></HStack>
                <HStack><Icon as={Users} boxSize={5} color="purple.500" /><Text fontSize="sm"><b>Partner:</b> {jm.jobmela_partner}</Text></HStack>
              </VStack>

              
            </Box>
          );
        })}
      </Grid>

      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit Job Mela" : "Add Job Mela"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired><FormLabel>Job Mela Name</FormLabel><Input name="jobmela_name" value={formData.jobmela_name} onChange={handleChange} placeholder="Enter job mela name" /></FormControl>
            <FormControl mb={4} isRequired><FormLabel>Date</FormLabel><Input type="date" name="jobmela_date" value={formData.jobmela_date} onChange={handleChange} /></FormControl>
            <FormControl mb={4} isRequired><FormLabel>Location</FormLabel><Input name="jobmela_location" value={formData.jobmela_location} onChange={handleChange} placeholder="Enter location" /></FormControl>
            <FormControl mb={4} isRequired><FormLabel>Partner</FormLabel><Input name="jobmela_partner" value={formData.jobmela_partner} onChange={handleChange} placeholder="Enter partner name" /></FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Cancel</Button>
            <Button colorScheme="teal" onClick={handleSubmit}>{isEditing ? "Update" : "Submit"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={() => setIsDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Confirmation</AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to delete this Job Mela?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default JobmelaLayout;
