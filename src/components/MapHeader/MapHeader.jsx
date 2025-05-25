import React from "react";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Box from '@mui/material/Box';
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import { useState, useRef, useEffect } from "react";

import { observer } from "mobx-react-lite";
import themeStore from "../../stores/ThemeStore";

const MapHeader = observer(() => {

  const [anchorEl, setAnchorEl] = useState(null);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);


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
    <Box sx={{ 
      position: 'fixed',
      top: '19px',
      
      left: '449px',
      width: 'calc(100% - 511px)',
      borderRadius: '15px',
      overflow: 'hidden', // важно для скруглений
      zIndex: (theme) => theme.zIndex.drawer + 1,
      boxShadow: 'none'
      
    }}>
      <AppBar
        position="static"
        sx={{
          boxShadow: 'none',
          backgroundColor: themeStore.mode === 'dark' ? '#252736' : '#FFF',
          px: 2,
          py: 0,
          borderRadius: '15px',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundImage: 'none !important', // убираем градиент
          // border: '1px solid #242424',
          backdropFilter: 'none',
          height: '68px'
        }}
      >
        <Toolbar
          disableGutters
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {/* Левая часть: поле поиска и кнопка */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              component="a"
              href="./home"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 3,
                border: `1px solid ${
                  themeStore.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.23)'
                    : 'rgba(37, 39, 54, 0.55)'
                }`,
                color:
                  themeStore.mode === 'dark'
                    ? 'white'
                    : 'rgba(37, 39, 54, 0.55)',
                '&:hover': {
                  border: `1px solid ${
                    themeStore.mode === 'dark' ? 'white' : 'black'
                  }`,
                  background: 'none',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>

          {/* Правая часть: уведомления и настройки */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color = {themeStore.mode === 'dark' ? 'white' : '#222749'} >
                <NotificationsIcon />
              </IconButton>
            </Box>
            <Box
              ref={avatarRef}
              id="profile-button"
              onClick={handleClick}
              aria-controls={anchorEl ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
              sx={{
                p: 2,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
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
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                ref={menuRef}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  position: 'absolute',
                  left: '15px',
                  top: '-4px'
                }}
                PaperProps={{
                  ref: menuRef,
                  sx: {
                    background: themeStore.mode === 'dark' ? '#252736' : '#FFF',
                    width: '300px',
                    color: themeStore.mode === 'dark' ? '#FFF' : '#252736',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <MenuItem onClick={() => themeStore.toggleTheme()}>Тема</MenuItem>
                <MenuItem onClick={() => console.log('Выход')}>Выйти</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
});

export default MapHeader;
