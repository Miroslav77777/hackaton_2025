import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Пример проверки
    if (email === 'admin@example.com' && password === '123456') {
      setError('');
      onLogin?.(); // вызов колбэка, если логин успешен
    } else {
      setError('Неверный email или пароль');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
      width="100%"
    >
      <Typography variant="h5" fontWeight={600} textAlign="center">
        Вход в систему
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
      />

      <Button variant="contained" color="primary" type="submit">
        Войти
      </Button>
    </Box>
  );
};

export default LoginForm;
