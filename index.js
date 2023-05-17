const express = require('express')
const app = express()
var cors = require('cors')
const port = 5000
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Khela ghor Server is Running...')
  })

app.listen(port, () => {
    console.log(`Khela ghor Server Running on PORT:  ${port}`)
  })