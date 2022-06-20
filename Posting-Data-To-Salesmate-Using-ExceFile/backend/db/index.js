const sqlLite3 = require('sqlite3').verbose()
const db = new sqlLite3.Database(
  './test.db',
  sqlLite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message)
    }
    console.log('Connected to the database.')
  },
)
db.run(`CREATE TABLE IF NOT EXISTS jsonData (data TEXT)`)

module.exports = {
  db,
}
