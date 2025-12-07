import { Box, Typography } from '@mui/material';
import DashboardLayout from '../layout/DashboardLayout';
import AppBreadcrumbs from '../components/common/AppBreadcrumbs';
import { useBreadcrumbs } from '../context/BreadcrumbContext';
import { useSidebar } from '../context/SidebarContext';

import UserSection from '../sections/UserSection';
import CandidateSection from '../sections/CandidateSection';
import CandidateVerificationSection from '../sections/CandidateVerificationSection';
import DashboardOverview from '../sections/DashboardOverview';

export default function Dashboard() {
  const { breadcrumbs } = useBreadcrumbs();
  const { activeSection } = useSidebar();

  const renderContent = () => {
    switch (activeSection) {
      case 'Dashboard':
        return <DashboardOverview />;
      case 'Users':
        return <UserSection />;
      case 'Candidates':
        return <CandidateSection />;
      case 'Candidate Verification':
        return <CandidateVerificationSection />;
      case 'Career Counseling':
        return <Typography variant="h5">Career Counseling Info</Typography>;
      case 'Training Batches':
        return <Typography variant="h5">Training Batches Details</Typography>;
      case 'Skill Evaluation':
        return <Typography variant="h5">Skills Evaluation Panel</Typography>;
      case 'Company':
        return <Typography variant="h5">Company List</Typography>;
      case 'Jobs':
        return <Typography variant="h5">Job Posts</Typography>;
      case 'Job Mapping':
        return <Typography variant="h5">Candidate to Job Mapping</Typography>;
      case 'Interview Status':
        return <Typography variant="h5">Interview Status Summary</Typography>;
      case 'Job Melas':
        return <Typography variant="h5">Upcoming Job Melas</Typography>;
      default:
        return <Typography variant="body1">Select a menu item to continue.</Typography>;
    }
  };

  return (
    <DashboardLayout>
      <Box p={2}>
        <AppBreadcrumbs items={breadcrumbs} />
        <Box mt={3}>{renderContent()}</Box>
      </Box>
    </DashboardLayout>
  );
}
