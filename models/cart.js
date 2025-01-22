const mongoose= require("mongoose")

const cartSchema= new mongoose.Schema({
   
        Title:String,
        Author:String,
        Image:String,
        Price:Number,
        Category:String,
        Count:Number,

});

const cart=mongoose.model("cart",cartSchema);
module.exports=cart;