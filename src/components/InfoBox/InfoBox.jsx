import { Typography, Box } from '@mui/material';

const InfoBox = ({name, value, background, width, icon, hc='rgba(255, 255, 255, 0.60)', vc='#FFF'}) => {
    return(
        <Box sx={{
            display: 'flex',
            width: `${width}`,
            height: '159px',
            background: `${background}`,
            flexDirection: 'column',
            borderRadius: '15px',
            justifyContent: 'space-between'
        }}
        px={3} py={3}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography sx={{
                    color: hc,
                    fontFamily: 'Manrope',
                    fontSize: '0.83vw',
                    fontWeight: 500,
                    lineHeight: '150%', /* 24px */
                    width: '74%'
                }}>
                    {name}
                </Typography>
                {icon}
            </Box>
            <Box>
                <Typography sx={{
                    color: vc,
                    fontFamily: 'Manrope',
                    fontSize: '2.08vw',
                    fontWeight: '700',
                    lineHeight: '150%', /* 60px */
                }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    )
}

export default InfoBox;