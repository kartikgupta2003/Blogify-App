const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const { createHmac, randomBytes } = require("crypto");

router.get("/signin", (req,res)=>{
    return res.render("signin");
});

router.get("/signup" ,(req,res)=>{
    return res.render("signup");
});

router.post("/signin" , async(req,res)=>{
    const {email , password} = req.body;
    // const user= await User.findOne({email});
    // const salt = user.salt;
    // const hashedPassword = user.password;
    // const enteredPassword = createHmac('sha256' , salt).update(password).digest("hex");
    // if(enteredPassword === hashedPassword) res.redirect("/");
    // else res.redirect("/user/signin");

    // well this is how i can apply user login just like i did in url shortner project 
    // but for for modularity, reusability, and separation of concerns , Using Static Method in the Model is advisable 
    // But be assured that i myself tested this method and it worked fine (GOD PROMISE)
    // But this is method follows more industry standards 

    try{
        const token = await User.matchPasswordAndGenerateToken(email , password);
        // console.log("token" , token);
        res.cookie("token" , token);
        return res.redirect("/");
    } catch(error) {
        return res.render("signin" , {error : "Incorrect Email or Password"});
    }
})

router.post("/signup" , async(req,res)=>{
    const {fullName , email , password} = req.body;
    await User.create({
        fullName ,
        email ,
        password,   
    });
    return res.redirect("/");
})

router.get("/logout" , (req , res)=>{
    res.clearCookie("token").redirect("/");
})

module.exports = router ;