import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  useTheme,
  TextField,
  Chip,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCandidates } from '../../store/slices/candidateSlice';
import moment from 'moment';
import type { Candidate } from '../../models/candidate';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getCandidateById, updateCandidate } from '../../api/candidate';

const CandidateTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const candidateList = useSelector((state: RootState) => state.candidate.candidates);
  const token = useSelector((state: RootState) => state.auth.token);
  const theme = useTheme();

  const [page, setPage] = useState(0);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editData, setEditData] = useState<Partial<Candidate>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedCandidate) {
      setEditData(selectedCandidate);
    }
  }, [selectedCandidate]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCandidates(token));
    }
  }, [token, dispatch]);

  const handleManualRefresh = () => {
    if (token) {
      dispatch(fetchCandidates(token));
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isNewCandidate = (createdAt: string) => {
    return moment().diff(moment(createdAt), 'days') <= 5;
  };

  const filteredCandidates = [...candidateList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.candidate_id.toString().includes(q)
      );
    });

  const paginatedCandidates = filteredCandidates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowClick = async (id: string) => {
    if (!token) return;
    setLoadingDetails(true);
    try {
      const response = await getCandidateById(id, token);
      setSelectedCandidate(response.data);
      setModalOpen(true);
    } catch {
      setSnackbar({ message: 'Failed to fetch candidate details.', severity: 'error' });
    } finally {
      setLoadingDetails(false);
    }
  };


  const handleSave = async () => {
    if (!token || !selectedCandidate?.id || !editData) return;
    setIsSaving(true);
    try {
      await updateCandidate(selectedCandidate.id, editData, token);
      setSnackbar({ message: 'Candidate updated successfully.', severity: 'success' });
      setModalOpen(false);
      dispatch(fetchCandidates(token));
    } catch {
      setSnackbar({ message: 'Failed to update candidate.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
          Registered Candidates
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
          />
          <Button
            onClick={handleManualRefresh}
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableRow>
                {['Candidate ID', 'Name', 'Email', 'Phone', 'Created At', 'Updated At', 'Updated By'].map((head, idx) => (
                  <TableCell key={idx}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
                    >
                      {head}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCandidates.map((candidate: Candidate) => (
                <TableRow
                  key={candidate.candidate_id}
                  hover
                  sx={{ height: 48, cursor: 'pointer' }}
                  onClick={() => handleRowClick(candidate.id)}
                >
                  <TableCell>{candidate.candidate_id}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {candidate.name}
                      {isNewCandidate(candidate.created_at) && (
                        <Chip
                          label="New"
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone}</TableCell>
                  <TableCell>{moment(candidate.created_at).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>{moment(candidate.updated_at).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>
                    {candidate.updated_by?.username ? (
                      <Chip
                        label={candidate.updated_by.username}
                        variant="outlined"
                        size="small"
                        color="primary"
                        sx={{ fontSize: 11, height: 24 }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box mt={2}>
        <TablePagination
          component="div"
          count={filteredCandidates.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Rows per page:"
        />
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>

      <CandidateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        candidate={editData}
        onChange={(field, value) => setEditData((prev) => ({ ...prev, [field]: value }))}
        onSave={handleSave}
      />
    </>
  );
};

export default CandidateTable;
