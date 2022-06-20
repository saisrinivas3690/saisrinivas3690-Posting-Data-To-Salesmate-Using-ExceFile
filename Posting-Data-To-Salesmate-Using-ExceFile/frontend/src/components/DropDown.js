import React from 'react'

const DropDown = ({
  dropDownArr,
  excelHeadersArr,
  index,
  setselected,
  selected,
}) => {
  // console.log('🚀 ~ file: Selected.js ~ line 4 ~ Selected ~ selected', selected)

  return (
    <form>
      <select
        name={excelHeadersArr[index]}
        onChange={(event) => {
          setselected({ ...selected, [event.target.name]: event.target.value })
        }}
        // value={selected[excelHeadersArr[index]]}
      >
        <option value="">Choose a field...</option>
        {dropDownArr.map((item, index2) => {
          if (
            item.fieldName.toLowerCase() ===
            excelHeadersArr[index].toLowerCase()
          ) {
            return (
              <option key={index2} value={item.fieldName} selected>
                {item.displayName}
              </option>
            )
          } else {
            return (
              <option key={index2} value={item.fieldName}>
                {item.displayName}
              </option>
            )
          }
        })}
      </select>
    </form>
  )
}

export default DropDown
