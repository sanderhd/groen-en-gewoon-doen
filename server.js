const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const orders = __dirname + '/data/orders.json'

app.get('/orders', (req, res) => {
  res.sendFile(orders)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
