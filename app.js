require('dotenv').config();
const express = require("express");
const path= require("path");
const mongoose = require("mongoose");
const userRoute = require("./routes/user.js");
const blogRoute = require("./routes/blog.js");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication.js");
const Blog = require("./models/blog.js");


const app = express();
const PORT = process.env.PORT || 8000;
// this time hum is project ko real world project 
// rakhne wale hai so it will be deployed 
// so hum port number choose nhi kar skte hai , bcz jha hum jis cloud pe is project ko deploy kar rhe hai zaroori nhi wha pe port 8000 khali ho , bcz  uspe aur applications run kar rhi hongi
// so we will be using environment variables which are dynamic and provided by the cloud 

// mongoose.connect("mongodb://localhost:27017/blogify").then(e=> console.log("MongoDb connected"));
// blogify specifies the name of our database , There is no local MongoDB running at localhost:27017 , when project is deployed 
mongoose.connect(process.env.MONGO_URL).then((e)=> console.log("MongoDB Connected"));




app.set("view engine" , "ejs");
app.set("views" , path.resolve("./views"));
// makes sure the path is absolute (required by Express), not relative. So even if your working directory changes, this will still point correctly to your public folder.


app.use(express.json());
app.use(express.urlencoded({ extended : false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));
// middleware jo express ko bata rha hai public folder ke andar jo bhi hai usko statically serve kardo , Any file inside the ./public folder becomes publicly accessible via the URL path.
// 💡 Why do we usually store uploaded images in a public folder?
// Because images uploaded by users are meant to be viewable in the frontend, and storing them in the public folder allows them to be:

// ✅ Directly accessible by the browser through a URL.

// Why not store it somewhere else?
// If you store it in some private folder (like ./uploads or ./private-files), the browser can’t access it directly unless:

// You write a custom route like /getImage/:filename that reads and sends the file manually.

app.get('/' , async(req,res)=>{
    const allBlogs = await Blog.find({});
    res.render("home" , {
        user : req.user,
        blogs : allBlogs,
    });
});

app.use("/user" , userRoute);
app.use("/blog" , blogRoute);

app.listen(PORT , ()=> console.log(`Server started at PORT : ${PORT}`));