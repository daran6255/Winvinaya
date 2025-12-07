import React from 'react';
import { Box } from '@mui/material';
import CandidateVerificationSummary from '../components/dashboard/CandidateVerificationSummary';

// import CandidateAnalysisChart from '../components/dashboard/CandidateAnalysisChart';

const CandidateVerificationSection: React.FC = () => {
  return (
    <>
      <Box>
        <CandidateVerificationSummary />
      </Box>
    </>

  );
};

export default CandidateVerificationSection;
