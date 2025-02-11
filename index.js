const express = require('express');

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    const maxId = persons.length > 0 
    ? Math.max(...persons.map(person => Number(person.id))) 
    : 0;
    return String(maxId + 1);
}


const app = express();
app.use(express.json());

app.get("/", (request, response) => {
    response.send(`
        <p><a href='http://localhost:3001/info'>/info</a></p>
        <p><a href='http://localhost:3001/api'>/api</a></p>`)
});

app.get("/info", (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        <p><a href='http://localhost:3001/'>go back</a></p>`)
});

app.get("/api", (request, response) => {
    response.send(`
        <p><a href='http://localhost:3001/api/persons'>/persons</a></p>
        <p><a href='http://localhost:3001/'>go back</a></p>`)
});

app.get("/api/persons", (request, response) => {
    response.json(persons)
});

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body);

    if (!body.name || !body.number) {
        const missing = [];
        if (!body.name) missing.push("name");
        if (!body.number) missing.push("number");
        return response.status(400).json({ 
        error: `attributes missing: ${missing.join(", ")}` 
      })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
  
    persons = persons.concat(person)
  
    response.json(person)
})
  

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id); 
    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
});



const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}...`);
});

