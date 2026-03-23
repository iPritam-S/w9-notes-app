const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
function authMiddleware(req, res, next) {
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


    const decoded = jwt.verify(token, JWT_SECRET); //verify the token
    const username = decoded.username;

    if (!username) {
        res.status(406).json({
            message: "Malformed token"
        })
        return;
    }

    req.username = username;    //we have to pass the username to the next middleware or the route handler
    next();
}

module.exports = {
    authMiddleware
};