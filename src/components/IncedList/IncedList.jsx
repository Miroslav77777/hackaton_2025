import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import Attention from '../../assets/attention.svg?react';
import Blue from '../../assets/InfoOutlined.svg?react'
import { Link as RouterLink } from 'react-router-dom'; // если используешь react-router
import themeStore from '../../stores/ThemeStore';
import mapStore from '../../stores/MapStore';

const IncedList = ({ data, pizdata, width, marginTop, withbutton, brcolor = '#F44336', backcolor = '#362525', link='/incidents'}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <Typography>Нет инцидентов</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} marginTop={marginTop} width={width}>
      {data?.map((item, index) => (
        <Box
          key={index}
          display="flex"
        //   alignItems="center"
          gap={2}
          padding={2}
          border={`1px solid ${brcolor}`}
          borderRadius="8px"
          bgcolor={backcolor}
          
        >
          {brcolor === '#29B6F6' ? <Blue style={{ width: 24, height: 24}}/> :<Attention style={{ width: 24, height: 24}} />}
          <Box display={'flex'} flexDirection={'column'} gap={1}>
            <Typography variant="p" color="text.primary">
              {item.address}
            </Typography>
            <Typography variant="body2" color="text.primary" fontSize={'14px'}>
              {pizdata[index]}
            </Typography>
          </Box>
        </Box>
      ))}
      {withbutton && 
        <Box textAlign="right">
          <Link
            component={RouterLink}
            to={link}
            underline="none"
            fontWeight={600}
            textTransform={'uppercase'}
            color= {themeStore.mode==='dark' ? 'white' : 'black'}
          >
            Смотреть ещё
          </Link>
        </Box>
      }
      
    </Box>
    
  );
};

export default IncedList;
