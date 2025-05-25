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



import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';

import { getReportFile, getAddress } from '../../services/api';

import { useEffect, useState } from 'react';




const ReportsTable = observer(({data}) => {
  const isDark = themeStore.mode === 'dark';
  const [addressMap, setAddressMap] = useState({});
  const navigate = useNavigate();

   useEffect(() => {
    const loadAddresses = async () => {
      const newMap = {};

      for (const row of data) {
        try {
          const addr = await getAddress(row.address_id);
          newMap[row.address_id] = addr;
        } catch (err) {
          console.error('Ошибка при получении адреса:', row.address_id, err);
        }
      }

      setAddressMap(newMap);
    };

    if (data?.length) loadAddresses();
  }, [data]);



  console.log(data);

  const handleDownload = async (id) => {
  try {
    await getReportFile(id);
  } catch (error) {
    console.error('❌ Ошибка при скачивании отчета:', error);
    alert('Не удалось скачать файл.');
  }
};

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
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>ДАТА</TableCell>
            <TableCell sx={{ color: isDark ? '#aaa' : '#333' }}>НОМЕР БРИГАДЫ</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((row, index) => (
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
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '5%' }}>{index+1}</Typography>
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '16%' }}>{addressMap[row.address_id]?.raw_address || 'Загрузка...'}</Typography>
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '10%' }}>
                     {new Date(row.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                  </Typography>
                  <Typography sx={{ color: isDark ? '#fff' : '#000', width: '38%' }}>b4e14795-7a55-48fc-bb87-f7c7930de6ff</Typography>
                  <Button
                variant="contained"
                size="small"
                onClick={() => handleDownload(row.id)}
                sx={{
                    backgroundColor: isDark ? '#3B445C' : '#C5CAE9',
                    color: isDark ? '#fff' : '#000',
                    textTransform: 'none'
                }}
                >
                скачать
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

export default ReportsTable;

// Ульяна Аллоярова