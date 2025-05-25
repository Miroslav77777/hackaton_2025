import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Bolt from '../../assets/free-icon-font-bolt-6853811 1.svg?react';

import IncedList from '../IncedList/IncedList';
import AutocompleteSearch from '../AutocompleteSearch/AutocompleteSearch';
import MapSidebarBlocks from '../MapSidebarBlocks/MapSidebarBlocks';

import { useRef, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import mapStore from '../../stores/MapStore';
import themeStore from '../../stores/ThemeStore';


import { useQuery } from '@tanstack/react-query';
import { fetchRiskAddresses, sendReport } from '../../services/api';
import { Button } from '@mui/material';


const MapSidebar = observer(() => {

  const { data, isError } = useQuery({
        queryKey: ['ordered-buildings', 5], // можно менять 10 на проп
        queryFn: () => fetchRiskAddresses(5),
        staleTime: 1000 * 60, // 1 минута
    });

    if (isError) return <div>Ошибка загрузки</div>;

    const feature = mapStore.getSelectedFeature;

    const [anchorEl, setAnchorEl] = useState(null);
      const avatarRef = useRef(null);
      const menuRef = useRef(null);
    
      const handleClick = (event) => {
        setAnchorEl((prev) => (prev ? null : event.currentTarget));
      };
    
      const handleClose = () => {
        setAnchorEl(null);
      };

      const handleSendReport = async () => {
        if (!feature) return;

        const id = feature.id.split('/')[1]; // ← это ты хотел
        const addr = feature.properties.address;

        try {
          const result = await sendReport(id, addr);
          console.log('✅ Успешно отправлено:', result);
        } catch (err) {
          console.error('❌ Ошибка при отправке:', err);
        }
      };
    
      // Закрытие при клике вне меню
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (
            avatarRef.current &&
            !avatarRef.current.contains(event.target) &&
            menuRef.current &&
            !menuRef.current.contains(event.target)
          ) {
            setAnchorEl(null);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

      feature ? console.log(feature) : null;

    return(
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                '& .MuiDrawer-paper': {
                width: '400px',
                boxSizing: 'border-box',
               background:
                themeStore.mode === 'dark'
                ? 'linear-gradient(180deg, #252736 0%, #252736 100%)'
                : 'linear-gradient(180deg, #FFF 0.01%, #F0FFF5 95.89%)',
                color: '#fff',
                borderRadius: '15px',
                height: 'calc(100vh - 38px)',
                margin: '19px 0 19px 19px',
                display: 'flex',
                flexDirection: 'column',
                border: 'none',
                },
            }}
            >
            {/* Верхняя часть — лого и меню */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{display: 'flex', alignItems: 'center'}} gap={1} py={'14px'}>
                    <IconButton component="a"
              href="./home">
                        <Bolt />
                    </IconButton>
                    {/* <TextField
                        id="outlined-basic"
                        label="Поиск адреса"
                        variant="outlined"
                        size="small"
                        sx={{
                        width: '280px',
                        input: { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                            borderRadius: '10px',
                            },
                            '&:hover fieldset': {
                            borderColor: 'white',
                            },
                            '&.Mui-focused fieldset': {
                            borderColor: 'white',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: 'white',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: 'white',
                        },
                        }}
                    />
                    <IconButton
                        sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 3,
                        border: '1px solid rgba(255, 255, 255, 0.23)',
                        color: 'white',
                        '&:hover': {
                            border: '1px solid white',
                            background: 'none'
                        },
                        }}
                    >
                        <SearchIcon />
                    </IconButton> */}
                    <AutocompleteSearch
                    defaultValue={
                        feature && feature.properties['building:flats']
                        ? `${feature.properties['addr:street'] ?? ''} ${feature.properties['addr:housenumber'] ?? ''}`.trim() : ''
                    }
                    />
                </Box>
                <Box display={'flex'} alignItems={'flex-start'} width={'360px'} marginTop={5}>
                    <Typography sx={{
                                
                                color: themeStore.mode === 'dark' ? '#FFF' : '#252736',
                                fontFamily: 'Manrope',
                                fontSize: '25px',
                                fontWeight: '500',
                                height: '50px',
                                lineHeight: '150%' /* 60px */
                            }}>
                        {
                        feature && !feature.properties['building:flats'] || feature?.properties.address
                            ? (
                                feature.properties.address
                                ? feature.properties.address
                                : `${feature.properties['addr:street'] ?? ''} ${feature.properties['addr:housenumber'] ?? ''}`.trim()
                            )
                            : 'Объекты с наивысшим риском'
                        }
                    </Typography>
                </Box>
                {feature && !feature.properties['building:flats'] || feature?.properties.address ? feature.properties.risk ? <><MapSidebarBlocks /> <Button variant="contained" sx={{ mt: 2, backgroundColor: '#007BFF', color: '#fff', width:'359px', borderRadius: '15px' }} onClick={handleSendReport}>ОТПРАВИТЬ БРИГАДУ
      </Button></> : <MapSidebarBlocks />  : <IncedList data={data} pizdata={['Подозрение', 'Подозрение', 'Подозрение', 'Подозрение', 'Подозрение']} width={'360px'} marginTop={7} backcolor={themeStore.mode === 'dark' ? '#362525' : '#FFF7FA'} withbutton={false} />}
            </Box>

            {/* Низ — профиль */}
           <Box
        ref={avatarRef}
        onClick={handleClick}
        sx={{
          p: 2,
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          borderTop: '1px solid #242424',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <Avatar />
        <Box>
          <Typography variant="body2" sx={{ color: 'gray' }}>
            Ульяна Аллаярова
          </Typography>
          <Typography variant="caption" sx={{ color: 'gray' }}>
            jdoe@acme.com
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disablePortal
        ref={menuRef}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          ref: menuRef,
          sx: {
            background: themeStore.mode === 'dark' ? '#252736' : '#FFF',
            width: '400px',
            color: themeStore.mode === 'dark' ? '#FFF' : '#252736',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          },
        }}
      >
        <MenuItem onClick={() => {themeStore.toggleTheme(), setAnchorEl((prev) => (prev ? null : event.currentTarget));}}>Тема</MenuItem>
        <MenuItem onClick={() => console.log('Выход')}>Выйти</MenuItem>
      </Menu>

            </Drawer>

    )
})

export default MapSidebar