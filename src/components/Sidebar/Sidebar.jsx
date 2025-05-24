import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import Drawer from '@mui/material/Drawer';
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';

import Logo from '../Logo/Logo';

import MainIcon from '../../assets/home_icon.svg?react';
import ObjectsIcon from '../../assets/obj_icon.svg?react';
import MapIcon from '../../assets/map_icon.svg?react';
import MetrixIcon from '../../assets/metrix_icon.svg?react';
import ProfileIcon from '../../assets/user_icon.svg?react';
import SideItem from "../SideItem/SideItem";

import MainIconBlack from '../../assets/obj_icon_blk.svg?react';
import ObjectsIconBlack from '../../assets/obj_icon_blk.svg?react';
import MapIconBlack from '../../assets/obj_icon_blk.svg?react';
import MetrixIconBlack from '../../assets/metrix_icon_blk.svg?react';
import ProfileIconBlack from '../../assets/user_icon_blk.svg?react'

import MainIconActive from '../../assets/home_icon_active.svg?react';
import ObjectsIconActive from '../../assets/obj_icon_active.svg?react';
import MetrixIconActive from '../../assets/metrix_icon_active.svg?react';
import ProfileIconActive from '../../assets/user_icon_active.svg?react';
import MapIconActive from '../../assets/map_icon.svg?react';

import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';





const Sidebar = observer(() => {
  const [anchorEl, setAnchorEl] = useState(null);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();

  const navItems = [
  { to: '/home', icon: themeStore.mode === 'dark' ? <MainIcon /> : <MainIconBlack />, a_icon: <MainIconActive />,  text: 'ГЛАВНАЯ' },
  { to: '/incidents', icon: themeStore.mode === 'dark' ? <ObjectsIcon /> : <ObjectsIconBlack />, a_icon: <ObjectsIconActive />, text: 'Объекты Риска' },
  { to: '/map', icon: themeStore.mode === 'dark' ? <MapIcon /> : <MapIconBlack />, a_icon:  <MapIconActive />, text: 'Карта' },
  { to: '/metrics', icon: themeStore.mode === 'dark' ? <MetrixIcon /> : <MetrixIconBlack />, a_icon: <MetrixIconActive />, text: 'Панель метрик' },
  { to: '/profile', icon: themeStore.mode === 'dark' ? <ProfileIcon /> : <ProfileIconBlack />, a_icon: <ProfileIconActive />, text: 'Профиль' },
];

  const handleClick = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        '& .MuiDrawer-paper': {
          width: '263px',
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
      <Logo />

      <Box sx={{ flexGrow: 1 }}>
        <List>
          {navItems.map(({ to, icon, a_icon, text }) => {
            const isActive = location.pathname === to;
            return (
              <ListItem disablePadding key={to}>
                <NavLink
                  to={to}
                  style={{
                    textDecoration: 'none',
                    width: '100%',
                  }}
                >
                  <ListItemButton
                    
                  >
                    <SideItem icon={icon} text={text} a_icon={a_icon} isActive = {isActive}/>
                  </ListItemButton>
                </NavLink>
              </ListItem>
            );
          })}
        </List>
      </Box>

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
            width: '263px',
            color: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          },
        }}
      >
        <MenuItem onClick={() => themeStore.toggleTheme()}>Тема</MenuItem>
        <MenuItem onClick={() => console.log('Выход')}>Выйти</MenuItem>
      </Menu>
    </Drawer>
  );
});

export default Sidebar;
