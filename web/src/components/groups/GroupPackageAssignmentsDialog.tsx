import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import {
  createGroupPackageAssignment,
  deleteGroupPackageAssignment,
  getGroupPackageAssignmentsByGroup,
  updateGroupPackageAssignment,
} from '../../api/groupPackageAssignmentsApi';
import { getPackages } from '../../api/packagesApi';
import type { GroupPackageAssignment } from '../../types/groupPackageAssignmentTypes';
import type { Group } from '../../types/groupTypes';
import type { Package as CateringPackage } from '../../types/packageTypes';
import { GroupPackageAssignmentForm } from './GroupPackageAssignmentForm';

type GroupPackageAssignmentsDialogProps = {
  open: boolean;
  group: Group | null;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) {
    return 'Bez daty';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

export function GroupPackageAssignmentsDialog({ open, group, onClose }: GroupPackageAssignmentsDialogProps) {
  const [assignments, setAssignments] = useState<GroupPackageAssignment[]>([]);
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<GroupPackageAssignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<GroupPackageAssignment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const availablePackages = useMemo(() => {
    if (!group) {
      return [];
    }

    return packages.filter(
      (item) =>
        item.cateringCompanyId === group.cateringCompanyId &&
        (item.isActive || item.id === selectedAssignment?.packageId),
    );
  }, [group, packages, selectedAssignment]);

  async function loadData() {
    if (!group) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const [assignmentsData, packagesData] = await Promise.all([
        getGroupPackageAssignmentsByGroup(group.id),
        getPackages(),
      ]);

      setAssignments(assignmentsData);
      setPackages(packagesData);
    } catch (error) {
      // Komunikat błędu pobierania przypisań pakietów pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać pakietów grupy'));
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateForm() {
    setSelectedAssignment(null);
    setIsFormOpen(true);
  }

  function openEditForm(assignment: GroupPackageAssignment) {
    setSelectedAssignment(assignment);
    setIsFormOpen(true);
  }

  function closeForm() {
    setSelectedAssignment(null);
    setIsFormOpen(false);
  }

  async function handleSaveAssignment(values: {
    packageId: string;
    activeFrom: string;
    activeTo?: string | null;
    isActive: boolean;
  }) {
    if (!group) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (selectedAssignment) {
        await updateGroupPackageAssignment(selectedAssignment.id, {
          groupId: group.id,
          packageId: values.packageId,
          activeFrom: values.activeFrom,
          activeTo: values.activeTo,
          isActive: values.isActive,
        });
      } else {
        await createGroupPackageAssignment({
          groupId: group.id,
          packageId: values.packageId,
          activeFrom: values.activeFrom,
          activeTo: values.activeTo,
        });
      }

      closeForm();
      await loadData();
    } catch (error) {
      // Komunikat błędu zapisu pakietu grupy pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się zapisać pakietu grupy'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAssignment() {
    if (!assignmentToDelete) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteGroupPackageAssignment(assignmentToDelete.id);
      setAssignmentToDelete(null);
      await loadData();
    } catch (error) {
      // Komunikat błędu usuwania pakietu grupy pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się usunąć pakietu grupy'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setAssignments([]);
    setPackages([]);
    setSelectedAssignment(null);
    setAssignmentToDelete(null);
    setErrorMessage('');
    onClose();
  }

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open, group]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Pakiet grupy</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="h6">{group?.name}</Typography>
            <Typography color="text.secondary">
              Pakiet przypisany do grupy decyduje, które dania i dodatki klient może zamówić
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadData}
              disabled={isLoading}
            >
              Odśwież
            </Button>

            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={openCreateForm}
              disabled={availablePackages.length === 0}
            >
              Dodaj pakiet
            </Button>
          </Stack>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {availablePackages.length === 0 && !isLoading && (
            <Alert severity="info" variant="outlined">
              Brak aktywnych pakietów dla firmy cateringowej przypisanej do tej grupy
            </Alert>
          )}

          {/* Stan ładowania widoczny podczas pobierania pakietów grupy */}
          {isLoading && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography color="text.secondary">Pobieranie pakietów grupy...</Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Pusty stan dla grupy bez przypisanego pakietu */}
          {!isLoading && assignments.length === 0 && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                  <Inventory2OutlinedIcon color="primary" fontSize="large" />
                  <Typography variant="h6">Brak przypisanych pakietów</Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Lista pakietów przypisanych do wybranej grupy */}
          {!isLoading && assignments.length > 0 && (
            <Stack spacing={2}>
              {assignments.map((assignment) => (
                <Card key={assignment.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography variant="h6">{assignment.packageName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatPrice(assignment.packagePricePerPerson)} za osobę
                          </Typography>
                        </Box>

                        <Chip
                          color={assignment.isActive ? 'success' : 'default'}
                          variant="outlined"
                          label={assignment.isActive ? 'Aktywny' : 'Nieaktywny'}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        Obowiązuje od {formatDate(assignment.activeFrom)}
                        {assignment.activeTo ? ` do ${formatDate(assignment.activeTo)}` : ' bez daty zakończenia'}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => openEditForm(assignment)}
                        >
                          Edytuj
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          onClick={() => setAssignmentToDelete(assignment)}
                        >
                          Usuń
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Zamknij
        </Button>
      </DialogActions>

      <GroupPackageAssignmentForm
        open={isFormOpen}
        title={selectedAssignment ? 'Edytuj pakiet grupy' : 'Dodaj pakiet grupy'}
        submitLabel={selectedAssignment ? 'Zapisz zmiany' : 'Dodaj pakiet'}
        isSubmitting={isSubmitting}
        group={group}
        packages={availablePackages}
        initialAssignment={selectedAssignment}
        onClose={closeForm}
        onSubmit={handleSaveAssignment}
      />

      <Dialog open={Boolean(assignmentToDelete)} onClose={() => setAssignmentToDelete(null)}>
        <DialogTitle>Usuń pakiet grupy</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz usunąć <strong>{assignmentToDelete?.packageName}</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAssignmentToDelete(null)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteAssignment} disabled={isSubmitting}>
            {isSubmitting ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
