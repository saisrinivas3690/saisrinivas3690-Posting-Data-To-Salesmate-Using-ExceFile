import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { CSVLink } from 'react-csv'

const ExcelScript = () => {
  const location = useLocation()
  const POST_URL = 'https://link_name.salesmate.io/apis/v1/products'
  let data = []
  let headerss

  const [completeData, setCompleteData] = useState(
    () => location.state.completeData,
  )
  const fileName = location.state.fileName
  const selectedFields = location.state.selected
  const [loading, setLoading] = useState(true)
  console.log(completeData)

  useEffect(() => {
    class AddingProductsToSalesmate {
      static async start() {
        for (let i = 100; i < 101; i++) {
          const postRes = await this.postingData(completeData[i])
          if (typeof postRes === 'string') {
            completeData[i].id = ''
            completeData[i].errorMessage = postRes.toLowerCase() + '.....'
            completeData[i].error = true
            await axios.post('http://localhost:3005/postData', {
              data: completeData[i],
              fileName: fileName,
            })
            if (i === 100) {
              console.log('hiiiiiiiii')
              setCompleteData([...completeData])
              setLoading(false)
            }
          } else {
            completeData[i].id = String(postRes)
            completeData[i].errorMessage = ''
            completeData[i].error = false
            await axios.post('http://localhost:3005/postData', {
              data: completeData[i],
              fileName: fileName,
            })
            if (i === 100) {
              console.log('hiiiiiiiii')
              setCompleteData([...completeData])
              setLoading(false)
            }
          }
        }
      }

      static async postingData(ele) {
        try {
          const body = {
            isActive: 'true',
            tags: 'sm_import_test',
          }
          for (let [element] of Object.entries(selectedFields)) {
            body[`${selectedFields[element]}`] = ele[`${element}`]
          }

          body['isActive'] = 'true'
          body['tags'] = 'sm_import_test'
          body['currency'] = 'INR'

          const res = await axios.post(POST_URL, body, {
            headers: {
              'Content-Type': 'application/json',
              accessToken: '3a2bbb61-aa33-11ea-9762-39ab38becb02',
              'x-linkname': 'test.salesmate.io',
            },
          })
          console.log('456')
          return res.data.Data.id
        } catch (err) {
          console.log('123')
          console.log(err.response.data.Error.Message)
          return JSON.stringify(err.response.data.Error.Message)
        }
      }
    }

    async function start() {
      await AddingProductsToSalesmate.start()
    }
    start()
  }, [])
  console.log(
    completeData,
    '........................................................',
  )

  headerss = []
  for (let [element] of Object.entries(completeData[100])) {
    headerss.push({
      label: `${element[0].toUpperCase()}${element.slice(1)}`,
      key: `${element}`,
    })
  }
  data = [...completeData]
  data.shift()
  console.log(headerss)
  console.log(data)

  return (
    <div>
      {!loading && data.length > 0 && headerss?.length > 0 ? (
        <CSVLink data={data} headers={headerss}>
          Download me
        </CSVLink>
      ) : (
        <h1>converting...</h1>
      )}
    </div>
  )
}

export default ExcelScript
