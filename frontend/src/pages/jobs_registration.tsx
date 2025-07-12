import React, { useEffect, useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Select, VStack,
  Heading, useColorModeValue, FormErrorMessage,
  SimpleGrid, Textarea, Text, Flex, Divider,
  Checkbox, CheckboxGroup,
} from '@chakra-ui/react';
import { addJob } from '../helpers/jobs_services';
import { getAllCompanies } from '../helpers/company_details_services';
import { JobCreateForm, Company, JobResponse } from '../helpers/model';
import useCustomToast from '../hooks/useCustomToast';
import Footer from '../components/common/Footer';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { HStack, IconButton } from '@chakra-ui/react';
import { skills } from '../constants/skills';
import { degrees } from "../constants/degrees";

const JobsRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<JobCreateForm>({
    companyName: '',
    jobRole: '',
    skills: [],
    experienceLevel: '',
    educationQualification: [],
    numOpenings: 1,
    location: '',
    disabilityPreferred: '',
    approxSalary: undefined,
    rolesAndResponsibilities: '',
    description: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]); 
  const showToast = useCustomToast();
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [degreeSearch, setDegreeSearch] = useState<string>("");
  
  const filteredSkills = skills.filter((skill) =>
  skill.toLowerCase().includes(skillSearch.toLowerCase())
);
  const filteredDegrees = degrees.filter((deg) =>
  deg.toLowerCase().includes(degreeSearch.toLowerCase())
);
  // console.log('Selected skills:', selected);

//   const theme = useTheme();

  useEffect(() => {
  const fetchCompanies = async () => {
    const data = await getAllCompanies();
    if (data.status === 'success' && Array.isArray(data.result)) {
      const companies: Company[] = data.result;
      const companyList = companies.map((c) => ({
        id: c.id,
        name: c.companyName,
      }));

      setCompanyOptions(companyList);  // ✅ Use companyList here
    } else {
      console.error('Failed to fetch companies:', data);
    }
  };
  fetchCompanies();
}, []);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.companyName) newErrors.companyName = 'Required';
    if (!formData.jobRole) newErrors.jobRole = 'Required';
    if (formData.skills.length === 0) newErrors.skills = 'Enter at least one skill';
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Required';
    if (!formData.educationQualification || formData.educationQualification.length === 0) {
      newErrors.educationQualification = "Select at least one qualification";
    }
    if (!formData.location) newErrors.location = 'Required';
    if (!formData.rolesAndResponsibilities) newErrors.rolesAndResponsibilities = 'Required';
    if (!formData.description) newErrors.description = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res: JobResponse = await addJob(formData);
      if (res.status === 'success') {
        showToast('Success', 'Job registered successfully', 'success');
        setFormData({
          companyName: '',
          jobRole: '',
          skills: [],
          experienceLevel: '',
          educationQualification: [],
          numOpenings: 1,
          location: '',
          disabilityPreferred: '',
          approxSalary: undefined,
          rolesAndResponsibilities: '',
          description: ''
        });
      } else {
        showToast('Error', res.message || 'Unknown error', 'error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      showToast('Error', message, 'error');
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
                Job Description - Jobs and Positions
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
            <FormControl isRequired isInvalid={!!errors.companyName}>
              <FormLabel>Company</FormLabel>
              <Select
                name="companyName"
                placeholder="Select company"
                value={formData.companyName}
                onChange={handleChange}
              >
                {companyOptions.map((comp) => (
                  <option key={comp.id} value={comp.name}>{comp.name}</option>
                ))}
              </Select>
              <FormErrorMessage>{errors.companyName}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.jobRole}>
              <FormLabel>Job Role</FormLabel>
              <Input
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
              />
              <FormErrorMessage>{errors.jobRole}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.educationQualification}>
              <FormLabel>Educational Qualification</FormLabel>

              <Input
                placeholder="Search qualifications..."
                value={degreeSearch}
                onChange={(e) => setDegreeSearch(e.target.value)}
                mb={3}
              />

              <Box
                maxH="200px"
                overflowY="auto"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                borderRadius="md"
                p={3}
              >
                <CheckboxGroup
                  value={formData.educationQualification}
                  onChange={(selected) => {
                    const arr = Array.isArray(selected) ? selected : [selected];
                    console.log("Selected degrees:", arr);
                    setFormData((prev) => ({
                      ...prev,
                      educationQualification: arr.map(String),
                    }));
                  }}
                >
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2}>
                    {filteredDegrees.length > 0 ? (
                      filteredDegrees.map((deg) => (
                        <Checkbox key={deg} value={deg}>
                          {deg}
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

            <FormControl isInvalid={!!errors.skills}>
              <FormLabel>Skills</FormLabel>

              <Input
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                mb={3}
              />

              <Box
                maxH="200px"
                overflowY="auto"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                borderRadius="md"
                p={3}
              >
                <CheckboxGroup
                  value={formData.skills}
                  onChange={(selected) => {
                    const arr = Array.isArray(selected) ? selected : [selected];
                    console.log('Selected skills:', arr);
                    setFormData((prev) => ({
                      ...prev,
                      skills: arr.map(String),
                    }));
                  }}
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

            <FormControl isRequired>
                <FormLabel>Number of Openings</FormLabel>
                <HStack>
                    <IconButton
                    aria-label="Decrease"
                    icon={<MinusIcon />}
                    size="sm"
                    onClick={() =>
                        setFormData(prev => ({
                        ...prev,
                        numOpenings: Math.max(1, prev.numOpenings - 1)
                        }))
                    }
                    isDisabled={formData.numOpenings <= 1}
                    />
                    <Input
                    type="number"
                    value={formData.numOpenings}
                    readOnly
                    width="80px"
                    textAlign="center"
                    />
                    <IconButton
                    aria-label="Increase"
                    icon={<AddIcon />}
                    size="sm"
                    onClick={() =>
                        setFormData(prev => ({
                        ...prev,
                        numOpenings: prev.numOpenings + 1
                        }))
                    }
                    />
                </HStack>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.experienceLevel}>
              <FormLabel>Experience</FormLabel>
              <Select
                name="experienceLevel"
                placeholder="Select experience level"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-2 years">1-2 years</option>
                <option value="2+ years">2+ years</option>
              </Select>
              <FormErrorMessage>{errors.experienceLevel}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Approximate Salary</FormLabel>
              <Input
                type="number"
                name="approxSalary"
                value={formData.approxSalary ?? ''}
                onChange={handleChange}
                placeholder="e.g. 350000"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Disability Preferred</FormLabel>
              <Input
                name="disabilityPreferred"
                value={formData.disabilityPreferred}
                onChange={handleChange}
                placeholder="Optional"
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.location}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
              />
              <FormErrorMessage>{errors.location}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired isInvalid={!!errors.rolesAndResponsibilities}>
            <FormLabel>Roles and Responsibilities</FormLabel>
            <Textarea
              name="rolesAndResponsibilities"
              value={formData.rolesAndResponsibilities}
              onChange={handleChange}
              placeholder="Describe the responsibilities..."
            />
            <FormErrorMessage>{errors.rolesAndResponsibilities}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job profile..."
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>

          <Button type="submit" size="lg" colorScheme="teal" alignSelf="center">
            Submit Job
          </Button>
        </VStack>
      </form>
      <Footer />
    </Box>
  );
};

export default JobsRegistrationForm;
