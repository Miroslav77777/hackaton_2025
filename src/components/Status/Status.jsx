import { Box, Typography } from '@mui/material';

const funnelData = [
  { label: 'Тревоги', value: 48 },
  { label: 'Выезды', value: 35 },
  { label: 'Подтверждённый', value: 24 },
  { label: 'Акты', value: 19 },
];

const Status = () => {
  return (
    <Box
      sx={{
        width: '23.15vw',
        height: '480px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #222648 0%, #252736 100%)',
        padding: '18px 25px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Manrope',
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '30px',
        }}
      >
        Статусы обработки вызовов
      </Typography>

      {/* Фон воронки */}
      <Box
        sx={{
          position: 'absolute',
          top: '60px',
          left: '1.56vw',
          right: '0',
          bottom: '0',
          background:
            'linear-gradient(0deg, rgba(0, 109, 231, 0.00) 5.27%, rgba(0, 109, 231, 0.92) 23.49%, #5ED05E 100%)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          zIndex: 0,
          opacity: 0.8,
          width: '40%',
          height: '80%',
          rotate: '180deg',
        }}
      />

      {/* Контент */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}
      >
        {funnelData.map((item) => (
          <Box
            key={item.label}
            sx={{
                
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              
            }}
          >
            <Box
              sx={{
                background: '#E8EAF6',
                borderRadius: '8px',
                padding: '8px 16px',
                minWidth: '64px',
                textAlign: 'center',
                marginLeft: '3.19vw'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#0051FF',
                }}
              >
                {item.value}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#fff',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Status;
