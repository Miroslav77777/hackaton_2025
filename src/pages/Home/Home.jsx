import Layout from "../../layout/Layout";
import { Box, Typography } from "@mui/material";
import BreadcrumbsNav from "../../components/BreadcrumbsNav/BreadcrumbsNav";
import InfoBox from "../../components/InfoBox/InfoBox";
import InfoBoxSml from "../../components/InfoBoxSml/InfoBoxSml";

import Bolt from '../../assets/bolt.svg?react';
import Warn from '../../assets/warn.svg?react';
import Emergency from '../../assets/emergency.svg?react'
import { LineChart } from "@mui/x-charts";
import IncedList from "../../components/IncedList/IncedList";
import DateTime from "../../components/DateTime/DateTime";

import { observer } from "mobx-react-lite";
import themeStore from "../../stores/ThemeStore";

import { useQuery } from '@tanstack/react-query';
import { fetchRiskAddresses } from '../../services/api';

const Home = observer(({}) => {
    const { data, isError } = useQuery({
        queryKey: ['ordered-buildings', 5], // можно менять 10 на проп
        queryFn: () => fetchRiskAddresses(5),
        staleTime: 1000 * 60, // 1 минута
    });

    
    if (isError) return <div>Ошибка загрузки</div>;
    return(
        <Layout>
            <BreadcrumbsNav />
            <Box display={"flex"} gap={'4.58vw'}>
                <Box display={"flex"} flexDirection={'column'}>
                    <Typography sx={{
                        color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
                        fontFamily: 'Manrope',
                        fontSize: 'var(--font-size-2125-rem, 34px)',
                        fontWeight: '500',
                        marginTop: 1,
                        marginBottom: 5
                    }}>
                        Главная
                    </Typography>
                    <Box display={"flex"} gap={'1.04vw'}>
                        <InfoBox name={'Общее энергопотребление по городу Краснодар'} background={'linear-gradient(180deg, #0177FC 0%, #014796 100%)'} width={'18.85vw'} icon={<Bolt />} value={'8,2 млрд кВт-ч'}/>
                        <InfoBox name={'Количество объектов с риском'} background={'linear-gradient(180deg, #E31717 0%, #940627 103.77%)'} width={'14.48vw'} icon={<Warn />} value={32}/>
                        <InfoBox name={'Количество тревог за последний месяц'} background={'linear-gradient(180deg, #E39117 0%, #D15605 103.77%)'} width={'14.48vw'} icon={<Emergency />} value={48}/>
                    </Box>

                    <Box display={"flex"} gap={'1.04vw'} marginTop={'1.04vw'}>
                        <InfoBoxSml name={'Потенциальная экономия в ₽ за последний месяц'} value={'12 млн ₽'}/>
                        <InfoBoxSml name={'Количество подтверждённых вызовов'} value={16}/>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #EFF1FE 100%)',
                        borderRadius: '15px',
                        marginTop: '20px',
                        width: '49.80vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : '#252736',
                            fontFamily: 'Manrope',
                            fontSize: '25px',
                            fontWeight: '500',
                        }} px={'26px'} py={'25px'}>
                            График динамики риска
                        </Typography>
                        <LineChart
                            
                            height={272}
                            xAxis={[{
                                scaleType: 'point',
                                data: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май'],
                                label: 'Месяцы',
                            }]}
                            yAxis={[{
                                label: 'Уровень риска %',
                            }]}
                            series={[
                                {
                                data: [10, 70, 40, 90, 75],
                                color: '#4CAF50', // зелёный
                                curve: 'linear',
                                },
                            ]}
                            />
                    </Box>
                </Box>
                
                <Box display={"flex"} flexDirection={'column'}>
                            <Typography sx={{
                                marginTop: 2,
                                color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
                                fontFamily: 'Manrope',
                                fontSize: '25px',
                                fontWeight: '500',
                                lineHeight: '150%' /* 60px */
                            }}>
                                Текущие инциденты
                            </Typography>
                            <IncedList data={data} pizdata={['Подозрение', 'Подозрение', 'Подозрение', 'Подозрение', 'Подозрение']} width={'20vw'} backcolor={themeStore.mode === 'dark' ? '#362525' : '#FFF7FA'} marginTop={5} withbutton={true}/>
                            <DateTime margTop={4}/>   
                </Box>
            </Box>
        </Layout>
    )
})

export default Home;


// 79