const express = require('express')
const app = express()
const sqlLite3 = require('sqlite3').verbose()
const cors = require('cors')
const axios = require('axios')
const converter = require('json-2-csv')
const fs = require('fs')
// const nodemailer = require('nodemailer')

let db
app.use(cors())
app.use(express.json({ limit: '50mb' }))
const POST_URL = 'https://link_name.salesmate.io/apis/v1/products'

class AddingProductsToSalesmate {
  static async start(completeData, selected, fileName) {
    for (let i = 0; i < completeData.length; i++) {
      const isDuplicate = await this.checkingDuplicate(completeData[i].SKU)
      console.log(
        isDuplicate,
        'nammmmmmmmmmmmmmmmmmmmmmeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      )
      console.log(isDuplicate.data, 'dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      if (isDuplicate.isDuplicate) {
        if (isDuplicate.data.salesmateID === undefined) {
          const postRes = await this.postingDataToSalesmate(
            completeData[i],
            selected,
          )
          this.addingErrorToObject(completeData[i], postRes)
          const res = await this.updatingDatabase(completeData[i], postRes)
          // console.log(
          //   res,
          //   'frommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm promiseeeeeeeeeeeeeeeeeeee',
          // )
        } else {
          completeData[i].salesmateID = isDuplicate.data.salesmateID
        }
      } else {
        const postRes = await this.postingDataToSalesmate(
          completeData[i],
          selected,
        )
        this.addingErrorToObject(completeData[i], postRes)
        const res = await this.postingDataToDatabase(completeData[i], fileName)
        console.log(
          res,
          'frommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm promiseeeeeeeeeeeeeeeeeeee',
        )
      }
    }
  }

  static addingErrorToObject(ele, postRes) {
    console.log('hiiiiii')
    if (typeof postRes === 'string') {
      ele.errorMessage = postRes.toLowerCase() + '......'
    } else {
      ele.salesmateID = String(postRes)
    }
  }

  static async checkingDuplicate(sku) {
    let returnData = await axios.get(
      `http://localhost:3006/checkingDuplicate/${sku}`,
    )
    console.log(
      '🚀 ~ file: index.js ~ line 63 ~ AddingProductsToSalesmate ~ checkingDuplicate ~ returnData',
      returnData.data,
    )

    if (returnData.data.isDuplicate === 'duplicate') {
      return { isDuplicate: true, data: returnData.data.data }
    } else {
      return { isDuplicate: false, data: null }
    }
  }

  static async postingDataToSalesmate(ele, selectedFields) {
    try {
      const body = {
        isActive: 'true',
        tags: 'sm_import_test',
        isActive: 'true',
        tags: 'sm_import_test',
        currency: 'INR',
      }
      for (let [element] of Object.entries(selectedFields)) {
        body[`${selectedFields[element]}`] = ele[`${element}`]
      }

      const res = await axios.post(POST_URL, body, {
        headers: {
          'Content-Type': 'application/json',
          accessToken: '3a2bbb61-aa33-11ea-9762-39ab38becb02',
          'x-linkname': 'test.salesmate.io',
        },
      })
      console.log('456')
      return res.data?.Data?.id
    } catch (err) {
      console.log('123')
      console.log(err.response.data.Error.Message)
      return JSON.stringify(err.response?.data?.Error?.Message)
    }
  }
  static async postingDataToDatabase(data, fileName) {
    try {
      const insetData = new Promise((resolve, reject) => {
        db.run(
          `insert into newExcelData values(?,?,?,?)`,
          [data.SKU, data.errorMessage, data.salesmateID, fileName],
          (err) => {
            if (err) {
              console.log('78930')
              console.log(err)
              reject(err)
            } else {
              console.log('namaste')
              resolve('data succesfully posted in database')
            }
          },
        )
      })
      const res = await insetData
      return res
    } catch (err) {
      return err
    }
  }
  static async updatingDatabase(ele, postRes) {
    try {
      if (typeof postRes === 'string') {
        const updateData = new Promise((resolve, reject) => {
          db.run(
            `UPDATE newExcelData SET  Error ="${postRes}" WHERE sku = '${ele.SKU}'`,
            (err) => {
              if (err) reject('error from update')
              else resolve('data succesfully updated in database')
            },
          )
        })
        const res = await updateData
        return res
      } else {
        const updateData = new Promise((resolve, reject) => {
          db.run(
            `UPDATE newExcelData SET Error="null",salesmateID=${ele.salesmateID} WHERE sku ="${ele.SKU}"`,
            (err) => {
              if (err) reject('error from update')
              else resolve('updated')
            },
          )
        })
        const res = await updateData
        return res
      }
    } catch (err) {
      return err
    }

    // await axios.put(`http://localhost:3005/update/${sku}`, {
    //   postRes: postRes,
    // })
  }
}

app.get('/createTable', (req, res) => {
  db.run(
    `CREATE TABLE IF NOT EXISTS newExcelData( sku TEXT , Error TEXT, salesmateID TEXT,fileName TEXT)`,
    (err) => {
      if (err) {
        console.log('error from createTable')
        return res.send(err)
      }
      return res.send('success')
    },
  )
})

function convertToCSV(objArray, status, fileName) {
  converter.json2csv(objArray, (err, csv) => {
    if (err) {
      throw err
    }
    console.log(csv)

    const date = new Date()
    const requiredFormat = `
    ${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}-${date
      .getHours()
      .toString()
      .padStart(2, '0')}${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`

    if (status === 'error') {
      fs.writeFileSync(
        `${__dirname}/errorExcelFiles/$product-import-error-${requiredFormat}.csv`,
        csv,
      )
    } else {
      fs.writeFileSync(
        `${__dirname}/successExcelFiles/product-import-success-${requiredFormat}.csv`,
        csv,
      )
    }
  })
}

app.post('/salesmate/saveData', async (req, res) => {
  let { completeData } = req.body
  const { selected, fileName } = req.body
  console.log(completeData)
  console.log(selected)
  console.log(fileName)
  res.send('we will mail you as soon as we have completed posting  data')
  await AddingProductsToSalesmate.start(completeData, selected, fileName)

  console.log(
    '🚀 ~ file: index.js ~ line 222 ~ app.post ~ completeData',
    completeData,
  )

  const successArr = completeData.filter((ele) => ele.salesmateID !== undefined)
  const errorArr = completeData.filter((ele) => ele.salesmateID === undefined)
  if (successArr.length > 0) convertToCSV(successArr, 'success', fileName)
  if (errorArr.length > 0) convertToCSV(errorArr, 'error', fileName)

  // const sendEmail = (options) => {
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: 'saisrinivas2580@gmail.com',
  //       pass: '',
  //     },
  //   })
  // }
})
app.get('/data', (req, res) => {
  db.all(`SELECT * FROM newExcelData`, (err, rows) => {
    if (err) {
      return res.send({ status: 'error' })
    }
    res.send(rows)
  })
})

app.get('/checkingDuplicate/:sku', (req, res) => {
  const { sku } = req.params
  console.log(sku)
  let index
  db.all(`SELECT * FROM newExcelData `, (err, rows) => {
    if (err) return res.send(err)
    const duplicate = rows.some((ele, ind) => {
      if (ele.sku === sku) index = ind
      return ele.sku === sku
    })
    console.log(rows)
    console.log(index)
    const data = rows[index]
    if (duplicate) {
      res.status(200).send({ isDuplicate: 'duplicate', data: data })
    } else {
      res.status(200).send({ isDuplicate: 'not duplicate' })
    }
  })
})

// app.put('/update/:sku', (req, res) => {
//   const { sku } = req.params
//   const { postRes } = req.body
//   console.log(sku)
//   console.log()

//   if (typeof postRes === 'string') {
//     db.run(
//       `UPDATE newExcelData SET is_Error ="true", Error ="${postRes}" WHERE sku = '${sku}'`,
//       (err) => {
//         if (err) return res.send('error from update')
//         res.send('update')
//       },
//     )
//   } else {
//     db.run(
//       `UPDATE newExcelData SET is_Error ="false" WHERE sku ="${sku}"`,
//       (err) => {
//         if (err) return res.send('error from update')
//         res.send('updated')
//       },
//     )
//   }
// })

app.delete('/delete', (req, res) => {
  db.run(`DELETE FROM newExcelData`, (err) => {
    if (err) return res.send(err)
    res.send('deleted')
  })
})

app.listen(3006, () => {
  db = new sqlLite3.Database('./test.db', sqlLite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message)
    }
    console.log('Connected to the database.')
    console.log('Server is running on port 300')
  })
})

// app.post('/skuPost', (req, res) => {
//   const sku = req.body.sku
//   const sql = `SELECT * FROM jsonData WHERE data ='%${sku}%'`
//   db.run(sql, (err, rows) => {
//     if (err) {
//       console.log(err)
//       res.send({ status: 'error' })
//     } else {
//       if (rows.length > 0) {
//         res.send({ status: 'success', data: rows })
//       } else {
//         res.send({ status: 'no SKU present' })
//       }
//     }
//   })
// })

// app.get('/data', (req, res) => {
//   db.all(`SELECT * FROM jsonData`, (err, rows) => {
//     if (err) {
//       res.send({ status: 'error' })
//     }
//     res.send(rows)
//   })
// })

// db.run(
//   `CREATE TABLE IF NOT EXISTS excel( sku TEXT UNIQUE, is_Error TEXT, Error TEXT, salesmateID TEXT,fileName TEXT)`,
//   (err) => {
//     if (err) console.log(err)
//   },
// )

// app.get('/getData', (req, res) => {
//   db.all(`SELECT * FROM excel`, (err, rows) => {
//     if (err) console.log(err)
//     console.log(rows)
//     res.send(rows)
//   })
// })

// app.get('/checkingData/:sku/:fileName', (req, res) => {
//   const sku = req.params.sku
//   const fileName = req.params.fileName

//   let duplicate
//   db.all(`SELECT * FROM excel `, (err, rows) => {
//     if (err) res.send(err)
//     console.log(rows)
//     console.log(rows[0].fileName === fileName)
//     duplicate = rows.some((ele) => ele.sku === sku)
//   })
//   if (duplicate) {
//     const data = rows
//       .filter(
//         (ele) =>
//           ele.fileName === fileName &&
//           ele.is_Error === '1' &&
//           ele.Error !== '"sku/code already exist".....',
//       )
//       .map((ele) => ele.sku)
//     res.send({ duplicate: true, data: data })
//   } else {
//     res.send(false)
//   }
// })

// db.all(`SELECT * FROM excel `, (err, rows) => {
//   if (err) res.send(err)
//   rows = rows
//   console.log(rows)
//   console.log(rows[0].fileName === fileName)
//   duplicate = rows.some((ele) => ele.sku === sku)
// })
// if (duplicate) {
//   const data = rows
//     .filter(
//       (ele) =>
//         ele.fileName === fileName &&
//         ele.is_Error === '1' &&
//         ele.Error !== '"sku/code already exist".....',
//     )
//     .map((ele) => ele.sku)
//   res.send({ isDuplicate: true, data: data })
// } else {
//   res.send({ isDuplicate: false, data: null })
// }
// const res = await this.postingDataToDatabase(completeData[i])
// console.log(res)
// if (i === 101) {
//   console.log('hiiiiiiiii')
// }
