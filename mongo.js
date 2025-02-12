const mongoose = require('mongoose');

if (process.argv.length<3) {
    console.log("Give <password> <name> <number> as arguments");
    process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://tanzids:${password}@cluster0.qqfdl.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema);

// add new person to db


const person = new Person({
    name,
    number
});


if (name && number) {
    person.save().then(result => {
        console.log(`Added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    });    

} else {

    // query db to get all persons
    search_filters = {} // no filters, gets all persons
    
    Person.find(search_filters).then(result => {
        console.log("phonebook:")
        result.forEach(p => {
            console.log(`${p.name} ${p.number}`);
        });
        mongoose.connection.close();
    });
}























