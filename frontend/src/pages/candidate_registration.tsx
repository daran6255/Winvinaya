import React from 'react';
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Checkbox,
  CheckboxGroup,
  Heading,
  SimpleGrid,
  Flex,
  Text,Divider,
  useBreakpointValue,
  FormErrorMessage,Tooltip,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import ReactPhoneInput from 'react-phone-input-2';
import { CountryData } from 'react-phone-input-2';
import {
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
} from "@chakra-ui/react";

import { getAllJobMelas } from "../helpers/jobmela_service";
import { addCandidate } from "../helpers/candidates_registration_services";
import { CandidateFormData } from "../helpers/model";

import { degrees } from "../constants/degrees";
import { courses } from "../constants/courses";
import { disabilities } from "../constants/disabilities";
import { skills } from "../constants/skills";

import useCustomToast from "../hooks/useCustomToast";
import Footer from '../components/common/Footer';

const steps = [
  { title: "Personal Info", description: "Basic details" },
  { title: "Education", description: "Academic background" },
  { title: "Disability", description: "Disability information" },
  { title: "Professional", description: "Work experience" },
  { title: "Final", description: "Upload documents" },
];

const initialFormData: CandidateFormData = {
  name: "",
  gender: "",
  email: "",
  phone: "",
  guardian_name: "",
  guardian_phone: "",
  city: "",
  state: "",
  pincode: "",
  degree: "",
  branch: "",
  disability_type: "",
  disability_percentage: 0,
  trained_by_winvinaya: "",
  skills: [],
  experience_type: "",
  years_of_experience: undefined,
  current_status: "",
  previous_position: "",
  ready_to_relocate: "",
  resume_path: null,
  disability_certificate_path: null,
  jobmela_name: "",
};

type ErrorState = {
  [key in keyof CandidateFormData]?: string;
};

const CandidateRegistration: React.FC = () => {
  const [formData, setFormData] = useState<CandidateFormData>(initialFormData);
  const [errors, setErrors] = useState<ErrorState>({});
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: steps.length });
  const toast = useCustomToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Validation helpers
  const isValidName = (name: string) => /^[a-zA-Z\s]+$/.test(name.trim());
  // const isValidPhone = (phone: string) => /^\d{12}$/.test(phone.trim());
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Validate current step fields and update errors
  const validateStepFields = (): boolean => {
    const newErrors: ErrorState = {};

    switch (activeStep) {
      case 0: // Personal Info
        if (!formData.name.trim()) {
          newErrors.name = "Name is required";
        } else if (!isValidName(formData.name)) {
          newErrors.name = "Enter a valid name (letters and spaces only)";
        }

        if (!formData.gender) newErrors.gender = "Please select your gender";

        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = "Enter a valid email address";
        }
        break;

      case 1: // Education
        if (!formData.degree) newErrors.degree = "Degree is required";
        if (!formData.branch) newErrors.branch = "Branch is required";
        break;

      case 2: // Disability
        if (!formData.disability_type) newErrors.disability_type = "Select a disability type";
        if (
          formData.disability_percentage === undefined ||
          formData.disability_percentage <= 0 ||
          formData.disability_percentage >= 100
        ) {
          newErrors.disability_percentage = "Enter a valid disability percentage (1-99)";
        }
        if (!formData.trained_by_winvinaya)
          newErrors.trained_by_winvinaya = "Please select Yes or No";
        break;

      case 3: // Professional
        if (!formData.experience_type) newErrors.experience_type = "Select experience type";

        if (formData.experience_type === "Experienced") {
          if (
            formData.years_of_experience === undefined ||
            formData.years_of_experience < 0
          ) {
            newErrors.years_of_experience = "Enter valid years of experience";
          }
          if (!formData.current_status) newErrors.current_status = "Select current status";
          if (!formData.previous_position?.trim())
            newErrors.previous_position = "Enter previous position";
          if (!formData.ready_to_relocate)
            newErrors.ready_to_relocate = "Select relocation readiness";
        }

        if (formData.skills.length === 0) {
          newErrors.skills = "Select at least one skill";
        }
        break;

      case 4: // Final Uploads
        if (!formData.resume_path) newErrors.resume_path = "Please upload your resume";
        if (!formData.disability_certificate_path)
          newErrors.disability_certificate_path = "Please upload disability certificate";
        if (!formData.jobmela_name) newErrors.jobmela_name = "Please select a Job Mela";
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update value
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for the field on change
    setErrors((prev) => {
      if (prev[name as keyof CandidateFormData]) {
        const copy = { ...prev };
        delete copy[name as keyof CandidateFormData];
        return copy;
      }
      return prev;
    });
  };

  const handleSkillChange = (selectedSkills: string[]) => {
    setFormData((prev) => ({ ...prev, skills: selectedSkills }));

    if (errors.skills) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.skills;
        return copy;
      });
    }
  };

  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  type JobMelaOption = {
    name: string;
    date: string; // or Date if you prefer
  };
  
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


  const handleBack = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleNext = () => {
    if (validateStepFields()) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStepFields()) return; // Final check

    try {
      const payload = {
        ...formData,
        resume: formData.resume_path as File,
        disability_certificate: formData.disability_certificate_path as File,
      };
      const result = await addCandidate(payload);
      const successMsg = result?.status || "Candidate registered successfully.";
      toast("Registration Successful", successMsg, "success");
      setActiveStep(0);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast("Registration Failed", errorMsg, "error");
    }
  };

  return (
    <Box px={{ base: 4, md: 8 }} py={6} maxW="6xl" borderRadius="xl" boxShadow="2xl" mx="auto">
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
            Job Mela - Candidate Registration
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
          Register now to participate in upcoming job fairs and unlock new career
          opportunities!
        </Text>
      </Flex>
      <Divider
        mb={6}
        borderColor="black"
        borderWidth="1px"
        borderStyle="solid"
        borderRadius="md" // or "4px" for exact radius
      />
      <Stepper
        index={activeStep}
        orientation="horizontal"
        size="md"
        mb={8}
        overflowX="auto"
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink={0} minW={isMobile ? "60px" : "auto"}>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      
      <VStack spacing={6} align="stretch">
        {/* Step 0 - Personal Info */}
        {activeStep === 0 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                placeholder="Enter your full name"
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.gender}>
              <FormLabel>Gender</FormLabel>
              <Select
                name="gender"
                value={formData.gender}
                placeholder="Select gender"
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <FormErrorMessage>{errors.gender}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                placeholder="Enter your email address"
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.phone} mb={4}>
              <FormLabel>Phone</FormLabel>
              <Box
                borderWidth="1px"
                borderRadius="md"
                borderColor={errors.phone ? "red.500" : "gray.200"}
                _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                px={3}
                py={1}
              >
                <ReactPhoneInput
                  country={'in'}
                  value={formData.phone}
                  onChange={(value, data) => {
                    const dialCode = (data as CountryData).dialCode || '';
                    const formattedPhone = `+${dialCode} ${value.slice(dialCode.length)}`;
                    setFormData((prev) => ({
                      ...prev,
                      phone: formattedPhone,
                    }));
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    placeholder: "Enter your phone number",
                    style: {
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1rem',
                      background: 'transparent',
                    },
                  }}
                  enableSearch
                  containerStyle={{ width: '100%' }}
                  buttonStyle={{ border: 'none', background: 'transparent' }}
                />
              </Box>
              <FormErrorMessage>{errors.phone}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.guardian_name} mb={4}>
              <FormLabel display="flex" alignItems="center" gap={2}>
                Parent/Guardian
                <Tooltip label="Guardian should be above 20 years of age" fontSize="sm" placement="top">
                  <InfoOutlineIcon cursor="pointer" color="gray.500" />
                </Tooltip>
              </FormLabel>
              <Select
                name="guardian_name"
                placeholder="Select relationship"
                value={formData.guardian_name || ""}
                onChange={handleChange}
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </Select>
              <FormErrorMessage>{errors.guardian_name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.guardian_phone} mb={4}>
              <FormLabel>Parent/Guardian Phone</FormLabel>
              <Box
                borderWidth="1px"
                borderRadius="md"
                borderColor={errors.guardian_phone ? "red.500" : "gray.200"}
                _focusWithin={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                px={3}
                py={1}
              >
                <ReactPhoneInput
                  country={'in'}
                  value={formData.guardian_phone}
                  onChange={(value, data) => {
                    const dialCode = (data as CountryData).dialCode || '';
                    const formattedPhone = `+${dialCode} ${value.slice(dialCode.length)}`;
                    setFormData((prev) => ({
                      ...prev,
                      guardian_phone: formattedPhone,
                    }));
                  }}
                  inputProps={{
                    name: 'guardian_phone',
                    required: true,
                    placeholder: "Enter guardian's phone number",
                    style: {
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1rem',
                      background: 'transparent',
                    },
                  }}
                  enableSearch
                  containerStyle={{ width: '100%' }}
                  buttonStyle={{ border: 'none', background: 'transparent' }}
                />
              </Box>
              <FormErrorMessage>{errors.guardian_phone}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Pincode</FormLabel>
              <Input
                name="pincode"
                value={formData.pincode}
                placeholder="Enter your area pincode"
                onChange={handleChange}
              />
            </FormControl>
          </SimpleGrid>
        )}

        {/* Step 1 - Education */}
          {activeStep === 1 && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.degree}>
                <FormLabel>Degree</FormLabel>
                <Select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="Select your degree"
                >
                  {degrees.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.degree}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.branch}>
                <FormLabel>Branch</FormLabel>
                <Select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="Select your branch"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.branch}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          )}

        {/* Step 2 - Disability */}
        {activeStep === 2 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired isInvalid={!!errors.disability_type}>
              <FormLabel>Disability Type</FormLabel>
              <Select
                name="disability_type"
                value={formData.disability_type}
                onChange={handleChange}
                placeholder="Select your disability type"
              >
                {disabilities.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.disability_type}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.disability_percentage}>
              <FormLabel>Disability Percentage</FormLabel>
              <Input
                name="disability_percentage"
                type="number"
                min={1}
                max={99}
                value={formData.disability_percentage || ""}
                onChange={handleChange}
                placeholder="Enter your disability percentage"
              />
              <FormErrorMessage>{errors.disability_percentage}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.trained_by_winvinaya}>
              <FormLabel>Trained By Winvinaya</FormLabel>
              <Select
                name="trained_by_winvinaya"
                value={formData.trained_by_winvinaya}
                onChange={handleChange}
                placeholder="Have you been trained by WinVinaya?"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
              <FormErrorMessage>{errors.trained_by_winvinaya}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        )}

        {/* Step 3 - Professional */}
        {activeStep === 3 && (
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={!!errors.experience_type}>
                <FormLabel>Experience Type</FormLabel>
                <Select
                  name="experience_type"
                  value={formData.experience_type}
                  onChange={handleChange}
                  placeholder="Select your experience type"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="Experienced">Experienced</option>
                </Select>
                <FormErrorMessage>{errors.experience_type}</FormErrorMessage>
              </FormControl>

              {formData.experience_type === "Experienced" && (
                <>
                  <FormControl isRequired isInvalid={!!errors.years_of_experience}>
                    <FormLabel>Years of Experience</FormLabel>
                    <Input
                      type="number"
                      min={0}
                      name="years_of_experience"
                      value={formData.years_of_experience ?? ""}
                      onChange={handleChange}
                      placeholder="Enter your total experience in years"
                    />
                    <FormErrorMessage>{errors.years_of_experience}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.current_status}>
                    <FormLabel>Current Status</FormLabel>
                    <Select
                      name="current_status"
                      value={formData.current_status}
                      onChange={handleChange}
                      placeholder="Select your current employment status"
                    >
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                    </Select>
                    <FormErrorMessage>{errors.current_status}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.previous_position}>
                    <FormLabel>Previous Position</FormLabel>
                    <Input
                      name="previous_position"
                      value={formData.previous_position}
                      onChange={handleChange}
                      placeholder="Enter your last job title"
                    />
                    <FormErrorMessage>{errors.previous_position}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.ready_to_relocate}>
                    <FormLabel>Ready to Relocate</FormLabel>
                    <Select
                      name="ready_to_relocate"
                      value={formData.ready_to_relocate}
                      onChange={handleChange}
                      placeholder="Are you open to relocation?"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                    <FormErrorMessage>{errors.ready_to_relocate}</FormErrorMessage>
                  </FormControl>
                </>
              )}

              <FormControl isRequired isInvalid={!!errors.skills}>
                <FormLabel>Skills</FormLabel>
                <Input
                  placeholder="Search skills..."
                  value={skillSearchTerm}
                  onChange={(e) => setSkillSearchTerm(e.target.value)}
                  mb={2}
                />
                <Box
                  maxH="200px"
                  overflowY="auto"
                  border="1px solid"
                  borderColor='gray.600'
                  borderRadius="md"
                  p={3}
                >
                <CheckboxGroup
                  value={formData.skills}
                  onChange={handleSkillChange}
                >
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
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
            </SimpleGrid>
          </Box>
        )}

        {/* Step 4 - Final */}
        {activeStep === 4 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            
            {/* Custom styled Resume upload */}
            <FormControl isRequired isInvalid={!!errors.resume_path}>
              <FormLabel>Upload Resume</FormLabel>
              <input
                type="file"
                name="resume_path"
                accept=".pdf,.doc,.docx"
                id="resume-upload"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData((prev) => ({ ...prev, resume_path: file }));
                  if (errors.resume_path) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.resume_path;
                      return copy;
                    });
                  }
                }}
              />
              <Button
                as="label"
                htmlFor="resume-upload"
                cursor="pointer"
                colorScheme="blue"
                variant="outline"
                w="100%"
              >
                Choose Resume File
              </Button>
              <Text mt={2} fontSize="sm" color="gray.600" isTruncated maxW="100%">
                {formData.resume_path?.name || "No file chosen"}
              </Text>
              <FormErrorMessage>{errors.resume_path}</FormErrorMessage>
            </FormControl>

            {/* Custom styled Disability certificate upload */}
            <FormControl isRequired isInvalid={!!errors.disability_certificate_path}>
              <FormLabel>Upload Disability Certificate</FormLabel>
              <input
                type="file"
                name="disability_certificate_path"
                accept=".pdf,.jpg,.png"
                id="disability-upload"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData((prev) => ({ ...prev, disability_certificate_path: file }));
                  if (errors.disability_certificate_path) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.disability_certificate_path;
                      return copy;
                    });
                  }
                }}
              />
              <Button
                as="label"
                htmlFor="disability-upload"
                cursor="pointer"
                colorScheme="blue"
                variant="outline"
                w="100%"
              >
                Choose Disability Certificate File
              </Button>
              <Text mt={2} fontSize="sm" color="gray.600" isTruncated maxW="100%">
                {formData.disability_certificate_path?.name || "No file chosen"}
              </Text>
              <FormErrorMessage>{errors.disability_certificate_path}</FormErrorMessage>
            </FormControl>

            {/* Job Mela select with placeholder */}
            <FormControl isRequired isInvalid={!!errors.jobmela_name}>
              <FormLabel>Job Mela</FormLabel>
              <Select
                name="jobmela_name"
                value={formData.jobmela_name}
                onChange={handleChange}
              >
                <option value="">Select Job Mela</option>
                {jobMelaOptions.map(({ name, date }) => (
                  <option key={name} value={name}>
                    {name} - ({new Date(date).toLocaleDateString('en-IN')})
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.jobmela_name}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        )}

      </VStack>

      <Flex mt={6} justify="space-between">
        <Button
          onClick={handleBack}
          isDisabled={activeStep === 0}
          colorScheme="gray"
        >
          Back
        </Button>
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} colorScheme="teal">
            Next
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button onClick={handleSubmit} colorScheme="green">
            Submit
          </Button>
        )}
      </Flex>
      <Footer />
    </Box>
  );
};

export default CandidateRegistration;
