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

const Home = observer(() => {
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
                        <InfoBox name={'Общее энергопотребление по городу Краснодар'} background={'linear-gradient(180deg, #0177FC 0%, #014796 100%)'} width={'18.85vw'} icon={<Bolt />} value={'8:216 кВт-ч'}/>
                        <InfoBox name={'Количество объектов с риском'} background={'linear-gradient(180deg, #E31717 0%, #940627 103.77%)'} width={'14.48vw'} icon={<Warn />} value={48}/>
                        <InfoBox name={'Количество тревог за последний месяц'} background={'linear-gradient(180deg, #E39117 0%, #D15605 103.77%)'} width={'14.48vw'} icon={<Emergency />} value={48}/>
                    </Box>

                    <Box display={"flex"} gap={'1.04vw'} marginTop={'1.04vw'}>
                        <InfoBoxSml name={'Потенциальная экономия в ₽ за последний месяц'} value={'14, 88 ₽ '}/>
                        <InfoBoxSml name={'Количество подтверждённых вызовов'} value={1}/>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        marginTop: '20px',
                        width: '49.80vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
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
                                label: 'Расход (кВт/ч)',
                            }]}
                            series={[
                                {
                                data: [120, 180, 150, 210, 190],
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
                                color: '#FFF',
                                fontFamily: 'Manrope',
                                fontSize: '25px',
                                fontWeight: '500',
                                lineHeight: '150%' /* 60px */
                            }}>
                                Текущие инциденты
                            </Typography>
                            <IncedList data={['ул. Селезнёва, 210', 'ул. Таманская, 153к2 ', 'ул. Ставропольская, 80', 'ул. Красная, 1488', 'ул. им. Тургенева, 143 ']} pizdata={['Подозрение', 'Подозрение', 'Подозрение', 'Подозрение', 'Подозрение']} width={'20vw'} marginTop={5} withbutton={true}/>
                            <DateTime margTop={4}/>   
                </Box>
            </Box>
        </Layout>
    )
})

export default Home;


// 79