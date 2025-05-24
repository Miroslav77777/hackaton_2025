import { Box, Typography } from "@mui/material"

const InfoBoxSml = ({name, value}) => {
    return(
        <Box sx={{
            width: '24.38vw',
            height: '133px',
            background: 'linear-gradient(180deg, #222749 0%, #252736 100%)',
            borderRadius: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }} px={'27px'} py={'25px'}>
            <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.60)',
                    fontFamily: 'Manrope',
                    fontSize: '13px',
                    fontWeight: 500,
                    lineHeight: '150%', /* 24px */
                    width: '74%'
                }}>
                {name}
            </Typography>
            <Typography sx={{
                    color: '#FFF',
                    fontFamily: 'Manrope',
                    fontSize: '30px',
                    fontWeight: '700',
                    lineHeight: '150%', /* 60px */
                }}>
                {value}
            </Typography>
        </Box>
    )
}

export default InfoBoxSml;