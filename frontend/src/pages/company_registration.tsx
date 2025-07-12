import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  useColorModeValue,
  useTheme,
  Table, Flex,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
  FormErrorMessage,
  Divider,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { getAllJobMelas } from '../helpers/jobmela_service';
import useCustomToast from '../hooks/useCustomToast';
import { addCompany } from '../helpers/company_details_services';
import { CompanyCreateForm, Participant, JobMelaOption } from '../helpers/model';
import Footer from '../components/common/Footer';


const CompanyDetailsForm: React.FC = () => {
  // const [jobMelaOptions, setJobMelaOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState<CompanyCreateForm>({
    jobMela: '',
    companyName: '',
    type: '',
    contactName: '',
    contactNumber: '',
    contactEmail: '',
    numParticipants: '',
    participants: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const theme = useTheme();
  const showToast = useCustomToast();
  const [jobMelaOptions, setJobMelaOptions] = React.useState<JobMelaOption[]>([]);

  useEffect(() => {
  const fetchJobMelas = async () => {
    const data = await getAllJobMelas();
    if (data && Array.isArray(data.result)) {
      const today = new Date();
      const upcomingMelas = data.result.filter((mela) => {
        const melaDate = new Date(mela.jobmela_date);
        return melaDate >= today;
      });
      // Store both name and date in an array of objects
      const melaOptions = upcomingMelas.map((mela) => ({
        name: mela.jobmela_name,
        date: mela.jobmela_date, // Keep as string or parse to Date if you want
      }));
      setJobMelaOptions(melaOptions);
    }
  };
  fetchJobMelas();
}, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.jobMela) newErrors.jobMela = 'Required';
    if (!formData.companyName) newErrors.companyName = 'Required';
    if (!formData.type) newErrors.type = 'Required';
    if (!formData.contactName) newErrors.contactName = 'Required';

    // Validate phone
    const isValidIndianPhone = (phone: string) => {
      const stripped = phone.replace(/^(\+91|91)/, '');
      return /^\d{10}$/.test(stripped);
    };

    if (!isValidIndianPhone(formData.contactNumber)) {
      newErrors.contactNumber = 'Invalid';
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid';
    }

    const num = parseInt(formData.numParticipants);
    if (!formData.numParticipants || isNaN(num) || num < 1 || num > 10) {
      newErrors.numParticipants = 'Must be between 1 and 10';
    }

    // Validate participants
    formData.participants.forEach((p, idx) => {
      const baseKey = `participant_${idx}`;
      if (!p.name || !p.contact || !p.designation || !p.email) {
        newErrors[baseKey] = 'All fields are required';
      } else if (!isValidIndianPhone(p.contact)) {
        newErrors[baseKey] = 'Invalid contact';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        newErrors[baseKey] = 'Invalid email';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateParticipants = (count: number) => {
    const updated = Array.from({ length: count }, (_, i) =>
      formData.participants[i] || {
        name: '',
        contact: '',
        designation: '',
        email: '',
      }
    );
    setFormData((prev) => ({
      ...prev,
      numParticipants: count.toString(),
      participants: updated,
    }));
  };

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const updated = [...formData.participants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, participants: updated }));
  };

const fields: {
  name: keyof Pick<CompanyCreateForm, 'jobMela' | 'companyName' | 'type' | 'contactName' | 'contactEmail'>;
  label: string;
  type: 'text' | 'email' | 'select';
  options?: string[];
}[] = [
 { name: 'jobMela', label: 'Job Mela', type: 'select', options: jobMelaOptions.map(opt => `${opt.name} - ${new Date(opt.date).toLocaleDateString('en-IN')}`) },
  { name: 'companyName', label: 'Company Name', type: 'text' },
  { name: 'type', label: 'Type', type: 'select', options: ['Hiring', 'Participation', 'Stalls', 'Others'] },
  { name: 'contactName', label: 'Primary Contact Name', type: 'text' },
  { name: 'contactEmail', label: 'Primary Contact Email', type: 'email' },
];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CompanyCreateForm = {
        ...formData,
        numParticipants: parseInt(formData.numParticipants).toString(),
        participants: formData.participants,
      };
      const res = await addCompany(payload);

      if (res.status === 'success') {
        showToast('Success', 'Company added successfully!', 'success');
        setFormData({
          jobMela: '',
          companyName: '',
          type: '',
          contactName: '',
          contactNumber: '',
          contactEmail: '',
          numParticipants: '',
          participants: [],
        });
      } else {
        showToast('Error', res.message, 'error');
      }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Something went wrong';
        showToast('Error', errorMessage, 'error');
      }
  };

  return (
    <Box
      maxW="7xl"
      mx="auto"
      mt={10}
      p={{ base: 4, md: 8 }}
      borderRadius="2xl"
      boxShadow="2xl"
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        mb={10}
        px={{ base: 6, md: 16 }}
        py={{ base: 10, md: 14 }}
        bgGradient="linear(to-r, teal.400, teal.600)"
        borderRadius="xl"
        boxShadow="2xl"
        textAlign="center"
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative blurred circles */}
        <Box
          position="absolute"
          top="-40px"
          left="-40px"
          w="120px"
          h="120px"
          bg="rgba(255, 255, 255, 0.15)"
          borderRadius="full"
          filter="blur(60px)"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="-50px"
          right="-50px"
          w="160px"
          h="160px"
          bg="rgba(255, 255, 255, 0.2)"
          borderRadius="full"
          filter="blur(80px)"
          zIndex={0}
        />

        <Flex
          w="100%"
          align="center"
          justify="space-between"
          direction={{ base: "column", md: "row" }}
          mb={6}
          maxW="6xl"
          zIndex={1}
          gap={{ base: 4, md: 0 }}
        >
          <Box mb={{ base: 4, md: 0 }} flexShrink={0}>
            <img
              src="/assets/images/WVIS_Logo.png"
              alt="Logo"
              style={{
                height: "70px",
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.82)",
                padding: "6px",
              }}
            />
          </Box>
          <Heading
            as="h1"
            flex="1"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="extrabold"
            letterSpacing="tight"
            lineHeight="1.1"
            textShadow="0 2px 8px rgba(0,0,0,0.3)"
          >
            Job Mela - Company Registration
          </Heading>
          <Box w={{ base: "0", md: "80px" }} />
        </Flex>

        <Text
          maxW="4xl"
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="medium"
          letterSpacing="wide"
          lineHeight="1.5"
          px={{ base: 4, md: 0 }}
          textShadow="0 1px 4px rgba(0,0,0,0.25)"
        >
          Register now to participate in upcoming job fairs and unlock opportunities!
        </Text>
      </Flex>
      <Divider
        mb={6}
        borderColor="black"
        borderWidth="1px"
        borderStyle="solid"
        borderRadius="md" // or "4px" for exact radius
      />

      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {fields.map((field) => {
              const value = formData[field.name] ?? '';

              return (
                <FormControl
                  key={field.name}
                  isRequired
                  isInvalid={!!errors[field.name]}
                >
                  <FormLabel>{field.label}</FormLabel>
                  {field.type === 'select' ? (
                    <Select
                      name={field.name}
                      placeholder={`Select ${field.label}`}
                      value={value}
                      onChange={handleChange}
                    >
                      {field.name === 'jobMela'
                        ? jobMelaOptions.map((opt) => (
                            <option key={opt.name} value={opt.name}>
                              {opt.name} - {new Date(opt.date).toLocaleDateString('en-IN')}
                            </option>
                          ))
                        : field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))
                      }
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      name={field.name}
                      placeholder={`Enter ${field.label}`}
                      value={value}
                      onChange={handleChange}
                    />
                  )}
                  <FormErrorMessage>{errors[field.name]}</FormErrorMessage>
                </FormControl>
              );
            })}


            <FormControl isRequired isInvalid={!!errors.contactNumber}>
              <FormLabel>Primary Contact Number</FormLabel>
              
                  <PhoneInput
                    country={'in'}
                    value={formData.contactNumber}
                    onChange={(phone) => setFormData(prev => ({ ...prev, contactNumber: phone }))}
                    inputStyle={{ width: '100%' }}
                    enableSearch
                    inputProps={{ name: 'contactNumber' }}
                  />
                
              <FormErrorMessage>{errors.contactNumber}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired isInvalid={!!errors.numParticipants}>
            <FormLabel>Number of Participants</FormLabel>
            <HStack justify="flex-start">
              <IconButton
                aria-label="Decrease"
                icon={<Text fontSize="lg">−</Text>}
                onClick={() => {
                  const current = parseInt(formData.numParticipants || '0', 10);
                  const newCount = Math.max(0, current - 1);
                  updateParticipants(newCount);
                }}
                isDisabled={parseInt(formData.numParticipants || '0', 10) <= 0}
                size="sm"
              />
              <Text minW="40px" textAlign="center">{formData.numParticipants || '0'}</Text>
              <IconButton
                aria-label="Increase"
                icon={<Text fontSize="lg">+</Text>}
                onClick={() => {
                  const current = parseInt(formData.numParticipants || '0', 10);
                  if (current < 10) {
                    updateParticipants(current + 1);
                  }
                }}
                isDisabled={parseInt(formData.numParticipants || '0', 10) >= 10}
                size="sm"
              />
            </HStack>
            <FormErrorMessage>{errors.numParticipants}</FormErrorMessage>
          </FormControl>

          {formData.participants.length > 0 && (
            <>
              <Divider />
              <Heading as="h4" size="md" mt={6} mb={4}>Participant Details</Heading>
              <Box overflowX="auto">
                <Table variant="striped" size="sm">
                  <Thead bg={theme.colors.ui.secondary}>
                    <Tr>
                      <Th color="white" isTruncated>Name</Th>
                      <Th color="white" isTruncated>Contact</Th>
                      <Th color="white" isTruncated>Designation</Th>
                      <Th color="white" isTruncated>Email</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {formData.participants.map((participant, index) => (
                      <Tr key={index}>
                        {(['name', 'contact', 'designation', 'email'] as (keyof Participant)[]).map((field) => (
                          <Td key={field}>
                            {field === 'contact' ? (
                              <PhoneInput
                                country="in"
                                value={participant.contact}
                                onChange={(phone) => handleParticipantChange(index, 'contact', phone)}
                                inputStyle={{
                                  backgroundColor: "transparent",
                                }}
                              />
                            ) : (
                              <Input
                                value={participant[field] || ''}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                onChange={(e) => handleParticipantChange(index, field, e.target.value)}
                                size="sm"
                              />
                            )}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            alignSelf="center"
            mt={6}
          >
            Submit
          </Button>
        </VStack>
      </form>
      <Footer />
    </Box>
  );
};

export default CompanyDetailsForm;
