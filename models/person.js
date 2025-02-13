const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

console.log("connecting to ", url);
mongoose.connect(url).then(result => {
    console.log("connected to MongoDB")    
}).catch(error => {
    console.log("error connecting to MongoDB: ", error.message);
}); 

// custom validator for phone number
const phoneValidator = (val) => {
    const parts = val.split("-");
    // check for no hyphen or more than 1 hyphen
    if (parts.length !== 2) {
        return false; 
    }
    // pattern to check if both parts contains only numeric chars
    const regex = /^\d+$/;
    if (!regex.test(parts[0]) || !regex.test(parts[1])) {
        return false;
    }
    // check first part contains 2 or 3 numbers
    if(parts[0].length < 2 || parts[0].length > 3) {
        return false;
    }
    return true;
}

const personSchema = new mongoose.Schema({
    name: { 
        type: String, 
        minLength: 3, 
        required: [true, "name required"] 
    },
    number: { 
        type: String,  
        minLength: 8, 
        validate: {
            validator: phoneValidator,
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, "number required"] 
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
      }
});

module.exports = mongoose.model('Person', personSchema);