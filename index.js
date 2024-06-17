require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('postData', (req) => (req.method === 'POST' ? JSON.stringify(req.body) : ''))

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :postData'
  )
)

app.get('/', (req, res) => {
  res.send('<h1>Phonebook</h1>')
})

app.get('/info', (req, res) => {
  const curTime = new Date()
  Person.countDocuments({})
    .then(documentCount => {
      res.send(`
        <html>
          <body>
            <p>Phonebook has info for ${documentCount}</p>
            <p>${curTime}</p>
          </body>
        </html>
      `)
    })
})

app.get('/api/persons', (req, res, next) => {
  Person
    .find({})
    .then(result => {
      res.send(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person
    .findById(req.params.id)
    .then(person => {
      if (person) {
        res.send(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const personToAdd = req.body

  if (!personToAdd.name) {
    return res.status(400).json({ error: 'Person must have a name!' })
  } else if (!personToAdd.number) {
    return res.status(400).json({ error: 'Person must have a number!' })
  }

  const newPerson = new Person ({
    name: personToAdd.name,
    number: personToAdd.number,
  })
  newPerson.validateSync()

  newPerson
    .save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const updatePerson = req.body

  Person.findByIdAndUpdate(req.params.id, updatePerson, { new:true })
    .then(updatedPerson => {
      res.send(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})