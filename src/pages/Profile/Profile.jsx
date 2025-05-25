import Layout from "../../layout/Layout";
import { Box, Typography } from "@mui/material";
import BreadcrumbsNav from "../../components/BreadcrumbsNav/BreadcrumbsNav"; // не забудь импортировать, если ещё не подключён
import InfoBox from "../../components/InfoBox/InfoBox";
import IncedList from "../../components/IncedList/IncedList";

import User from '../../assets/user_prof.svg?react'
import DateTime from "../../components/DateTime/DateTime";

import { observer } from "mobx-react-lite";
import themeStore from "../../stores/ThemeStore";



const Profile = observer(() => {
  const data = [
  { address: 'ул. Селезнёва, 210' },
  { address: 'ул. Таманская, 153к2' },
  { address: 'ул. Ставропольская, 80' },
  { address: 'ул. Красная, 1488' },
  { address: 'ул. им. Тургенева, 143' }
];
  return (
    <Layout>
      <BreadcrumbsNav />
      <Box display="flex" gap={'8.33vw'}>
        <Box display="flex" flexDirection="column">
          <Typography
            sx={{
              color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
              fontFamily: 'Manrope',
              fontSize: '34px',
              fontWeight: 500,
              marginTop: 1,
              marginBottom: 5,
            }}
          >
            Профиль
          </Typography>

          <Box sx={{
            display: 'flex',
            width: '25.26vw',
            height: '209px',
            borderRadius: '15px',
            background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
            justifyContent: 'space-between'
          }} alignItems={'center'} px={3}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'self-start'
            }}>
                <Typography sx={{
                    color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
                    fontFamily: 'Manrope',
                    fontSize: '28px',
                    fontWeight: 500,
                    margin: '0'
                }}>
                    <p style={{margin: 0}}>Аллаярова</p>
                    <p style={{margin: 0}}>Ульяна</p>
                    <p style={{margin: 0}}>Сергеевна</p>
                </Typography>
                <Typography sx={{
                    color: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.60)' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
                    fontFamily: 'Manrope',
                    fontSize: '20px',
                    fontWeight: 500,
                    lineHeight: '150%', /* 24px */
                    
                }}>
                    Старший диспетчер
                </Typography>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'start'
            }} py={3}>
                <User />
            </Box>
          </Box>

          <Typography
            sx={{
              color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
              fontFamily: 'Manrope',
              fontSize: '28px',
              fontWeight: 300,
              marginTop: 6,
              marginBottom: 5
            }}
          >
            Общая статистика по оператору (KPI)
          </Typography>

          <Box display={'flex'} flexDirection={'column'} gap={'1.25vw'}>
            <Box display={'flex'} gap={'1.25vw'}>
                <InfoBox name={'Всего инцидентов обработано'} value={4} width={'14.48vw'} background={'linear-gradient(180deg, #0177FC 0%, #014796 100%)'}/>
                <InfoBox name={'Среднее время отклика'} value={'7 часов'} width={'14.48vw'} background={'linear-gradient(180deg, #0177FC 0%, #014796 100%)'}/>
                <InfoBox name={'Конверсия подтверждение'} value={'70%'} width={'14.48vw'} background={'linear-gradient(180deg, #0177FC 0%, #014796 100%)'}/>
            </Box>
            <Box display={'flex'} gap={'1.25vw'}>
                <InfoBox name={'KPI выполнен на:'} value={4} width={'14.48vw'} background={themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FEFEFF 0%, #F0F1FF 100%)'} hc={themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.60)' : 'var(--text-primary, rgba(0, 0, 0, 0.87))'} vc={themeStore.mode === 'dark' ? '#fff' : 'var(--text-primary, rgba(0, 0, 0, 0.87))'}/>
            </Box>
          </Box>

          {/* Вставь сюда остальные элементы профиля */}
        </Box>
        <Box display={'flex'} flexDirection={'column'}>
            <Typography sx={{
                marginTop: 2,
                color: themeStore.mode === 'dark' ? '#fff' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
                fontFamily: 'Manrope',
                fontSize: '25px',
                fontWeight: '500',
                lineHeight: '150%', /* 60px */
                width: '70%'
            }}>
                Список обработанных инцидентов
            </Typography>
            <IncedList data={data} pizdata={['23 мая 0:05 - Майнинг (Риск 89%)', '22 мая 4:05 - Майнинг (Риск 90%) ', '22 мая 4:00 - Теплица (Риск 39%)', '22 мая 0:05 - Дата Центр (Риск 70%)', '22 мая 0:05 - Дата Центр (Риск 70%)']} width={'20vw'} marginTop={1} withbutton={true} backcolor={themeStore.mode === 'dark' ? '#252836' : '#FDFDFF'} brcolor={'#29B6F6'} link="/reports"/>
            <DateTime margTop={2}/>
        </Box>
      </Box>
    </Layout>
  );
});

export default Profile;
