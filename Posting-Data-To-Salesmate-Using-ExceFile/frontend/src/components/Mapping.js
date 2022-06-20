import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './required.css'
import { useNavigate } from 'react-router-dom'
import DropDown from './DropDown'

const Mapping = ({
  excelHeadersArr,
  headerObj,
  excelData,
  setExcelHeadersArr,
  fileName,
}) => {
  const [dropDownArr, setDropDownArr] = useState([])
  const [selected, setselected] = useState(headerObj)
  const [value, setValue] = useState('')

  // const navigate = useNavigate()

  useEffect(() => {
    axios
      .get(
        'https://link_name.salesmate.io/apis/v3/fields/getAllVisibleFields',
        {
          headers: {
            'Content-Type': 'application/json',
            accessToken: '3a2bbb61-aa33-11ea-9762-39ab38becb02',
            'x-linkname': 'test.salesmate.io',
          },
        },
      )
      .then((res) => {
        console.log(
          '🚀 ~ file: Mapping.js ~ line 35 ~ .then ~ res.data.Data',
          res.data.Data,
        )
        setDropDownArr(res.data.Data.product)
      })
      .catch((err) => {
        console.log('123')
        console.log(err)
      })
  }, [])

  if (dropDownArr.length > 0) {
    excelHeadersArr.forEach((ele, index) => {
      dropDownArr.forEach((item) => {
        if (
          item.fieldName.toLowerCase() === excelHeadersArr[index].toLowerCase()
        ) {
          selected[ele] = item.fieldName
        }
      })
    })
  }

  const saveData = async () => {
    console.log('selected', selected)
    try {
      const res = await axios.post('http://localhost:3006/salesmate/saveData', {
        selected: selected,
        completeData: excelData,
        fileName: fileName,
      })
      setValue(res.data)
    } catch (err) {
      console.log(8008116120)
    }

    // navigate('/excel', { state: { completeData, selected, fileName } })
  }

  if (value.length > 0) {
    return <h1>{value}</h1>
  } else {
    return (
      <>
        {excelHeadersArr.map((item, index) => {
          return dropDownArr.length > 0 ? (
            <div key={index} className="container">
              <h1 class="left">{item}</h1>
              <DropDown
                dropDownArr={dropDownArr}
                excelHeadersArr={excelHeadersArr}
                index={index}
                setselected={setselected}
                selected={selected}
                header={item}
                setExcelHeadersArr={setExcelHeadersArr}
              />
            </div>
          ) : (
            ''
          )
        })}
        {Object.values(selected).some((ele) => ele.length > 0) ? (
          <button onClick={saveData}>next</button>
        ) : (
          ''
        )}
      </>
    )
  }
}

export default Mapping
