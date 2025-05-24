import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const pathNameMap = {
  '': 'Главная',
  'risk': 'Объекты риска',
  'object': 'Объект',
  'profile': 'Профиль',
  'metrics': 'Метрики',
};

export default function BreadcrumbsNav() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      <Link underline="hover" color="inherit" component={RouterLink} to="/">
        Главная
      </Link>

      {pathnames.map((value, index) => {
        const to = '/' + pathnames.slice(0, index + 1).join('/');
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography color="text.primary" key={to}>
            {pathNameMap[value] || value}
          </Typography>
        ) : (
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to={to}
            key={to}
          >
            {pathNameMap[value] || value}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
