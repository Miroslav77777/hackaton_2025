import { Box, Typography } from "@mui/material"
import { observer } from "mobx-react-lite"
import themeStore from "../../stores/ThemeStore"
import mapStore from "../../stores/MapStore"

const MapSidebarBlocks = observer(() => {

    const feature = mapStore.getSelectedFeature;

    console.log(feature)

    return(
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gap={1} marginTop={6}>
            <Box display={'flex'} gap={1}>
                <Box sx={{
                    display: 'flex',
                    width: '176px',
                    height: '79px',
                    padding: '15px 101px 15px 21px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    borderRadius: '15px',
                    background: 'linear-gradient(180deg, #E31717 0%, #940627 103.77%)'
                }}>
                    <Typography sx={{
                        color: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.50)' : 'white',
                        fontFamily: 'Manrope',
                        fontSize: '12.562px',
                        fontWeight: '500',
                        lineHeight: '150%' /* 18.842px */
                    }}>
                        Риск
                    </Typography>
                    <Typography sx={{
                        color: '#FFF',
                        fontFamily: 'Manrope',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: '150%', /* 30px */
                    }}>
                        {feature?.properties?.risk != null ? `${feature.properties.risk}%` : '0%'}
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    width: '176px',
                    height: '79px',
                    padding: '15px 101px 15px 21px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    borderRadius: '15px',
                    background: 'linear-gradient(180deg, #222749 0%, #30334A 100%)'
                }}>
                    <Typography sx={{
                        color: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.50)' : 'white',
                        fontFamily: 'Manrope',
                        fontSize: '12.562px',
                        fontWeight: '500',
                        lineHeight: '150%' /* 18.842px */
                    }}>
                        Паттерн
                    </Typography>
                    <Typography sx={{
                        color: '#FFF',
                        fontFamily: 'Manrope',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: '150%', /* 30px */
                    }}>
                        {feature?.properties?.pattern != null ? `${feature.properties.pattern}` : 'Нет'}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{
                    display: 'flex',
                    width: '359px',
                    height: '79px',
                    padding: '15px 101px 15px 21px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    borderRadius: '15px',
                    background: themeStore.mode === 'dark' ? 'linear-gradient(180deg, #222749 0%, #30334A 100%)' : '#DCEAF8'
                }}>
                    <Typography sx={{
                        color: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.50)' : '#222749',
                        fontFamily: 'Manrope',
                        fontSize: '12.562px',
                        fontWeight: '500',
                        lineHeight: '150%' /* 18.842px */
                    }}>
                        Превышение
                    </Typography>
                    <Typography sx={{
                        color: themeStore.mode === 'dark' ? '#FFF' : '#222749',
                        fontFamily: 'Manrope',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: '150%', /* 30px */
                    }}>
                        {feature?.properties?.exceed != null ? `${feature.properties.exceed}` : '0 кВт⋅ч/мес'}
                    </Typography>
            </Box>

            
        </Box>
    )
})

export default MapSidebarBlocks