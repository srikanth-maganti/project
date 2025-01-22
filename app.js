const express=require("express");
const app=express();
const ejsmate=require("ejs-mate");
const path=require("path");
const book=require("./models/book.js");
const cart=require("./models/cart.js");
const mongoose=require("mongoose");
const methodoverride=require("method-override");
const ExpressError=require("./views/utils/ExpressError.js");
const asyncWrap=require("./views/utils/asyncWrap.js");
const bookschema=require("./schema.js");



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



app.engine("ejs",ejsmate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodoverride('_method'));


function validatebook(req,res,next)
{
    let {error}=bookschema.validate(req.body);
    if(error)
    {
        let msg=error.details.map(el=>el.message).join(",");
        throw new ExpressError(400,msg);
    }
    else
    {
        next();
    }
}

//home page
app.get("/",asyncWrap(async (req,res)=>{
    let data=await book.find({});
    res.render("./pages/home.ejs",{data});
}))


//books 
app.get("/books",asyncWrap(async(req,res)=>{

    let {category}=req.query;
    
    let data= null;
    if(category=="All")
    {
       data=await book.find({});
    }
    else
    {
        data=await book.find({Category:category});
    }
    if(!data)
    {
        throw new ExpressError(400,"Data Not Found");
    }
    
    res.render("./pages/books.ejs",{data});
}))

app.get("/books/show/:id",asyncWrap(async(req,res)=>{
    let {id}=req.params;
    let [data]=await book.find({_id:id});
    
    if(!data)
    {
        throw new ExpressError(400,"Book Not Found");
    }
    res.render("./pages/show.ejs",{data});
}))




app.post("/books/search",asyncWrap(async(req,res)=>{

    let x=req.body.search;
    
    let data=await book.find({$or :[{Title:{ $regex: `^${x}$`, $options: "i" }},{Category:{ $regex: `^${x}$`, $options: "i" }},{Author:{ $regex: `^${x}$`, $options: "i" }}]});
    if(!data)
    {
        throw new ExpressError(400,"Book Not Found");
    }
    res.render("./pages/books.ejs",{data});
}))


app.post('/books',validatebook,asyncWrap(async(req,res)=>{
    let newbook=new book(req.body.book);
    newbook.save();
    res.redirect("/books");
}))


app.get("/seller",(req,res)=>{
    res.render("./pages/registration.ejs");
})

app.post("/seller",(req,res)=>{
    console.log(req.body);
    res.render("./pages/sell.ejs");

})
app.get("/payment",(req,res)=>{
    res.render("./pages/payment.ejs");
})

//cart
app.get("/cart",asyncWrap(async(req,res)=>{
    let data=await cart.find({});
    res.render("./pages/cart.ejs",{data});
}))

app.post("/cart/:id", asyncWrap(async (req, res) => {
    
        const { id } = req.params;
        const bookData = await book.findById(id);

        if (!bookData) {
            return res.status(404).send("Book not found");
        }

        const cartItem = await cart.findById(id);

        if (!cartItem) {
            const newCartItem = { ...bookData.toObject(), Count: 1 };
           
            await cart.insertMany([newCartItem]);
            console.log(`Added new book with id: ${id} to cart`);
        } else {
            const updatedCount = cartItem.Count + 1;
            await cart.findByIdAndUpdate(id, { Count: updatedCount });
            
        }

        res.redirect(`/books/show/${id}`);
    
}))

app.patch("/cart/:id",asyncWrap(async(req,res)=>{
    let {id}=req.params;
    

    let count=req.body.count;
    
    await cart.findByIdAndUpdate(id,{Count:count});
    res.redirect("/cart");
}))

app.delete("/cart/:id",asyncWrap(async(req,res)=>{
    let {id}=req.params;
    await cart.findByIdAndDelete(id);
    res.redirect("/cart");
}))







//Error handling
app.all("*",(req,res,next)=>{
    next( new ExpressError(400,"Page not found")) ;
})


 
app.use((err,req,res,next)=>{
   
    if(err.name=="ValidationError")
    {   console.log(err);
        err.message="Validataion Error";
    }
    if(err.name=="CastError")
    {
        err.message=" Invalid Book Id";
    }
    next(err);
})
app.use((err,req,res,next)=>{
    
    let{status=500,message="Page not found"}=err;
    
    res.status(status).render("./pages/error.ejs",{message});
})

app.listen(3000,()=>{
    console.log("server started listening to port 3000");
})