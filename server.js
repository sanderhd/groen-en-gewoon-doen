const express = require('express')
const fs = require('fs').promises
const path = require('path')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const ordersFile = path.join(__dirname, 'data', 'orders.json')
const packagesFile = path.join(__dirname, 'data', 'packages.json')

const readOrders = async () => {
  const raw = await fs.readFile(ordersFile, 'utf8')
  return JSON.parse(raw)
}

const writeOrders = async (data) => {
  await fs.writeFile(ordersFile, JSON.stringify(data, null, 2), 'utf8')
}

const readPackages = async () => {
  const raw = await fs.readFile(packagesFile, 'utf8')
  return JSON.parse(raw)
}

const writePackages = async (data) => {
  await fs.writeFile(packagesFile, JSON.stringify(data, null, 2), 'utf8')
}

app.get('/api/packages', async (req, res) => {
  try {
    const data = await readPackages()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read packages.' })
  }
})

app.get('/api/packages/:id', async (req, res) => {
  try {
    const data = await readPackages()
    const id = Number(req.params.id)
    const package = data.packages.find((item) => item.id === id)

    if (!package) {
      return res.status(404).json({ error: 'Package not found.' })
    }

    return res.json(package)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read package.' })
  }
})

app.post('/api/packages', async (req, res) => {
  try {
    const data = await readPackages()
    const payload = req.body || {}
    const nextId = data.packages.length
      ? Math.max(...data.packages.map((item) => item.id)) + 1
      : 1
    const newPackage = {
      id: nextId,
      ...payload,
    }

    data.packages.push(newPackage)
    await writePackages(data)

    return res.status(201).json(newPackage)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create package.' })
  }
})

app.put('/api/packages/:id', async (req, res) => {
  try {
    const data = await readPackages()
    const id = Number(req.params.id)
    const index = data.packages.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Package not found.' })
    }

    const updatedPackage = {
      ...data.packages[index],
      ...req.body,
      id,
    }

    data.packages[index] = updatedPackage
    await writePackages(data)

    return res.json(updatedPackage)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update package.' })
  }
})

app.delete('/api/packages/:id', async (req, res) => {
  try {
    const data = await readPackages()
    const id = Number(req.params.id)
    const index = data.packages.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Package not found.' })
    }

    const [removed] = data.packages.splice(index, 1)
    await writePackages(data)

    return res.json(removed)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete package.' })
  }
})

app.get('/api/orders', async (req, res) => {
  try {
    const data = await readOrders()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read orders.' })
  }
})

app.get('/api/orders/:id', async (req, res) => {
  try {
    const data = await readOrders()
    const id = Number(req.params.id)
    const order = data.orders.find((item) => item.id === id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    return res.json(order)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to read order.' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const data = await readOrders()
    const payload = req.body || {}
    const nextId = data.orders.length
      ? Math.max(...data.orders.map((item) => item.id)) + 1
      : 1
    const newOrder = {
      id: nextId,
      ...payload,
    }

    data.orders.push(newOrder)
    await writeOrders(data)

    return res.status(201).json(newOrder)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create order.' })
  }
})

app.put('/api/orders/:id', async (req, res) => {
  try {
    const data = await readOrders()
    const id = Number(req.params.id)
    const index = data.orders.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    const updatedOrder = {
      ...data.orders[index],
      ...req.body,
      id,
    }

    data.orders[index] = updatedOrder
    await writeOrders(data)

    return res.json(updatedOrder)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order.' })
  }
})

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const data = await readOrders()
    const id = Number(req.params.id)
    const index = data.orders.findIndex((item) => item.id === id)

    if (index === -1) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    const [removed] = data.orders.splice(index, 1)
    await writeOrders(data)

    return res.json(removed)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete order.' })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
