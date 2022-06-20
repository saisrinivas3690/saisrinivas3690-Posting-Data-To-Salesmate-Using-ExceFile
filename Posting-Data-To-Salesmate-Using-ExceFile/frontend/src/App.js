import React from 'react'
import './App.css'
import ParseExcel from './components/ParseExcel'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import ExcelScript from './components/ExcelScript'

function App() {
  return (
    <>
      <Routes>
        <Route path="" element={<ParseExcel />}></Route>
        <Route path="excel" element={<ExcelScript />}></Route>
      </Routes>
    </>
  )
}

export default App
