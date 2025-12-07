import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchCandidates } from "../../store/slices/candidateSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";

type ChartData = { date: string; count: number };

const CandidateAnalysisChart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const candidates = useSelector(
    (state: RootState) => state.candidate.candidates
  );
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "yearly">(
    "daily"
  );

  useEffect(() => {
    dispatch(fetchCandidates("all"));
  }, [dispatch]);

  const groupData = (view: "daily" | "monthly" | "yearly") => {
    const result: Record<string, number> = {};

    candidates?.forEach((candidate) => {
      const createdAt = new Date(candidate.created_at);
      let key = "";

      if (view === "daily") {
        key = createdAt.toISOString().split("T")[0];
      } else if (view === "monthly") {
        key = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
      } else if (view === "yearly") {
        key = `${createdAt.getFullYear()}`;
      }

      result[key] = (result[key] || 0) + 1;
    });

    return Object.entries(result)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const data = groupData(viewMode);

  return (
    <Card
      sx={{
        gridColumn: "span 3", // Use this inside a grid container with 3fr structure
        p: 2,
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Candidate Analysis
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            color="primary"
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke={theme.palette.primary.main}
              fillOpacity={1}
              fill="url(#colorCount)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>

        <Box mt={2} textAlign="right">
          <Typography variant="subtitle2" color="text.secondary">
            Total Candidates: {candidates?.length || 0}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CandidateAnalysisChart;
