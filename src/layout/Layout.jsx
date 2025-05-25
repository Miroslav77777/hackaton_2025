import React from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react-lite';
import themeStore from '../stores/ThemeStore';

const Layout = observer(({children}) => {
    return(
        <Box sx={{ display: 'flex', width: '100%'}}>
            <CssBaseline />
            <Header />
            <Sidebar />
            <Box sx={{
                paddingLeft: '20.16vw',
                paddingTop: '106px',
                background: themeStore.mode === 'dark' ? '#1E1E28' : 'linear-gradient(180deg, #DEEBFE 0%, #D4EAD4 100%)',
                width: '100%',
                minHeight: '100vh',
                height: 'fitContent',
                paddingBottom: '21px'
            }}>
                {children}
            </Box>
        </Box>
    )
})

export default Layout;