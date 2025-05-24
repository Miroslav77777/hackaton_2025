import { Typography, Box } from '@mui/material';

const InfoBox = ({name, value, background, width, icon}) => {
    return(
        <Box sx={{
            display: 'flex',
            width: `${width}`,
            height: '159px',
            background: `${background}`,
            flexDirection: 'column',
            borderRadius: '15px',
            gap: '7px'
        }}
        px={3} py={3}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography sx={{
                    color: 'rgba(255, 255, 255, 0.60)',
                    fontFamily: 'Manrope',
                    fontSize: '16px',
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
                    color: '#FFF',
                    fontFamily: 'Manrope',
                    fontSize: '40px',
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