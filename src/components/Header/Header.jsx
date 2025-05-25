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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { useState, useEffect, useRef } from "react";

import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';
import AutocompleteSearch from "../AutocompleteSearch/AutocompleteSearch";

import { getReports } from '../../services/api';





const Header = observer(() => {
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);
  const [hasNewReports, setHasNewReports] = useState(false);


  const handleClick = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
  const fetchAndCompareReports = async () => {
    try {
      const latest = await getReports();

      const prevRaw = localStorage.getItem('latest_reports');
      const prev = prevRaw ? JSON.parse(prevRaw) : [];

      const prevIds = new Set(prev.map(r => r.id));
      const newIds = new Set(latest.map(r => r.id));

      const hasNew = latest.some(r => !prevIds.has(r.id));
      setHasNewReports(hasNew);

      localStorage.setItem('latest_reports', JSON.stringify(latest));
    } catch (err) {
      console.error('Ошибка при загрузке отчётов:', err);
    }
  };

  fetchAndCompareReports(); // первый вызов сразу
  const interval = setInterval(fetchAndCompareReports, 10000); // каждые 10 сек

  return () => clearInterval(interval);
}, []);


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

  useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setShowHeader(false); // скролл вниз — скрыть
    } else {
      setShowHeader(true); // скролл вверх — показать
    }

    lastScrollY.current = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <Box
      sx={{
        position: 'fixed',
        top: showHeader ? '19px' : '-100px', // уходит вверх
        left: '20.16vw',
        width: '75vw',
        borderRadius: '15px',
        overflow: 'hidden',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: 'none',
        transition: 'top 0.3s ease-in-out', // плавное появление/скрытие
      }}
    >

      <AppBar
        position="static"
        sx={{
          boxShadow: 'none',
          backgroundColor: themeStore.mode === 'dark' ? '#252736' : '#FFF',
          px: 4,
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
            {/* <TextField
              id="outlined-basic"
              label="Поиск адреса"
              variant="outlined"
              size="small"
              sx={{
                width: '220px',
                input: { color: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeStore.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(37, 39, 54, 0.55)',
                    borderRadius: '10px',
                  },
                  '&:hover fieldset': {
                    borderColor: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: themeStore.mode === 'dark' ? 'white' : 'rgba(37, 39, 54, 0.55)',
                },
              }}
            /> */}
            <AutocompleteSearch onHeader={true}/>
            {/* <IconButton
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
              <SearchIcon />
            </IconButton> */}
          </Box>

          {/* Правая часть: уведомления и настройки */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton sx={{ position: 'relative', color: themeStore.mode === 'dark' ? 'white' : '#222749' }}>
  <NotificationsIcon />
  {hasNewReports && (
    <Box
      sx={{
        position: 'absolute',
        top: 6,
        right: 6,
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: '#f44336', // красная точка
      }}
    />
  )}
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
                  left: '30px',
                  top: '-4px',
                  
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

export default Header;
