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
  Typography,
  Paper
} from '@mui/material';

const getRiskColor = (risk) => {
  if (risk >= 95) return '#FF0000';
  if (risk >= 87) return '#D64500';
  if (risk >= 70) return '#FF7F00';
  if (risk >= 45) return '#B89300';
  if (risk >= 20) return '#7AA203';
  return '#3BE364';
};

const data = [
  {
    id: 1,
    street: 'ул. Героя Советского Союза Дмитрия...',
    risk: 100,
    pattern: 'Майнинг',
    exceed: '9800 кВч/мес'
  },
  {
    id: 2,
    street: 'ул. Селезнёва, 210',
    risk: 85,
    pattern: 'Майнинг',
    exceed: '2105 кВч/мес'
  },
  {
    id: 3,
    street: 'ул. Таманская улица, 153к2',
    risk: 92,
    pattern: 'Ахуи',
    exceed: '3200 кВч/мес'
  },
  {
    id: 4,
    street: 'ул. Красная, 1488',
    risk: 23,
    pattern: 'Майнинг',
    exceed: '300 кВч/мес'
  }
];

const RiskTable = () => {
  return (
    <TableContainer sx={{ backgroundColor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow sx={{
                '& th': { borderBottom: 'none' } // 🔥 убирает разделители между строками
            }}>
            <TableCell sx={{ color: '#aaa' }}>№</TableCell>
            <TableCell sx={{ color: '#aaa' }}>УЛИЦА</TableCell>
            <TableCell sx={{ color: '#aaa' }}>РИСК</TableCell>
            <TableCell sx={{ color: '#aaa' }}>ПАТТЕРН</TableCell>
            <TableCell sx={{ color: '#aaa' }}>ПОТРЕБЛЕНИЕ</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={data.id} sx={{'& td': { borderBottom: 'none'}, width: '15.63vw'}}>
                <TableCell colSpan={6} sx={{ padding: 0 , width: '15.63vw'}}>
                    <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: '18px',
                        bgcolor: '#252736',
                        padding: 2,
                        mb: 1, width: '74.48vw'
                    }}
                    >
                    <Typography sx={{ color: '#fff', width: '1%' }}>{row.id}</Typography>
                    <Typography sx={{ color: '#fff', width: '24%' }}>{row.street}</Typography>
                    <Typography sx={{ color: getRiskColor(row.risk), fontWeight: 600, width: '14%' }}>
                        {row.risk}%
                    </Typography>
                    <Typography sx={{ color: '#fff', width: '19.5%' }}>{row.pattern}</Typography>
                    <Typography sx={{ color: '#fff', width: '22.5%' }}>{row.exceed}</Typography>
                    <Button variant="contained" size="small" sx={{ backgroundColor: '#3B445C' }} color='white'>
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
};

export default RiskTable;
