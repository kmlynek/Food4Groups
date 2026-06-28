import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import type { CateringCompany } from '../../types/cateringCompanyTypes';
import type { Group } from '../../types/groupTypes';

type GroupFormValues = {
    name: string;
    cateringCompanyId: string;
};

type GroupFormProps = {
    open: boolean;
    title: string;
    submitLabel: string;
    isSubmitting: boolean;
    companies: CateringCompany[];
    initialGroup?: Group | null;
    onClose: () => void;
    onSubmit: (values: GroupFormValues) => Promise<void>;
};

export function GroupForm({
    open,
    title,
    submitLabel,
    isSubmitting,
    companies,
    initialGroup,
    onClose,
    onSubmit,
}: GroupFormProps) {
    const [name, setName] = useState('');
    const [cateringCompanyId, setCateringCompanyId] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        // Formularz uzupełnia pola podczas edycji albo czyści je przy tworzeniu nowej grupy
        setName(initialGroup?.name ?? '');
        setCateringCompanyId(initialGroup?.cateringCompanyId ?? companies[0]?.id ?? '');
    }, [companies, initialGroup, open]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await onSubmit({
            name,
            cateringCompanyId,
        });
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <Box component="form" onSubmit={handleSubmit}>
                <DialogTitle>{title}</DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        {/* Podstawowe dane grupy widoczne w systemie */}
                        <TextField
                            label="Nazwa grupy"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            fullWidth
                            autoFocus
                        />

                        {/* Firma cateringowa określa właściciela oferty i menu dla grupy */}
                        <TextField
                            label="Firma cateringowa"
                            value={cateringCompanyId}
                            onChange={(event) => setCateringCompanyId(event.target.value)}
                            required
                            fullWidth
                            select
                            disabled={companies.length === 0}
                        >
                            {companies.map((company) => (
                                <MenuItem key={company.id} value={company.id}>
                                    {company.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting || companies.length === 0}>
                        {isSubmitting ? 'Zapisywanie...' : submitLabel}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}