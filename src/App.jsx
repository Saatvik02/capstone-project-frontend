import { Route, Routes, BrowserRouter } from 'react-router-dom'
import MapSelector from './components/MapSelectorLeafletDraw'
import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import About from './components/About'
import Footer from './components/Footer'

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
          <Routes>
            <Route path={'/explore'} element={<MapSelector />} />
            <Route path={'/'} element={<Home />} />
            <Route path={'/about'} element={<About />} />
          </Routes>
        <Footer/>
      </BrowserRouter>
    </>

  )
}

export default App
