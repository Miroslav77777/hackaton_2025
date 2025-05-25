import { Box, Typography } from "@mui/material";
import Work from '../../assets/work.svg?react'

const NowDate = ({count = 0}) => {
  const now = new Date();

  const dayOfWeek = now.toLocaleDateString('ru-RU', { weekday: 'long' }); // пятница
  const day = now.getDate(); // 24
  const month = now.toLocaleDateString('ru-RU', { month: 'long' }); // май

  return (
    <Box
      sx={{
        display: 'flex',
        height: '54px',
        padding: '23px 17px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '14px',
        border: '2px solid #5ED05E',
        background: '#252736',
        marginTop: 7,
        color: 'white',
        fontWeight: 500,
      }}
    >
      <Typography sx={{
        color: '#FFF',
        fontFamily: 'Manrope',
        fontSize: '15px',
        fontStyle: 'normal',
        fontWeight: '800', /* 22.5px */
        textTransform: 'capitalize'
      }}>
        {dayOfWeek}
      </Typography>
      <Typography sx={{
        color: '#FFF',
        fontFamily: 'Manrope',
        fontSize: '15px',
        fontStyle: 'normal',
        fontWeight: '800', /* 22.5px */
      }}>
        {day} {month}
      </Typography>
      <Box display={"flex"} alignItems={'center'} gap={2}>
        <Work />
        <Typography sx={{
        color: '#5ED05E',
        fontFamily: 'Manrope',
        fontSize: '15px',
        fontStyle: 'normal',
        fontWeight: '800', /* 22.5px */
        textTransform: 'capitalize'
      }}>
            {count}
        </Typography>
      </Box>
    </Box>
  );
};

export default NowDate;
