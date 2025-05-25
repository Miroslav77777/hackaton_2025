import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import mapStore from '../../stores/MapStore';


import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';

const getRiskColor = (risk) => {
  if (risk >= 95) return '#FF0000';
  if (risk >= 87) return '#D64500';
  if (risk >= 70) return '#FF7F00';
  if (risk >= 45) return '#B89300';
  if (risk >= 20) return '#7AA203';
  return '#3BE364';
};



const RiskTable = observer(({data}) => {
  const isDark = themeStore.mode === 'dark';
  const navigate = useNavigate();

  const handleClick = (row) => {
      const feature = {
    id: row.id,
    properties: {
      address: row.address,
      risk: row.properties.risk,
      pattern: row.properties.pattern,
      exceed: row.properties.exceed
    },
    geometry: {
      type: 'Point',
      coordinates: row.coordinates,
    },
  };

  mapStore.setSelectedFeature(feature);
  mapStore.center = [row.coordinates[1], row.coordinates[0]];
  mapStore.zoom = 18;

  navigate('/map'); // редирект на карту
};


  console.log(data);

// В RiskTable.js
  const sortedData = [...(data || [])].sort((a, b) => b.properties.risk - a.properties.risk);



  return (
    <TableContainer sx={{ backgroundColor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              '& th': { borderBottom: 'none' }
            }}
          >
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>№</TableCell>
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>УЛИЦА</TableCell>
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>РИСК</TableCell>
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>ПАТТЕРН</TableCell>
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>ПОТРЕБЛЕНИЕ</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData?.map((row, index) => (
            <TableRow key={row.id} sx={{ '& td': { borderBottom: 'none' }, width: '15.63vw' }}>
              <TableCell colSpan={6} sx={{ padding: 0, width: '15.63vw' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '18px',
                    bgcolor: isDark ? '#252736' : '#f0f0f0',
                    padding: 2,
                    mb: 1,
                    width: '74.48vw'
                  }}
                >
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '1%' }}>{index+1}</Typography>
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '23%' }}>{row.address}</Typography>
                  <Typography sx={{ color: getRiskColor(row.properties.risk), fontWeight: 600, width: '14%' }}>
                    {row.properties.risk}%
                  </Typography>
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '19.5%' }}>{row.properties.pattern}</Typography>
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '20%' }}>{row.properties.exceed}</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: isDark ? '#3B445C' : '#C5CAE9',
                      color: isDark ? '#fff' : '#000',
                      textTransform: 'none'
                    }}
                    onClick={() => handleClick(row)}
                  >
                    подробнее
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default RiskTable;
