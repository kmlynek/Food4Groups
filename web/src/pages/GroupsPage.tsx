import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/apiError';
import { getGroups } from '../api/groupsApi';
import type { Group } from '../types/groupTypes';

function formatDate(value: string) {
    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadGroups() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            // Komunikat błędu pobierania grup pochodzi z odpowiedzi backendu
            setErrorMessage(getApiErrorMessage(error, 'Nie udało się pobrać listy grup'));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadGroups();
    }, []);

    return (
        <Stack spacing={3}>
            {/* Nagłówek strony opisuje zakres modułu grup */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Grupy
                </Typography>
                <Typography color="text.secondary">
                    Lista grup obsługiwanych w systemie wraz z przypisaną firmą cateringową
                </Typography>
            </Box>

            {/* Pasek akcji dla odświeżenia danych z backendu */}
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={loadGroups}
                    disabled={isLoading}
                >
                    Odśwież
                </Button>
            </Stack>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {/* Stan ładowania widoczny podczas pobierania danych z API */}
            {isLoading && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
                            <CircularProgress />
                            <Typography color="text.secondary">Pobieranie grup...</Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Pusty stan dla sytuacji, w której system nie ma jeszcze żadnych grup */}
            {!isLoading && groups.length === 0 && (
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
                            <GroupsOutlinedIcon color="primary" fontSize="large" />
                            <Typography variant="h6">Brak grup</Typography>
                            <Typography color="text.secondary">
                                Po utworzeniu grup będą one widoczne w tym miejscu
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Lista grup pobrana z backendu */}
            {!isLoading && groups.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                    }}
                >
                    {groups.map((group) => (
                        <Card key={group.id} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6">{group.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {group.cateringCompanyName ?? 'Brak przypisanej firmy'}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            color="primary"
                                            variant="outlined"
                                            label={`${group.memberCount} członków`}
                                        />
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary">
                                        Utworzono: {formatDate(group.createdAt)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Stack>
    );
}