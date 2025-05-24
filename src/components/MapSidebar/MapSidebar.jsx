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




const MapSidebar = observer(() => {

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
                background: 'linear-gradient(180deg, #252736 0%, #252736 100%)',
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
                                
                                color: '#FFF',
                                fontFamily: 'Manrope',
                                fontSize: '25px',
                                fontWeight: '500',
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
                {feature && !feature.properties['building:flats'] || feature?.properties.address ? <MapSidebarBlocks /> : <IncedList data={['ул. Селезнёва, 210', 'ул. Таманская, 153к2 ', 'ул. Ставропольская, 80', 'ул. Красная, 1488', 'ул. им. Тургенева, 143', 'ул. Селезнёва, 210']} pizdata={['Подозрение', 'Подозрение', 'Подозрение', 'Подозрение', 'Подозрение']} width={'360px'} marginTop={3} withbutton={false} />}
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
            Имя пользователя
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
            backgroundColor: '#252736 !important',
            width: '400px',
            color: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          },
        }}
      >
        <MenuItem onClick={() => console.log('Сменить тему')}>Тема</MenuItem>
        <MenuItem onClick={() => console.log('Выход')}>Выйти</MenuItem>
      </Menu>

            </Drawer>

    )
})

export default MapSidebar