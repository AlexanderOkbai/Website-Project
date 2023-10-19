const { string } = require('joi');
const db = require('../db');

const userSchema = new db.Schema({
  firstname : String,
  lastname : String,
  email : String,
  password: String,
  phonenumber:String,
  photo: {
    "type": "string",
    "description": "The user's photo."
  },

  role: {
    type: String,
    enum: ['user','admin'],
    default: 'user'
  },

});


const model = db.model('user',userSchema);

module.exports = model;


