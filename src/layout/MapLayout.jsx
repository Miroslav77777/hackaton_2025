import React from "react";
import MapHeader from "../components/MapHeader/MapHeader";
import MapSidebar from "../components/MapSidebar/MapSidebar";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

const MapLayout = ({children}) => {
    return(
        <Box sx={{ display: 'flex', width: '100%'}}>
            <CssBaseline />
            <MapHeader />
            <MapSidebar />
            {children}
        </Box>
    )
}

export default MapLayout;