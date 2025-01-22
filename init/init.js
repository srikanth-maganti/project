const mongoose=require("mongoose");
const initdata=require("./data.js");
const book=require("../models/book.js");


async function main()
{
    await mongoose.connect('mongodb://127.0.0.1:27017/bookbay');
}

main()
.then(()=>{
    console.log("connected to database");
})
.catch((err)=>{
    console.log(err);
})

async function insertdb()
{
    await book.deleteMany({});
    await book.insertMany(initdata);

}

insertdb().then(()=>{
    console.log("inserted");
})
.catch((Err)=>{
    console.log(Err);
})