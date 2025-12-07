import React from 'react';
import { Box, Divider } from '@mui/material';
import CandidateSummaryCards from '../components/dashboard/CandidateSummaryCards';
import CandidateTable from '../components/dashboard/CandidateTable';

const CandidateSection: React.FC = () => {
  return (
    <>
      <Box>
        <CandidateSummaryCards />
      </Box>
       <Divider sx={{ my: 2 }} />
       <CandidateTable />
    </>

  );
};

export default CandidateSection;
