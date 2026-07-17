import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Stack,
    Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Karta funkcjonalności wyświetlana na pulpicie
export type DashboardActionItem = {
    title: string;
    description: string;
    path: string;
    icon: ReactNode;
};

type DashboardActionsGridProps = {
    actions: DashboardActionItem[];
};

export function DashboardActionsGrid({
    actions,
}: DashboardActionsGridProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
            }}
        >
            {actions.map((action) => (
                <Card key={action.path} variant="outlined">
                    <CardActionArea
                        component={Link}
                        to={action.path}
                        sx={{ height: '100%' }}
                    >
                        <CardContent>
                            <Stack spacing={2}>
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(46, 125, 50, 0.10)',
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {action.icon}
                                </Box>

                                <Stack spacing={0.5}>
                                    <Typography variant="h6">
                                        {action.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {action.description}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ))}
        </Box>
    );
}
