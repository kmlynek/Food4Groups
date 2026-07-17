import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

// Liczba aktywnych i wszystkich elementów danej części oferty
export type OfferSummaryItem = {
    label: string;
    total: number;
    active: number;
};

// Ostatnio dodany element prezentowany na pulpicie
export type RecentOfferItem = {
    id: string;
    title: string;
    type: string;
    createdAt?: string;
    path: string;
};

type OfferDashboardSectionProps = {
    summary: OfferSummaryItem[];
    recentItems: RecentOfferItem[];
    isLoading: boolean;
    errorMessage: string;
};

// Formatuje datę zgodnie z polskimi ustawieniami regionalnymi
function formatDate(value?: string) {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
    }).format(new Date(value));
}

// Oblicza procent aktywnych elementów oferty
function getActivePercent(item: OfferSummaryItem) {
    if (item.total === 0) {
        return 0;
    }

    return Math.round((item.active / item.total) * 100);
}

export function OfferDashboardSection({
    summary,
    recentItems,
    isLoading,
    errorMessage,
}: OfferDashboardSectionProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    lg: '1.2fr 1fr',
                },
                gap: 2,
            }}
        >
            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h6">
                                Podsumowanie oferty
                            </Typography>
                            <Typography color="text.secondary">
                                Aktywne elementy katalogu i menu
                            </Typography>
                        </Box>

                        {errorMessage && (
                            <Alert severity="error">{errorMessage}</Alert>
                        )}

                        {isLoading && (
                            <Stack
                                spacing={2}
                                sx={{ alignItems: 'center', py: 3 }}
                            >
                                <CircularProgress size={28} />
                                <Typography color="text.secondary">
                                    Pobieranie podsumowania…
                                </Typography>
                            </Stack>
                        )}

                        {!isLoading && !errorMessage && (
                            <Stack spacing={2}>
                                {summary.map((item) => (
                                    <Box key={item.label}>
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            sx={{
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 0.75,
                                            }}
                                        >
                                            <Typography sx={{ fontWeight: 600 }}>
                                                {item.label}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Aktywne: {item.active} z {item.total}
                                            </Typography>
                                        </Stack>

                                        <LinearProgress
                                            variant="determinate"
                                            value={getActivePercent(item)}
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Ostatnio dodane</Typography>

                        {errorMessage && (
                            <Typography color="text.secondary">
                                Lista ostatnich pozycji jest chwilowo niedostępna
                            </Typography>
                        )}

                        {isLoading && (
                            <Stack
                                spacing={2}
                                sx={{ alignItems: 'center', py: 3 }}
                            >
                                <CircularProgress size={28} />
                                <Typography color="text.secondary">
                                    Pobieranie pozycji…
                                </Typography>
                            </Stack>
                        )}

                        {!isLoading &&
                            !errorMessage &&
                            recentItems.length === 0 && (
                                <Typography color="text.secondary">
                                    Brak pozycji do pokazania
                                </Typography>
                            )}

                        {!isLoading &&
                            !errorMessage &&
                            recentItems.length > 0 && (
                                <Stack spacing={1.5}>
                                    {recentItems.map((item) => (
                                        <Stack
                                            key={`${item.type}-${item.id}`}
                                            component={Link}
                                            to={item.path}
                                            direction="row"
                                            spacing={1.5}
                                            sx={{
                                                justifyContent: 'space-between',
                                                gap: 2,
                                                color: 'inherit',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 600 }} noWrap>
                                                    {item.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                >
                                                    {item.createdAt
                                                        ? `Dodano: ${formatDate(item.createdAt)}`
                                                        : 'Brak daty dodania'}
                                                </Typography>
                                            </Box>

                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={item.type}
                                                sx={{ flexShrink: 0 }}
                                            />
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
