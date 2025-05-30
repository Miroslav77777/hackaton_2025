import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';

const DateTime = observer(({margTop}) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // очистка при размонтировании
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start" gap={3} px={'27px'} py={'25px'} marginTop={margTop} sx={{
        background: themeStore.mode === 'dark' ? '#252736' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
        borderRadius: '15px', 
        width: '20vw'
    }}>
        <Typography>
            Дата и время
        </Typography>
      <Box display='flex' alignItems='center' justifyContent="space-between"
  width="100%">
        <Typography variant="h5" fontWeight={600}>
            {formatDate(dateTime)}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
            {formatTime(dateTime)}
        </Typography>
      </Box>
    </Box>
  );
});

export default DateTime;
