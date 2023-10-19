
const db2 = require('../db2');

const userformSchema=new db2.Schema({
   
    title: {
        type:String,
        require:true
    },
    description: {
        type:String,
    
    }

})

const model = db2.model('userform',userformSchema);
module.exports = model;

