import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api';
import type { User } from '../api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formName, setFormName] = useState('');
    const [formLastName, setFormLastName] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formEmail, setFormEmail] = useState('');

    const fetchUsers = async () => {
        try {
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (err) {
            setError('No se pudieron cargar los usuarios');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenDialog = (user: User | null) => {
        setCurrentUser(user);
        if (user) {
            setFormName(user.name);
            setFormLastName(user.lastName);
            setFormUsername(user.username);
            setFormEmail(user.email);
            setFormPassword(''); // Password is not editable directly
        } else {
            setFormName('');
            setFormLastName('');
            setFormUsername('');
            setFormEmail('');
            setFormPassword('');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentUser(null);
    };

    const handleSubmit = async () => {
        setError('');
        console.log("handleSubmit called");
        console.log("currentUser:", currentUser);
        console.log("form data:", {
            name: formName,
            lastName: formLastName,
            username: formUsername,
            password: formPassword,
            email: formEmail,
        });
        try {
            if (currentUser) {
                // Update user
                console.log("Calling updateUser with ID:", currentUser.id);
                await updateUser(currentUser.id, {
                    name: formName,
                    lastName: formLastName,
                    username: formUsername,
                    email: formEmail,
                });
            } else {
                // Create user
                console.log("Calling createUser");
                await createUser({
                    id: uuidv4(),
                    name: formName,
                    lastName: formLastName,
                    username: formUsername,
                    password: formPassword, // Only for creation
                    email: formEmail,
                });
            }
            handleCloseDialog();
            fetchUsers(); // Refresh user list
        } catch (err) {
            console.error("Error in handleSubmit:", err);
            setError('Error al guardar el usuario');
        }
    };

    const handleDelete = async (id: string) => {
        setError('');
        try {
            await deleteUser(id);
            fetchUsers(); // Refresh user list
        } catch (err) {
            setError('Error al eliminar el usuario');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Administración de Usuarios
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog(null)}
                sx={{ mb: 2 }}
            >
                Agregar Usuario
            </Button>
            {error && <Typography color="error">{error}</Typography>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Apellido</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.lastName}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(user.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentUser ? 'Editar Usuario' : 'Agregar Usuario'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre"
                        type="text"
                        fullWidth
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Apellido"
                        type="text"
                        fullWidth
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Usuario"
                        type="text"
                        fullWidth
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                    />
                    {!currentUser && ( // Password only for new user creation
                        <TextField
                            margin="dense"
                            label="Contraseña"
                            type="password"
                            fullWidth
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                        />
                    )}
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit}>{currentUser ? 'Actualizar' : 'Agregar'}</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}