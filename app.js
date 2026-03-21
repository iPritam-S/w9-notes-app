const express = require("express");
const app = express()
const jwt = require("jsonwebtoken")
const path = require("path")
const bcrypt = require("bcrypt")

const { randomUUID } = require("crypto");


// for loading the css


// structures to store data
// let notes = [];
// to change the data structure to store the notes as well as the corresponding user
let NOTES = [
    {
        username: 'kirat',
        note: 'code karooo'
    },
    {
        username: "ipritam",
        note: "Code code"
    }
]


/// users
let USERS = [{
        id: 1,
        name: 'Harkirat',
        username: "kirat",
        password: "1234"
    },
    {
        id: 2,
        name: "Pritam",
        username: "ipritam",
        password: 123
    }
]  
//array of objects {username: username, password: password}



// home page

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/index.html'))
})



app.use(express.json());
app.post("/createnotes", (req, res) => {
    //check if they have sent the right header, extract who the user is
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(404).send({
            message: "you are not logged in!"
        })
    }

    const token = authHeader.split(" ")[1] //actual token

    if (!token || token == "null") {
        return res.status(404).send({
            message: "You are not logged in"
        })
    }


    const decoded = jwt.verify(token, "secretcode");
    const username = decoded.username;

    if (!username) {
        res.status(406).json({
            message: "Malformed token"
        })
        return;
    }



    const note = req.body.note;
    NOTES.push({username, note});

    res.send({
        message: "Done: Note added"
    })

})




// get all notes
app.get("/getnotes", (req, res) => {

    //check the token in headers
    const token = req.headers.token;
    if (!token || token == "null") {
        res.status(404).send({
            message: "you are not logged in!"
        })
        return;
    }

    const decoded = jwt.verify(token, "secretcode");
    const username = decoded.username;

    if (!username) {
        res.status(406).json({
            message: "Malformed token"
        })
        return;
    }

    //filter the note according to the user
    const usernotes = NOTES.filter((note) => note.username === username)
    res.json({
        notes: usernotes
    })
})





app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/signup.html"))
})


app.post("/signup", async (req, res) => {
    // const username = req.body.username;
    // const password = req.body.password;
    // const name = req.body.name

    const { name, username, password } = req.body   //shorthand of the above

    //check username
    const usernameExist = USERS.find(user => user.username === username);

    if (usernameExist) {
        return res.status(409).json({
            message: "User with this username already exists, enter an unique username"
        })
    };
    const passstr = password.toString();
    const hashedPass = await bcrypt.hash(passstr, 10);

    //if it passed add to the users
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
    // const verified = USERS.find(user => user.username === username && user.password === password);

    const verified = await bcrypt.compare(password, userExists.password);

    if (!verified) {
        return res.status(403).json({
            message: "wrong credentials"
        })
    };

    //json web token: for now let's assume this as a encryption (Though it's a wrong statement; jwt does something called digital signature)
    const token = jwt.sign(
        {
            username: userExists.username,
            userID: userExists.id,
            // jti: Date.now()
            jti: randomUUID()
        },
        'secretcode',

        {expiresIn: "1h"}
    )

    res.json({
        token: token,
        name: userExists.name,
        message: "Welcome Back "
    })

    // res.json({
    //     message : "you are in ",
    //     name: verified.name
    // })

    

})

// sign up get back a 200 status code but sign in get back a jwt token



const server = app.listen(3000, () => {
    console.log("Server running on 3000")
});

// console.log(server);



app.use(express.static(path.join(__dirname, "frontend")));