const mongoose=require('mongoose');

const developerSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    dob:String,
    city:String,
    image:[String],
    degrees:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Degree'
    }]
});

module.exports=mongoose.model('Developer',developerSchema);