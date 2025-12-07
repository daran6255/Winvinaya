import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import GroupIcon from '@mui/icons-material/Group';
import WcIcon from '@mui/icons-material/Wc';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../../store';
import { fetchCandidates } from '../../store/slices/candidateSlice';

interface SummaryItemProps {
  title: string;
  value: string | number;
  percent: number;
  icon: React.ReactElement;
  isPositive?: boolean;
}

const SummaryItem = ({
  title,
  value,
  percent,
  icon,
  isPositive = true,
  loading,
}: SummaryItemProps & { loading: boolean }) => {
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
            <CircularProgress size={20} color="success"/>
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

export default function CandidateSummaryCards() {
  const dispatch = useDispatch<AppDispatch>();
  const { candidates, status } = useSelector(
    (state: RootState) => state.candidate
  );
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (status === 'idle' && token) {
      dispatch(fetchCandidates(token));
    }
  }, [dispatch, token, status]);

  if (status === 'failed') {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography color="error">Failed to load candidate data.</Typography>
      </Box>
    );
  }

  // Default values while loading
  const total = candidates.length;
  const maleCount = candidates.filter((c) => c.gender === 'Male').length;
  const femaleCount = candidates.filter((c) => c.gender === 'Female').length;
  const states = new Set(candidates.map((c) => c.state)).size;
  const experienced = candidates.filter(
    (c) => c.experience_type === 'Experienced'
  ).length;
  const fresher = candidates.filter(
    (c) => c.experience_type === 'Fresher'
  ).length;

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
        {[
          {
            title: 'Total Registered',
            value: total,
            percent: 24.5,
            icon: <GroupIcon color="primary" />,
          },
          {
            title: 'Male / Female',
            value: `${maleCount} / ${femaleCount}`,
            percent: 12.3,
            icon: <WcIcon color="info" />,
          },
          {
            title: 'Unique States',
            value: states,
            percent: 10.1,
            icon: <PublicIcon color="success" />,
          },
          {
            title: 'Experienced / Fresher',
            value: `${experienced} / ${fresher}`,
            percent: 17.6,
            icon: <WorkIcon color="warning" />,
          },
        ].map((item, index) => (
          <SummaryItem key={index} {...item} loading={status === 'loading'} />
        ))}
      </Box>
    </Box>
  );
}

