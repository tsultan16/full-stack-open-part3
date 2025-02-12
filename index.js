require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

// const generateId = () => {
//     return String(Math.floor(Math.random() * 1000000000000));
// }

// const checkNameExists = (name) => {
//     if (persons.find(person => person.name.toLowerCase() === name.toLowerCase())) {
//         return true;
//     }
//     return false;
// } 

const app = express();

app.use(express.static('dist')); // add static middleware to hook up the React frontend
app.use(express.json());
app.use(cors());
morgan.token('body', request => JSON.stringify(request.body)) // create custom morgan token for logging body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


// app.get("/", (request, response) => {
//     const baseUrl = request.protocol + "://" + request.get("host");

//     response.send(`
//         <p><a href='${baseUrl}/info'>/info</a></p>
//         <p><a href='${baseUrl}/api'>/api</a></p>`)
// });

app.get("/info", (request, response) => {
    const baseUrl = request.protocol + "://" + request.get("host");

    Person.countDocuments({})
    .then(count => {
            response.send(`
                <p>Phonebook has info for ${count} people</p>
                <p>${new Date()}</p>
                <p><a href='${baseUrl}/'>go back</a></p>`);
    })
    .catch(error => next(error));
});

app.get("/api", (request, response) => {
    const baseUrl = request.protocol + "://" + request.get("host");

    response.send(`
        <p><a href='${baseUrl}/api/persons'>/persons</a></p>
        <p><a href='${baseUrl}/'>go back</a></p>`)
});

app.get("/api/persons", (request, response, next) => {
    
    Person.find({})
    .then(persons => {
        console.log("retrieved phonebook from database:")
        persons.forEach(p => {
            console.log(`${p.name} ${p.number}`);
        });
        // mongoose.connection.close();
        response.json(persons)
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
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
    
    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save()
    .then(savedPerson => {
        console.log(`Added ${savedPerson.name} number ${savedPerson.number} to phonebook`);
        response.json(savedPerson)
    })
    .catch(error => next(error));    
})
  

app.get("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    
    Person.findById(id)
    .then(person => {
        if (person) {
            response.json(person);
        } else {
            response.status(404).end();
        }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    
    Person.findByIdAndDelete(id)
    .then(result => {
        response.status(204).end();
        console.log(`Delete id ${id}`)
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedPerson => {
        console.log(`Updated ${updatedPerson.name} number ${updatedPerson.number}`);
        response.json(updatedPerson)
    })
    .catch(error => next(error));    
})



const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint);


const errorHandler = (error, request, response, next) => {
    console.error(error.message);
    if (error.name === "CastError") {
        response.status(400).send({ error: 'malformed id' });
    }
    next(error)
}

app.use(errorHandler);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}...`);
});

