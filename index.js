const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('dist'))

morgan.token('postData', (req, res) => {
    if (req.method !== 'POST') {
        return
    }
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

let persons = [
    {id: 1, name: "Arto Hellas", number: "040-123456"},
    {id: 2, name: "Ada Lovelace", number: "39-44-532523"},
    {id: 3, name: "Dan Abramov", number: "12-43-234345"},
    {id: 4, name: "Mary Poppendick", number: "39-23-6423122"},
]

app.get('/', (req, res) => {
    res.send('<h1>Phonebook</h1>')
})

app.get('/info', (req, res) => {
    const personsLen = persons.length
    curTime = new Date()

    const htmlResponse = `
        <html>
            <body>
                <p>Phonebook has info for ${personsLen}</p>
                <p>${curTime}</p>
            </body>
        </html>
    `

    res.send(htmlResponse)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    
    if (!person) {
        return res.sendStatus(404).end()
    }

    return res.send(person)
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({ error: 'Person must have a name!' });
    } else if (!body.number) {
        return res.status(400).json({ error: 'Person must have a number!' });
    }

    const overlap = persons.find(person => person.name === body.name);
    if (overlap) {
        return res.status(400).json({ error: 'name must be unique' });
    }

    const newId = Math.floor(Math.random() * 1000)
    const newPerson = {
        id: newId,
        name: body.name,
        number: body.number
    }
    
    persons = persons.concat(newPerson)
    res.json(newPerson)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    
    res.status(204).end()
})

const PORT = 3001 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})