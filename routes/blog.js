const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const path = require("path");
const Blog = require("../models/blog.js");
const Comment = require("../models/comment.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
// you can write the destination directly as a string But using the path module — especially path.resolve() or path.join() — is considered a best practice for a few reasons:
// Avoid platform-specific path issues
// Different operating systems use different path separators:

// Windows: \

// Linux/macOS: /

// So: "./public/uploads" might behave differently on different systems or throw errors in edge cases. Using: path.resolve("./public/uploads") automatically handles that by returning an absolute, cross-platform-safe path.
// Ensures absolute path (not relative) Some modules (like multer) behave more predictably when given absolute paths — especially when the working directory isn't guaranteed (e.g., in deployments or nested folders). path.resolve("./public/uploads") // gives absolute path like C:\Users\Kartik\app\public\uploads
  
},
  filename: function (req, file, cb) {
    const fileName= `${Date.now()}-${file.originalname}`;
    // original name of the file like photo.png 
    cb(null , fileName);
  }
})

const upload = multer({ storage: storage })

router.get("/add-new" , (req , res)=>{
    return res.render("addBlog.ejs" , {
        user : req.user,
    });
})

router.post("/comment/:blogId" , async(req,res)=>{
    await Comment.create({
    content : req.body.content ,
    blogId : req.params.blogId ,
    createdBy : req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})

router.get("/:id" , async(req,res)=>{
  // Whatever name you put after : in your route path, that becomes the key inside req.params.
  const blog = await Blog.findById(req.params.id).populate('createdBy');
  // Take the createdBy field (which is likely a reference like ObjectId pointing to a User), And replace it with the actual User document it refers to — but only in the returned result, not in the database.
  // console.log(blog);
  const comments = await Comment.find({ blogId : req.params.id}).populate("createdBy");
  console.log("comments" , comments);
  return res.render("blog" , {
    user : req.user ,
    blog : blog ,
    comments ,
  });
})

router.post("/" , upload.single("coverImage") , async(req,res)=>{
  // This line tells Multer to: ✅ Expect a single file upload from a form field named "coverImage".
    // console.log(req.body);
    // console.log(req.file);
    const {title , body } = req.body;
    const blog = await Blog.create({
        title ,
        body ,
        createdBy : req.user._id ,
        coverImageURL : `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
})


module.exports = router ;