import Layout from "../../layout/Layout";
import BreadcrumbsNav from "../../components/BreadcrumbsNav/BreadcrumbsNav";
import { Typography } from "@mui/material";
import RiskTable from "../../components/RiskTable/RiskTable";

import { observer } from "mobx-react-lite";
import themeStore from "../../stores/ThemeStore";

import { useQuery } from '@tanstack/react-query';
import { fetchRiskAddresses } from '../../services/api';

const Incidents = observer(() => {

    const { data, isError } = useQuery({
        queryKey: ['ordered-buildings', 5], // можно менять 10 на проп
        queryFn: () => fetchRiskAddresses(5),
        staleTime: 1000 * 60, // 1 минута
    });

    if (isError) return <div>Ошибка загрузки</div>;

    return(
        <Layout>
            <BreadcrumbsNav />
            <Typography sx={{
                color: themeStore.mode === 'dark' ? 'var(--text-primary, var(--text-primary, #FFF))' : 'text/primary',
                fontFamily: 'Manrope',
                fontSize: 'var(--font-size-2125-rem, 34px)',
                fontWeight: '500',
                marginTop: 1,
                marginBottom: 5
            }}>
                Объекты риска
            </Typography>
            <RiskTable data={data}/>
        </Layout>
    )
})

export default Incidents;