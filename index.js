require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const generateId = () => {
    return String(Math.floor(Math.random() * 1000000000000));
}

const checkNameExists = (name) => {
    if (persons.find(person => person.name.toLowerCase() === name.toLowerCase())) {
        return true;
    }
    return false;
} 



const app = express();
app.use(cors());
app.use(express.json());
morgan.token('body', request => JSON.stringify(request.body)) // create custom morgan token for logging body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// add static middleware to hook up the React frontend
app.use(express.static('dist'));

// app.get("/", (request, response) => {
//     const baseUrl = request.protocol + "://" + request.get("host");

//     response.send(`
//         <p><a href='${baseUrl}/info'>/info</a></p>
//         <p><a href='${baseUrl}/api'>/api</a></p>`)
// });

app.get("/info", (request, response) => {
    const baseUrl = request.protocol + "://" + request.get("host");

    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        <p><a href='${baseUrl}/'>go back</a></p>`)
});

app.get("/api", (request, response) => {
    const baseUrl = request.protocol + "://" + request.get("host");

    response.send(`
        <p><a href='${baseUrl}/api/persons'>/persons</a></p>
        <p><a href='${baseUrl}/'>go back</a></p>`)
});

app.get("/api/persons", (request, response) => {
    
    Person.find({}).then(persons => {
        console.log("retrieved phonebook from database:")
        persons.forEach(p => {
            console.log(`${p.name} ${p.number}`);
        });
        // mongoose.connection.close();
        response.json(persons)
    });
});

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body);

    if (!body.name || !body.number) {
        const missing = [];
        if (!body.name) missing.push("name");
        if (!body.number) missing.push("number");
        console.log(`Error in POST, attributes missing: ${missing.join(", ")}`);
        return response.status(400).json({ 
        error: `attributes missing: ${missing.join(", ")}` 
      })
    }

    if (checkNameExists(body.name)) {
        console.log(`Error in POST, ${body.name} already exists in phonebook`);
        return response.status(400).json({ 
        error: `${body.name} already exists in phonebook` 
        })
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
  
    persons = persons.concat(person)
    response.json(person)
    console.log(`Added ${person.name}`)
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
    console.log(`Delete id ${id}`)
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}...`);
});

