import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { getGroupPackageAssignmentsByGroup } from '../api/groupPackageAssignmentsApi';
import { getGroups } from '../api/groupsApi';
import { getMenuDaysByPeriod } from '../api/menuDaysApi';
import { getMenuPeriods } from '../api/menuPeriodsApi';
import {
  getDailyOrdersReport,
  getGroupSettlementProformaReport,
  getMyGroupSettlementProformaReport,
} from '../api/reportsApi';
import { useAuth } from '../hooks/useAuth';
import { roles } from '../types/authTypes';
import type { GroupPackageAssignment } from '../types/groupPackageAssignmentTypes';
import type { Group } from '../types/groupTypes';
import type { MenuDay, MenuPeriod } from '../types/menuTypes';

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayInputValue() {
  return toDateInputValue(new Date());
}

function getMonthStartInputValue() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return toDateInputValue(monthStart);
}

function formatDate(value: string) {
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

function findCurrentPackageAssignment(assignments: GroupPackageAssignment[]) {
  const today = new Date(getTodayInputValue());

  return assignments.find((assignment) => {
    const activeFrom = new Date(assignment.activeFrom);
    const activeTo = assignment.activeTo ? new Date(assignment.activeTo) : null;

    return assignment.isActive && activeFrom <= today && (!activeTo || activeTo >= today);
  });
}

function downloadReport(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { auth } = useAuth();
  const userRoles = auth?.user.roles ?? [];

  const canGenerateOperationalReports =
    userRoles.includes(roles.admin) || userRoles.includes(roles.cateringEmployee);
  const isGroupCoordinator = userRoles.includes(roles.groupCoordinator);

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupPackageAssignments, setGroupPackageAssignments] = useState<GroupPackageAssignment[]>([]);
  const [menuPeriods, setMenuPeriods] = useState<MenuPeriod[]>([]);
  const [menuDays, setMenuDays] = useState<MenuDay[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMenuPeriodId, setSelectedMenuPeriodId] = useState('');
  const [selectedMenuDayId, setSelectedMenuDayId] = useState('');
  const [dateFrom, setDateFrom] = useState(getMonthStartInputValue());
  const [dateTo, setDateTo] = useState(getTodayInputValue());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadReportFilters() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (!canGenerateOperationalReports) {
        setGroups([]);
        setMenuPeriods([]);
        setMenuDays([]);
        return;
      }

      const [groupsData, menuPeriodsData] = await Promise.all([
        getGroups(),
        getMenuPeriods(),
      ]);

      setGroups(groupsData);
      setMenuPeriods(menuPeriodsData);
      setSelectedGroupId((currentValue) => currentValue || groupsData[0]?.id || '');
      setSelectedMenuPeriodId((currentValue) => currentValue || menuPeriodsData[0]?.id || '');
    } catch (error) {
      // Komunikat błędu pobierania filtrów raportów pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać danych do raportów'));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMenuDays(menuPeriodId: string) {
    setSelectedMenuDayId('');
    setMenuDays([]);

    if (!menuPeriodId || !canGenerateOperationalReports) {
      return;
    }

    try {
      const daysData = await getMenuDaysByPeriod(menuPeriodId);

      setMenuDays(daysData);
      setSelectedMenuDayId(daysData[0]?.id || '');
    } catch (error) {
      // Komunikat błędu pobierania dni menu pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać dni menu'));
    }
  }

  async function loadGroupPackageAssignments(groupId: string) {
    setGroupPackageAssignments([]);

    if (!groupId || !canGenerateOperationalReports) {
      return;
    }

    try {
      const assignmentsData = await getGroupPackageAssignmentsByGroup(groupId);
      const currentPackageAssignment = findCurrentPackageAssignment(assignmentsData);

      setGroupPackageAssignments(assignmentsData);

      if (currentPackageAssignment) {
        // Data początkowa raportu podpowiada początek aktualnego pakietu wybranej grupy
        setDateFrom(toDateInputValue(new Date(currentPackageAssignment.activeFrom)));
      }
    } catch (error) {
      // Komunikat błędu pobierania pakietów grupy pochodzi z odpowiedzi backendu
      setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać pakietów grupy'));
    }}

    async function handleDownloadGroupSettlementProforma() {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const report = canGenerateOperationalReports
          ? await getGroupSettlementProformaReport(selectedGroupId, dateFrom, dateTo)
          : await getMyGroupSettlementProformaReport();

        downloadReport(report.blob, report.fileName);
      } catch (error) {
        // Komunikat błędu generowania proformy pochodzi z odpowiedzi backendu
        setErrorMessage(getApiErrorMessage(error, 'Nie udało się wygenerować proformy'));
      } finally {
        setIsSubmitting(false);
      }
    }

    async function handleDownloadDailyOrdersReport() {
      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const report = await getDailyOrdersReport(selectedMenuDayId);

        downloadReport(report.blob, report.fileName);
      } catch (error) {
        // Komunikat błędu generowania raportu dziennego pochodzi z odpowiedzi backendu
        setErrorMessage(getApiErrorMessage(error, 'Nie udało się wygenerować raportu dziennego'));
      } finally {
        setIsSubmitting(false);
      }
    }

    useEffect(() => {
      void loadReportFilters();
    }, []);

    useEffect(() => {
      void loadMenuDays(selectedMenuPeriodId);
    }, [selectedMenuPeriodId]);

    useEffect(() => {
      void loadGroupPackageAssignments(selectedGroupId);
    }, [selectedGroupId]);

    return (
      <Stack spacing={3}>
        {/* Nagłówek strony opisuje zakres raportów dostępnych dla aktualnej roli */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Raporty
          </Typography>
          <Typography color="text.secondary">
            Generowanie dokumentów rozliczeniowych i operacyjnych na podstawie danych z systemu
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadReportFilters}
            disabled={isLoading || isSubmitting}
          >
            Odśwież
          </Button>
        </Stack>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {isLoading && canGenerateOperationalReports && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography color="text.secondary">Pobieranie danych raportów...</Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Proforma PDF jest dostępna dla obsługi oraz koordynatora przypisanego do grupy */}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <PictureAsPdfOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6">Proforma rozliczenia grupy</Typography>
                  <Typography color="text.secondary">
                    Dokument PDF z abonamentowym podsumowaniem kosztów usługi
                  </Typography>
                </Box>
              </Stack>

              {isGroupCoordinator && !canGenerateOperationalReports && (
                <Alert severity="info" variant="outlined">
                  Proforma obejmuje aktualny okres pakietu przypisanego do Twojej grupy
                </Alert>
              )}

              {canGenerateOperationalReports && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Grupa"
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                    select
                    fullWidth
                    disabled={isLoading || isSubmitting || groups.length === 0}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Data od"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    type="date"
                    fullWidth
                    disabled={isSubmitting}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />

                  <TextField
                    label="Data do"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    type="date"
                    fullWidth
                    disabled={isSubmitting}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Box>
              )}

              {canGenerateOperationalReports && (
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Pakiety przypisane do grupy</Typography>

                  {groupPackageAssignments.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      Brak przypisanych pakietów dla wybranej grupy
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      {groupPackageAssignments.map((assignment) => (
                        <Card key={assignment.id} variant="outlined">
                          <CardContent sx={{ py: 1.5 }}>
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={1.5}
                              sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
                            >
                              <Box>
                                <Typography fontWeight={700}>
                                  {assignment.packageName ?? 'Pakiet'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatPrice(assignment.packagePricePerPerson)} / osoba / dzień
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Obowiązuje od {formatDate(assignment.activeFrom)}
                                  {assignment.activeTo ? ` do ${formatDate(assignment.activeTo)}` : ' bez daty końcowej'}
                                </Typography>
                              </Box>

                              <Chip
                                color={assignment.isActive ? 'success' : 'default'}
                                variant="outlined"
                                label={assignment.isActive ? 'Aktywny' : 'Nieaktywny'}
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<FileDownloadOutlinedIcon />}
                  onClick={handleDownloadGroupSettlementProforma}
                  disabled={
                    isSubmitting ||
                    (canGenerateOperationalReports && (!dateFrom || !dateTo)) ||
                    (canGenerateOperationalReports && !selectedGroupId)
                  }
                >
                  {isSubmitting ? 'Generowanie...' : 'Pobierz PDF'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Raport Excel jest raportem operacyjnym dla administratora i pracownika cateringu */}
        {canGenerateOperationalReports && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <TableChartOutlinedIcon color="primary" />
                  <Box>
                    <Typography variant="h6">Dzienny raport zamówień</Typography>
                    <Typography color="text.secondary">
                      Plik Excel z listą zamówień dla wybranego dnia menu
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Okres menu"
                    value={selectedMenuPeriodId}
                    onChange={(event) => setSelectedMenuPeriodId(event.target.value)}
                    select
                    fullWidth
                    disabled={isLoading || isSubmitting || menuPeriods.length === 0}
                  >
                    {menuPeriods.map((period) => (
                      <MenuItem key={period.id} value={period.id}>
                        {period.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Dzień menu"
                    value={selectedMenuDayId}
                    onChange={(event) => setSelectedMenuDayId(event.target.value)}
                    select
                    fullWidth
                    disabled={isLoading || isSubmitting || menuDays.length === 0}
                  >
                    {menuDays.map((day) => (
                      <MenuItem key={day.id} value={day.id}>
                        {formatDate(day.menuDate)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={handleDownloadDailyOrdersReport}
                    disabled={isSubmitting || !selectedMenuDayId}
                  >
                    {isSubmitting ? 'Generowanie...' : 'Pobierz Excel'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    );
  }
