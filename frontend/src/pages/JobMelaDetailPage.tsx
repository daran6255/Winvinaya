import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Icon,
  Flex,
  Button,
  Grid,
  Divider,
  Circle,
} from "@chakra-ui/react";
import {
  getJobMelaMetrics,
  getCompaniesByJobMela,
} from "../helpers/job_mapped_services";
import { getAllJobMelas } from "../helpers/jobmela_service";
import { JobMela } from "../helpers/model";
import { Users, Building, Briefcase, UserPlus } from "lucide-react";
import CompanyTable from "../components/dashboard/Company_Table";
import MappingTable from "../components/dashboard/Mapping_Table";
import SourcingPage from "../components/dashboard/Sourcing";

const JobMelaDetailPage: React.FC = () => {
  const { jobmela_id } = useParams<{ jobmela_id: string }>();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const heroBg = useColorModeValue("linear(to-r, teal.400, blue.500)", "linear(to-r, teal.600, blue.700)");
  const headingColor = useColorModeValue("white", "gray.100");
  const descriptionColor = useColorModeValue("gray.100", "gray.300");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const evenRowBg = useColorModeValue("gray.50", "gray.700");
  const oddRowBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  const [jobmela, setJobmela] = useState<JobMela | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    students: 0,
    companies: 0,
    jobs: 0,
    vacancies: 0,
  });

  interface CompanyWithJobs {
    id: string;
    name: string;
    type: string;
    jobs: { id: string; role: string }[];
  }
  const [companyData, setCompanyData] = useState<CompanyWithJobs[]>([]);

  useEffect(() => {
    const fetchJobMela = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAllJobMelas();
        if (res.status === "success" && Array.isArray(res.result)) {
          const jm = res.result.find(
            (j: JobMela) => String(j.id) === String(jobmela_id)
          );

          if (!jm) {
            setError(`Job Mela with ID ${jobmela_id} not found`);
            return;
          }

          setJobmela(jm);

          const metricsRes = await getJobMelaMetrics(jm.id);
          if (metricsRes.status === "success") {
            setMetrics(metricsRes.result || {
              students: 0,
              companies: 0,
              jobs: 0,
              vacancies: 0,
            });
          }

          const companiesRes = await getCompaniesByJobMela(jm.id);
          if (companiesRes.status === "success") {
            setCompanyData(companiesRes.result || []);
          }

        } else {
          setError("Unexpected response format from server");
        }
      } catch (err) {
        console.error("Failed to fetch job mela data:", err);
        setError("Failed to fetch job mela data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobMela();
  }, [jobmela_id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.500">{error}</Text>
        <Button mt={4} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!jobmela) {
    return (
      <Box p={6}>
        <Text>Job Mela not found.</Text>
        <Button mt={4} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box m={5}>
      {/* Hero Header */}
      <Box
        bgGradient={heroBg}
        p={{ base: 6, md: 10 }}
        rounded="xl"
        shadow="lg"
        mb={10}
        textAlign="center"
      >
        <Heading size="lg" color={headingColor} mb={3}>
          {jobmela.jobmela_name}
        </Heading>
        <Text fontSize="md" color={descriptionColor}>
          Explore insights and details about this Job Mela event.
        </Text>
      </Box>

      {/* Metrics */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={10}>
        <StatCard
          label="Registered Students"
          value={metrics.students}
          icon={Users}
          color="teal.400"
        />
        <StatCard
          label="Registered Companies"
          value={metrics.companies}
          icon={Building}
          color="purple.400"
        />
        <StatCard
          label="Total Jobs"
          value={metrics.jobs}
          icon={Briefcase}
          color="orange.400"
        />
        <StatCard
          label="Total Vacancies"
          value={metrics.vacancies}
          icon={UserPlus}
          color="pink.400"
        />
      </SimpleGrid>

      {/* Main Content Grid */}
      <Box
        bg={cardBg}
        maxH="600px"
        overflow="auto"
        mb={5}
        p={5}
        rounded="lg"
        shadow="lg"
        border={`1px solid black`}
      >
      <Heading size="md" mb={4}>
        Sourcing Details
      </Heading>
      <Divider mb={4} />
        <SourcingPage />
      </Box>
      <Grid
        templateColumns={{ base: "1fr", xl: "1fr 1fr" }}
        gap={8}
        alignItems="start"
      >
        {/* LEFT PANEL: Mappings */}
        <Box
          bg={cardBg}
          maxH="600px"
          overflow="auto"
          p={5}
          rounded="lg"
          shadow="lg"
          border={`1px solid black`}
        >
          <Heading size="md" mb={4}>
            Mapped Jobs & Top Candidates
          </Heading>
          <Divider mb={4} />
          {jobmela_id && <MappingTable jobmela_id={jobmela_id} />}
        </Box>

        {/* RIGHT PANEL: 3 stacked boxes */}
        <Grid templateRows="1fr" gap={8}>
          <Box
            bg={cardBg}
            maxH="600px"
            p={5}
            overflow="auto"
            rounded="lg"
            shadow="lg"
            border={`1px solid black`}
          >
          <Heading size="md" mb={4}>
            Participating Companies
          </Heading>
          <Divider mb={4} />
          <CompanyTable
              companyData={companyData}
              headerBg={headerBg}
              textColor={textColor}
              evenRowBg={evenRowBg}
              oddRowBg={oddRowBg}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box
      p={5}
      bg={cardBg}
      rounded="xl"
      shadow="md"
      borderLeft="6px solid"
      borderColor={color}
    >
      <Flex justify="space-between" align="center">
        <Stat>
          <StatLabel fontWeight="bold" fontSize="sm" color="gray.500">
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="extrabold" color={textColor}>
            {value}
          </StatNumber>
        </Stat>
        <Circle size="12" bg={color} color="white">
          <Icon as={icon} boxSize={6} />
        </Circle>
      </Flex>
    </Box>
  );
};

// const DashboardCard = ({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) => {
//   const cardBg = useColorModeValue("white", "gray.800");
//   const borderColor = useColorModeValue("gray.200", "gray.700");

//   return (
//     <Box
//       bg={cardBg}
//       p={6}
//       rounded="lg"
//       shadow="lg"
//       border={`1px solid ${borderColor}`}
//       maxH="400px"
//       overflow="auto"
//     >
//       <Heading size="md" mb={4}>
//         {title}
//       </Heading>
//       <Divider mb={4} />
//       {children}
//     </Box>
//   );
// };

export default JobMelaDetailPage;
