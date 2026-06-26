import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { navigationItems } from '../navigation';
import { roleLabels } from '../types/authTypes';

const drawerWidth = 280;

export function AppLayout() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { auth, logout } = useAuth();

    const userRoles = auth?.user.roles ?? [];

    const availableNavigationItems = navigationItems.filter((item) =>
        item.allowedRoles.some((role) => userRoles.includes(role)),
    );

    const closeMobileDrawer = () => {
        setIsDrawerOpen(false);
    };

    const drawerContent = (
        <Stack sx={{ height: '100%' }}>
            {/* Logo i nazwa aplikacji w menu bocznym */}
            <Box component={Link}
                to="/dashboard"
                onClick={closeMobileDrawer}
                sx={{
                    display: 'block',
                    px: 3,
                    py: 2.5,
                    textDecoration: 'none',
                }}
            >
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                    Food4Groups
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    System zarządzania cateringiem
                </Typography>
            </Box>

            <Divider />

            {/* Nawigacja dopasowana do ról aktualnego użytkownika */}
            <List sx={{ px: 1.5, py: 2 }}>
                {availableNavigationItems.map((item) => (
                    <ListItemButton
                        key={item.path}
                        component={NavLink}
                        to={item.path}
                        onClick={closeMobileDrawer}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            color: 'text.secondary',
                            '&.active': {
                                bgcolor: 'rgba(46, 125, 50, 0.10)',
                                color: 'primary.main',
                                '& .MuiListItemIcon-root': {
                                    color: 'primary.main',
                                },
                                '& .MuiListItemText-primary': {
                                    fontWeight: 700,
                                },
                            },
                            '&:hover': {
                                bgcolor: 'rgba(46, 125, 50, 0.06)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider />

            {/* Dane zalogowanego użytkownika i akcja wylogowania */}
            <Stack spacing={1.5} sx={{ p: 2 }}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {auth?.user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {userRoles.map((role) => roleLabels[role]).join(', ')}
                    </Typography>
                </Box>

                <Button
                    color="inherit"
                    startIcon={<LogoutOutlinedIcon />}
                    onClick={logout}
                    sx={{ justifyContent: 'flex-start' }}
                >
                    Wyloguj
                </Button>
            </Stack>
        </Stack>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* Górny pasek widoczny szczególnie na mniejszych ekranach */}
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    {!isDesktop && (
                        <IconButton edge="start" onClick={() => setIsDrawerOpen(true)} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Food4Groups
                    </Typography>

                    <Button color="primary" startIcon={<LogoutOutlinedIcon />} onClick={logout}>
                        Wyloguj
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Menu boczne stałe na desktopie i wysuwane na urządzeniach mobilnych */}
            <Box component="nav">
                <Drawer
                    variant={isDesktop ? 'permanent' : 'temporary'}
                    open={isDesktop || isDrawerOpen}
                    onClose={closeMobileDrawer}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Główna część aplikacji z aktualnie wybraną stroną */}
            <Box
                component="main"
                sx={{
                    ml: { md: `${drawerWidth}px` },
                    px: { xs: 2, md: 4 },
                    py: 4,
                    pt: 12,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}