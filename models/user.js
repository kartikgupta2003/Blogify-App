const {Schema , model} = require("mongoose") ;
const { createHmac, randomBytes } = require("crypto");
// this is a built in package , no need to install it just like path 
// it is used to hash our passwords 
const { createTokenForUser , validateToken} = require("../services/authentication.js");


const userSchema = new Schema({
    fullName : {
        type : String,
        required : true,
    } ,
    email : {
        type : String ,
        required : true,
        unique : true,
    } ,
    salt : {
        type : String ,
        // require : true ,
        // it should not be kept required , bcz hum isko input me nhi de rhe hai !
    } ,
    password : {
        type : String ,
        required : true ,
    } ,
    profileImageURL : {
        type : String ,
        default : "/images/default.png"
    } ,
    role : {
        type : String ,
        enum : ["USER" , "ADMIN"],
        // type to string hai but in dono ke alawa hum koi aur value assign 
        // nhi kar skte hai , so isliye inko enum me dal dete hai ! so ab agar 
        // user in dono ke alawa koi aur value dene ka try karega to mongoose will throw an error
        default : "USER",
    }
} , {timestamps : true});



userSchema.pre("save" , function(next){
// This line means: "Before a user document is saved, run this function." This is called a pre-save hook (Mongoose middleware) It runs before user.save() gets executed


    const user = this ;
// this refers to the document being saved (i.e., a single user)


    if(!user.isModified("password")) return next();
// This line checks: "Has the password field changed?" If not, it skips hashing and goes on. This is important to avoid rehashing already-hashed passwords.


    const salt = randomBytes(16).toString();
    // salt is a random string 
//  Generates a random string to use as salt. Salt ensures that even if two users have the same password, their hashes will be different.


    const hashedPassword = createHmac('sha256' , salt).update(user.password).digest("hex");
// This line is doing password hashing using Node.js’s built-in crypto module. HMAC = Hash-based Message Authentication Code It’s like: “Hash this data using an algorithm (like SHA-256) and a secret key (salt in our case)”
//  .update(user.password) Feeds the password into the hasher
// .digest("hex")
// Finalizes the hashing and returns the result as a hex string (i.e., readable format)
// Example output:
// "9f86d081884c7d659a2feaa0c55ad015..."

// Let’s say 2 users both have password "123456"
// Without salt → Same hash stored in DB
// With salt → Both have different hashes!
// So even if attacker sees hash, he can’t guess easily.

    this.salt = salt;
    this.password = hashedPassword;
// It stores: The random salt generated The final hashed password



    next();
});
// It is a Mongoose middleware for password hashing 🔐 before saving a user to the database.


userSchema.static("matchPasswordAndGenerateToken" , async function(email , password){
// This adds a custom static method to the model. Think of static methods like utility functions that act on the model as a whole — not on individual documents.

// why we have used normal function here , instead of arrow function as usual , bcz for normal 
// functions , this refers to here correctly to the model ! But Arrow functions do not have their own this, they inherit this from their surrounding (lexical) scope.

// | Context                   | `this` refers to                                      |
// | ------------------------- | ----------------------------------------------------- |
// | `schema.static(...)`      | The **Model** (e.g., `User`)                          |
// | `schema.methods.someFunc` | The **document** (e.g., an individual user)           |
// | `pre('save')` / `post()`  | The **document** being saved                          |
// | Inside arrow function     | ❌ `this` is **lexically bound**, not the model or doc |




    const user = await this.findOne({email});
// this here refers to the model — i.e., User.  Here we could have also used User.findOne directly 
// but the problem is we haven't created User model yet , it will be created at line 103 so , if we would have used User 
// it would have thrown the error ReferenceError: Cannot access 'User' before initialization


    if(!user) throw new Error("User not found!");

    const salt = user.salt ;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256' , salt).update(password).digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");
    const token = createTokenForUser(user);
    return token;
})


const User = model('user' , userSchema);

module.exports = User ;