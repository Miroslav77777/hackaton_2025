import { Box, Typography } from "@mui/material"
import { observer } from "mobx-react-lite";
import themeStore from "../../stores/ThemeStore";

const InfoBoxSml = observer(({name, value}) => {
    return(
        <Box sx={{
            width: '24.38vw',
            height: '133px',
            background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #252736 100%)' : 'linear-gradient(180deg, #FFF 0%, #EFF1FE 100%)',
            borderRadius: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }} px={'27px'} py={'25px'}>
            <Typography sx={{
                    color: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.60)' : '#252736',
                    fontFamily: 'Manrope',
                    fontSize: '13px',
                    fontWeight: 500,
                    lineHeight: '150%', /* 24px */
                    width: '74%'
                }}>
                {name}
            </Typography>
            <Typography sx={{
                    color: themeStore.mode === 'dark' ? '#FFF' : '#252736',
                    fontFamily: 'Manrope',
                    fontSize: '30px',
                    fontWeight: '700',
                    lineHeight: '150%', /* 60px */
                }}>
                {value}
            </Typography>
        </Box>
    )
})

export default InfoBoxSml;