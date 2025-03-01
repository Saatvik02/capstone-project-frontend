import { useState } from 'react'
import MapSelector from './components/MapSelectorLeafletDraw'
// import MapSelector from './components/MapSelectorLeaflet'
// import MapSelector from './components/MapSelectorGoogle'
import './App.css'
import Navbar from './components/Navbar'

function App() {

  return (
    <>
      <Navbar/>
      <div style={{ width: "100vw", height: "500px", margin: "auto", borderRadius: "10px" }}>
        <MapSelector/>
      </div>
    </>

  )
}

export default App
