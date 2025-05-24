import Layout from "../../layout/Layout";
import BreadcrumbsNav from "../../components/BreadcrumbsNav/BreadcrumbsNav";
import { Typography } from "@mui/material";
import RiskTable from "../../components/RiskTable/RiskTable";

const Incidents = () => {
    return(
        <Layout>
            <BreadcrumbsNav />
            <Typography sx={{
                color: 'var(--text-primary, var(--text-primary, #FFF))',
                fontFamily: 'Manrope',
                fontSize: 'var(--font-size-2125-rem, 34px)',
                fontWeight: '500',
                marginTop: 1,
                marginBottom: 5
            }}>
                Объекты риска
            </Typography>
            <RiskTable />
        </Layout>
    )
}

export default Incidents;