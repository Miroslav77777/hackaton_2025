import Layout from "../../layout/Layout";
import BreadcrumbsNav from "../../components/BreadcrumbsNav/BreadcrumbsNav";
import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import InfoBox from "../../components/InfoBox/InfoBox";
import Status from "../../components/Status/Status";
import DateTime from "../../components/DateTime/DateTime";

const Metrix = () => {
  return (
    <Layout>
      <BreadcrumbsNav />
      <Box display={"flex"} gap={'1.67vw'} alignItems={'self-start'}>
        <Box display={"flex"} flexDirection={"column"}>
          <Typography
            sx={{
              color: "var(--text-primary, #FFF)",
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
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
                            fontFamily: 'Manrope',
                            fontSize: '20px',
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
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
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
                                data: [120, 180, 150, 210, 190],
                                color: '#4CAF50', // зелёный
                                curve: 'linear',
                                },
                            ]}
                            />
                    </Box>
            </Box>
            <Box display={'flex'} gap={'1.67vw'}>
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
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
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
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
                                data: [120, 180, 150, 210, 190],
                                color: '#4CAF50', // зелёный
                                curve: 'linear',
                                },
                            ]}
                            />
                    </Box>
            </Box>
            <Box display={'flex'} gap={'1.67vw'}>
                 <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
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
                        background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
                        borderRadius: '15px',
                        width: '24.26vw'
                    }}>
                        <Typography sx={{
                            color: 'var(--text-primary, var(--text-primary, #FFF))',
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
                                data: [120, 180, 150, 210, 190],
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
};

export default Metrix;
