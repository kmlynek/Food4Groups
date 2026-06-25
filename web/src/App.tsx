import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

// Tymczasowy ekran startowy pozwala sprawdzić, czy Material UI i motyw aplikacji działają poprawnie.
export default function App() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'grid',
        placeItems: 'center',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">Food4Groups</Typography>
            <Typography color="text.secondary">
              Portal web został połączony z Material UI.
            </Typography>
            <Button variant="contained">Działa</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}