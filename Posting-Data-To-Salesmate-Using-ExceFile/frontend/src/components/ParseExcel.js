import React, { useState } from 'react'
import Mapping from './Mapping'
import * as XLSX from 'xlsx/xlsx.mjs'

const ParseExcel = () => {
  const [fileName, setfileName] = useState('')
  const [excelHeadersArr, setExcelHeadersArr] = useState([])
  const [headerObj, setHeaderObj] = useState({})
  const [excelData, setExcelData] = useState([])

  const handleFile = async (e) => {
    const file = e.target.files[0]
    setfileName(file.name)

    const data = await file.arrayBuffer()
    console.log('🚀 ~ file: ParseExcel.js ~ lines 16 ~ handleFile ~ data', data)
    const workbook = XLSX.read(data)
    console.log(workbook)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 0,
      defval: '',
    })

    console.log(Object.keys(jsonData[0]))
    setExcelData(jsonData)
    setExcelHeadersArr(Object.keys(jsonData[0]))
    for (let [ele] of Object.entries(jsonData[0])) {
      headerObj[ele] = ''
    }
    setHeaderObj(headerObj)
  }
  console.log(
    '🚀 ~ file: ParseExcel.js ~ line 10 ~ ParseExcel ~ excelData',
    excelData,
  )

  return (
    <>
      {fileName ? <h1>filename:{fileName}</h1> : ''}
      <br />
      <input type="file" onChange={(e) => handleFile(e)} />
      {excelHeadersArr.length > 0 ? (
        <div>
          <Mapping
            excelHeadersArr={excelHeadersArr}
            headerObj={headerObj}
            excelData={excelData}
            setHeaders={setExcelHeadersArr}
            fileName={fileName}
          />
        </div>
      ) : (
        ''
      )}
    </>
  )
}

export default ParseExcel
