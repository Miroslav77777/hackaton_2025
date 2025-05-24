import React from 'react';
import { Box, Paper } from '@mui/material';
import LoginForm from '../../components/LoginForm/LoginForm';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // редирект после успешного входа
    navigate('/home');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Paper
        elevation={3}
        sx={{ padding: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}
      >
        <LoginForm onLogin={handleLogin} />
      </Paper>
    </Box>
  );
};

export default Login;
