import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { Card, CardContent, Stack, Typography } from '@mui/material';

type PlaceholderPageProps = {
    title: string;
    description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    {/* Informacja o module przygotowanym do dalszej rozbudowy */}
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <ConstructionOutlinedIcon color="primary" />
                        <Typography variant="h5">{title}</Typography>
                    </Stack>

                    <Typography color="text.secondary">{description}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}