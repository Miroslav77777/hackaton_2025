import Logo from '../../components/Logo/Logo'
import { Typography, Button } from '@mui/material';
import NowDate from '../../components/NowDate/NowDate';
import AddrList from '../../components/AddrList/AddrList';
import { useEffect, useState } from 'react';
import { getAddresses } from '../../../services/api';

import addrStore from '../../../store/AddrStore';

const Calendar = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
        const result = await getAddresses();
        setData(result);
        } catch (error) {
        console.error('❌ Ошибка при загрузке адресов:', error);
        }
    };

    fetchData(); // первый вызов сразу

    const interval = setInterval(fetchData, 15000); // повтор каждые 15 секунд

    return () => clearInterval(interval); // очистка при размонтировании
    }, []);

    addrStore.setBatch(data.batch || null);

  const openYandexRouteSmart = (addresses) => {
    if (!addresses || addresses.length === 0) return;

    const points = addresses.map((a) => `${a.lat},${a.lon}`).join('~');
    const appUrl = `yandexmaps://maps.yandex.ru/?rtext=~${points}&rtt=auto`;
    const webUrl = `https://yandex.ru/maps/?rtext=${points}&rtt=auto`;

    // Пробуем открыть приложение
    window.location.href = appUrl;

    // Если приложение не сработает за 1.5 сек — редирект на веб
    setTimeout(() => {
        window.open(webUrl, '_blank');
    }, 1500);
    };


  return (
    <>
      <Logo />
      <NowDate count={data.addresses?.length || 0}/>
      <AddrList data={data} />

      <Button
        onClick={() => openYandexRouteSmart(data.addresses || data)}
        variant="contained"
        sx={{
            mt: 4,
            backgroundColor: '#007BFF',
            color: '#fff',
            width: '100%',
            borderRadius: '15px',
            display: 'block',
            margin: '0 auto'
        }}
        >
        Открыть маршрут
        </Button>
    </>
  );
};

export default Calendar;
