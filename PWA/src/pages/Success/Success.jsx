import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';

const Success = () => {
  const navigate = useNavigate();

  return (
    <>
      <Logo />
      <Box display={'flex'} width={'100%'} flexDirection={'column'} alignItems={'center'}>
        <Typography my={40} fontSize={24}>
          Отчет успешно отправлен!
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 4,
            backgroundColor: '#007BFF',
            color: '#fff',
            width: '360px',
            borderRadius: '15px',
            display: 'block',
            margin: '0 auto'
          }}
          onClick={() => navigate('/')}
        >
          Вернуться
        </Button>
      </Box>
    </>
  );
};

export default Success;
