import { useState } from 'react'
import MapSelector from './components/MapSelector'
import './App.css'

function App() {

  return (
    <>
      {/* <div style={{ textAlign: "center" }}>
        <h1>Sentinel-2 Crop Mapping</h1>
      </div> */}
      <div style={{ width: "80vw", height: "500px", margin: "none", border: "2px solid #ddd", borderRadius: "10px" }}>
        <MapSelector/>
      </div>
    </>

  )
}

export default App
