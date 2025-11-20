const mongoose=require('mongoose');

const degreeSchema=new mongoose.Schema({
    name:String,
});

module.exports=mongoose.model('Degree',degreeSchema);