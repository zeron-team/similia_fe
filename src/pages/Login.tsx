import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { Button, TextField, Paper, Typography, Box, Link } from '@mui/material';
import logo from "../assets/img/Z_logo_vertical.png";

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { token } = await login(username, password);
            localStorage.setItem('token', token);
            // Dispatch a custom event to notify App.tsx
            window.dispatchEvent(new Event('loginEvent'));
            navigate('/');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, textAlign: 'center' }}>
            <img src={logo} alt="Zeron logo" style={{ width: '120px', marginBottom: '20px' }} />
            <Typography variant="h5" component="h1" gutterBottom>
                Bienvenido al sistema de análisis de documentos
            </Typography>
            <Paper elevation={3} sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                        Login
                    </Button>
                </form>
            </Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                2025 powered by <Link href="https://zeron.com.ar" target="_blank" rel="noopener">zeron</Link>
            </Typography>
        </Box>
    );
}
