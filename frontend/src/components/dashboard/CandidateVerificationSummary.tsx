import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupIcon from '@mui/icons-material/Group';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import SchoolIcon from '@mui/icons-material/School';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../../store';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import { fetchCandidateProfiles } from '../../store/slices/candidateVerificationSlice';

interface SummaryItemProps {
  title: string;
  value: string | number;
  percent: number;
  icon: React.ReactElement;
  isPositive?: boolean;
  loading: boolean;
}

const SummaryItem = ({
  title,
  value,
  percent,
  icon,
  isPositive = true,
  loading,
}: SummaryItemProps) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4],
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          {icon}
          <Typography variant="subtitle1" ml={1}>
            {title}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={0.5} minHeight={32}>
          {loading ? (
            <CircularProgress size={20} color="success" />
          ) : (
            <>
              <Typography variant="h5" fontWeight="bold">
                {value}
              </Typography>
              <Box display="flex" alignItems="center" ml={1}>
                {isPositive ? (
                  <ArrowUpwardIcon color="success" fontSize="small" />
                ) : (
                  <ArrowDownwardIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={isPositive ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {percent}%
                </Typography>
              </Box>
            </>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Compared to last week
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function CandidateVerificationSummary() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    candidates,
    status: candidatesStatus,
  } = useSelector((state: RootState) => state.candidate);

  const {
    profiles,
    status: profilesStatus,
  } = useSelector((state: RootState) => state.candidateProfile);

  useEffect(() => {
    if (candidatesStatus === 'idle' && token) {
      dispatch(fetchCandidates(token));
    }
  }, [dispatch, token, candidatesStatus]);

  useEffect(() => {
    if (profilesStatus === 'idle' && token) {
      dispatch(fetchCandidateProfiles(token));
    }
  }, [dispatch, token, profilesStatus]);

  const loading =
    candidatesStatus === 'loading' || profilesStatus === 'loading';

  const total = candidates.length;

  const verified = profiles.length;

  const unverified = total - verified;

  const willingForTraining = profiles.filter(
    (p) => p.willing_for_training?.toLowerCase() === "yes"
  ).length;

  if (candidatesStatus === 'failed' || profilesStatus === 'failed') {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography color="error">Failed to load candidate data.</Typography>
      </Box>
    );
  }

  return (
    <Box py={0} px={0} width="100%">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        <SummaryItem
          title="Total Registered"
          value={total}
          percent={15.2}
          icon={<GroupIcon color="primary" />}
          loading={loading}
        />
        <SummaryItem
          title="Verified Candidates"
          value={verified}
          percent={10.4}
          icon={<VerifiedUserIcon color="success" />}
          loading={loading}
        />
        <SummaryItem
          title="Yet to Verify"
          value={unverified}
          percent={8.9}
          icon={<HourglassBottomIcon color="warning" />}
          isPositive={false}
          loading={loading}
        />
        <SummaryItem
          title="Willing for Training"
          value={willingForTraining}
          percent={6.7}
          icon={<SchoolIcon color="info" />}
          loading={loading}
        />
      </Box>
    </Box>
  );
}
