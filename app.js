const express = require("express");
const app = express()
const jwt = require("jsonwebtoken")
const path = require("path")
const bcrypt = require("bcrypt")

const { randomUUID } = require("crypto");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const { authMiddleware } = require("./middleware");


let NOTES = []; //array of objects {username: username, note: note}


/// users
let USERS = []; //array of objects {id: id, name: name, username: username, password: password}




// home page

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/index.html'))
})



app.use(express.json());
//authenticated create note

app.post("/createnotes", authMiddleware, (req, res) => {


    const username = req.username;

    const note = req.body.note;
    NOTES.push({username, note});

    res.send({
        message: "Done: Note added"
    })

})




// get all notes authenticated
app.get("/getnotes", authMiddleware, (req, res) => {

    const username = req.username;

    const usernotes = NOTES.filter((note) => note.username === username)
    res.json({
        notes: usernotes
    })
})





app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/signup.html"))
})


app.post("/signup", async (req, res) => {
    

    const { name, username, password } = req.body   

    //check username
    const usernameExist = USERS.find(user => user.username === username);

    if (usernameExist) {
        return res.status(409).json({
            message: "User with this username already exists, enter an unique username"
        })
    };
    const passstr = password.toString();
    const hashedPass = await bcrypt.hash(passstr, 10);


    USERS.push({
        id: USERS.length +1,
        name: name,
        username: username,
        password: hashedPass
    });

    res.json({
        message: "Account created successfully. Taking you to the login page."
    })
});

app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/signin.html"))
})


//signin
app.post("/signin", async function (req, res) {
    const username = req.body.username;
    let password = req.body.password;
    password = password.toString();

    const userExists = USERS.find((user) => user.username === username);
    if (!userExists) {
        return res.status(402).json({
            message: "User not found"
        })
    }

    //check credentials

    const verified = await bcrypt.compare(password, userExists.password);

    if (!verified) {
        return res.status(403).json({
            message: "wrong credentials"
        })
    };


    const token = jwt.sign(
        {
            username: userExists.username,
            userID: userExists.id,
            // jti: Date.now()
            jti: randomUUID()
        },
        JWT_SECRET,

        {expiresIn: "1h"}
    )

    res.json({
        token: token,
        name: userExists.name,
        message: "Welcome Back "
    })

    

})




const server = app.listen(3000, () => {
    console.log("Server running on 3000")
});

//css
app.use(express.static(path.join(__dirname, "frontend")));