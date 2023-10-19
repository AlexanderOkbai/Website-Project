const db2=require('mongoose');


db2.connect('mongodb://localhost:27017/demo');


module.exports=db2;