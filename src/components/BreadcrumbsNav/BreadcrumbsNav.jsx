import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const pathNameMap = {
  home: 'Главная',
  risk: 'Объекты риска',
  object: 'Объект',
  profile: 'Профиль',
  metrics: 'Метрики',
  incidents: 'Инциденты'
};

export default function BreadcrumbsNav() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const isHomeOnly = pathnames.length === 1 && pathnames[0] === 'home';

  const breadcrumbItems = isHomeOnly
    ? [
        <Typography color="text.primary" key="home">
          Главная
        </Typography>,
      ]
    : [
        <Link underline="hover" color="inherit" component={RouterLink} to="/home" key="home">
          Главная
        </Link>,
        <Typography color="text.primary" key={pathnames[pathnames.length - 1]}>
          {pathNameMap[pathnames[pathnames.length - 1]] || decodeURIComponent(pathnames[pathnames.length - 1])}
        </Typography>,
      ];

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      {breadcrumbItems}
    </Breadcrumbs>
  );
}
