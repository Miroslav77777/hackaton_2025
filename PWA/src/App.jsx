import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Calendar from './pages/Calendar/Calendar';
import FormAddr from './pages/FormAddr/FormAddr';
import Success from "./pages/Success/Success";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const theme = createTheme({
  palette: {
    mode: 'dark', // включаем тёмную тему
    primary: {
      main: '#ffffff', // кнопки и т.п.
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
  },
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          '&.Mui-checked': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#ffffff',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#000', // можно оставить белым, если фон тёмный
        },
      },
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Calendar/>} />
        <Route path="/complete" element={<FormAddr />} />
        <Route path='/success' element={<Success />} />
      </Routes>
    </BrowserRouter>
    </ ThemeProvider>
  )
}

export default App
