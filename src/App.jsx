import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import Map from "./pages/Map/Map";
import Login from './pages/Login/Login';
import Incidents from "./pages/Incidents/Incidents";
import Profile from "./pages/Profile/Profile";
import Metrix from "./pages/Metrix/Metrix";

const App = () => {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/map" element={<Map/>} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/metrics" element={<Metrix />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;