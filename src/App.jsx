import React from 'react'
import Home from './pages/Home/Home'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
function App() {
  return (
    <div>
   
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
     
    </div>
  )
}

export default App
