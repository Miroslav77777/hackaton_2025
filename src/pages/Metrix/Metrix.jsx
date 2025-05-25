import Layout from "../../layout/Layout";
import BreadcrumbsNav from "../../components/BreadcrumbsNav/BreadcrumbsNav";
import { Box, Typography } from "@mui/material";
import { LineChart, PieChart } from "@mui/x-charts";
import InfoBox from "../../components/InfoBox/InfoBox";
import Status from "../../components/Status/Status";
import DateTime from "../../components/DateTime/DateTime";

import { observer } from "mobx-react-lite";
import themeStore from "../../stores/ThemeStore";



const Metrix = observer(() => {
  return (
    <Layout>
      <BreadcrumbsNav />
      <Box display={"flex"} gap={'1.67vw'} alignItems={'self-start'}>
        <Box display={"flex"} flexDirection={"column"}>
          <Typography
            sx={{
              color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
              fontFamily: "Manrope",
              fontSize: "34px", // используем прямое значение
              fontWeight: "500",
              marginTop: 1,
              marginBottom: 5,
            }}
          >
            Метрики
          </Typography>
          <Box display={'flex'} flexDirection={'column'} gap={'1.67vw'}>
            <Box display={'flex'} gap={'1.67vw'}>
                 <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: '500',
                        }} px={'26px'} py={'25px'}>
                            Динамика риска
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
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: '500',
                            
                        }} px={'26px'} py={'25px'}>
                            Суммарное потребление / норматив
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
                            innerRadius: 30,
                            outerRadius: 100,
                            id: 'consumption',
                            label: 'Суммарное потребление',
                            data: [120, 180, 150, 210, 190],
                            color: '#4CAF50', // зелёный
                            curve: 'linear',
                            },
                            {
                            innerRadius: 30,
                            id: 'norm',
                            label: 'Норматив',
                            data: [130, 130, 130, 130, 130],
                            color: '#03A9F4', // голубой
                            curve: 'linear',
                            }
                        ]}
                        legend={{
                            direction: 'row',
                            position: {
                            vertical: 'bottom',
                            horizontal: 'middle',
                            },
                        }}
                        />
                    </Box>
            </Box>
            <Box display={'flex'} gap={'1.67vw'}>
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: '500',
                            
                        }} px={'26px'} py={'25px'}>
                            Количество обнаружений в месяц
                        </Typography>
                        <LineChart
                        height={272}
                        xAxis={[{
                            scaleType: 'point',
                            data: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май'],
                            label: 'Месяцы',
                        }]}
                        yAxis={[{
                            label: '',
                        }]}
                        series={[
                            {
                            id: 'consumption',
                            label: 'Новые тревоги',
                            data: [20, 35, 30, 40, 50],
                            color: '#4CAF50', // зелёный
                            curve: 'linear',
                            },
                            {
                            id: 'norm',
                            label: 'Подтвержденные',
                            data: [10, 20, 18, 25, 30],
                            color: '#03A9F4', // голубой
                            curve: 'linear',
                            }
                        ]}
                        legend={{
                            direction: 'row',
                            position: {
                            vertical: 'bottom',
                            horizontal: 'middle',
                            },
                        }}
                        />
                    </Box>
                     <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: '500',
                            
                        }} px={'26px'} py={'25px'}>
                            Распределение по типам нарушений
                        </Typography>
                        

                        <PieChart
                        series={[
                            {
                            data: [
                                { id: 0, value: 40, label: 'Майнинг', color: '#5ED05E' },     // зелёный
                                { id: 1, value: 30, label: 'Занижение показаний', color: '#2196F3' }, // blue/500
                                { id: 2, value: 30, label: 'Прочие', color: '#26A69A' },       // teal/400
                            ],
                            innerRadius: 60,
                            outerRadius: 150,
                            },
                        ]}
                        width={400}
                        height={300}
                        legend={{
                            direction: 'row',
                            position: {
                            vertical: 'bottom',
                            horizontal: 'middle',
                            },
                        }}
                        />
                    </Box>
            </Box>
            <Box display={'flex'} gap={'1.67vw'}>
                 <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: '500',
                            
                        }} px={'26px'} py={'25px'}>
                            Статусы обработки вызовов
                        </Typography>
                        <PieChart
                        series={[
                            {
                            data: [
                                { id: 0, value: 25, label: 'Незапланированные', color: '#5ED05E' },     // зелёный
                                { id: 1, value: 35, label: 'Запланированные', color: '#2196F3' }, // blue/500
                                { id: 2, value: 40, label: 'Выехали', color: '#26A69A' },       // teal/400
                            ],
                            innerRadius: 60,
                            outerRadius: 150,
                            },
                        ]}
                        width={400}
                        height={300}
                        legend={{
                            direction: 'row',
                            position: {
                            vertical: 'bottom',
                            horizontal: 'middle',
                            },
                        }}
                        />
                    </Box>
                 <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #F0F2FF 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: themeStore.mode === 'dark' ? "var(--text-primary, #FFF)" : 'var(--text-primary, #252736)',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: '500',
                            
                        }} px={'26px'} py={'25px'}>
                            Накопительная экономия ₽
                        </Typography>
                        <LineChart
                            height={272}
                            xAxis={[{
                                scaleType: 'point',
                                data: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май'],
                                label: 'Месяцы',
                            }]}
                            yAxis={[{
                                label: 'млн ₽',
                            }]}
                            series={[
                                {
                                data: [2, 5, 9, 13, 17],
                                color: '#4CAF50', // зелёный
                                curve: 'linear',
                                },
                            ]}
                            />
                    </Box>
            </Box>
          </Box>
        </Box>
        <Box display={'flex'} flexDirection={"column"} marginTop={'99px'} gap={'1.67vw'}>
            <InfoBox name={'Количество свободных бригад'} value={48} background={'linear-gradient(180deg, #0177FC 0%, #014796 100%)'} width={'23.15vw'}/>
            <Status />
            <DateTime />
        </Box>
      </Box>
    </Layout>
  );
});

export default Metrix;
