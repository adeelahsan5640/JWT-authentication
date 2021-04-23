const express = require("express")
const app = express()
const mongoose = require("mongoose")
const User = require('./models/users')
var bodyParser = require("body-parser")
var jsonParser = bodyParser.json();
var crypto = require("crypto");
var key = "password";
var algo = 'aes256';
const jwt = require('jsonwebtoken')
const { json } = require("body-parser")
jwtKey = "jwt"
mongoose.connect('mongodb+srv://avenger:7f7L9hBrLJfyoWB3@cluster0.dihxr.mongodb.net/useracc?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.warn("connected")
})
app.post('/register', jsonParser, function (req, res) {
    var cipher = crypto.createCipher(algo, key);
    var encrypted = cipher.update(req.body.password, 'utf-8', 'hex')
        + cipher.final('hex');
    console.warn(encrypted)
    const data = new User({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        password: encrypted
    })
    data.save().then((result) => {
        jwt.sign({ result }, jwtKey, { expiresIn: '300s' }, (err, token) => {
            res.status(201).json({ token })
        })
    })
        .catch((err) => console.warn(err))
})
app.post('/login', jsonParser, function (req, res) {
    User.findOne({ email: req.body.email }).then((data) => {
        var decipher = crypto.createDecipher(algo, key);
        var decrypted = decipher.update(data.password, 'hex', 'utf-8') + decipher.final('utf-8');
        if (decrypted == req.body.password) {
            jwt.sign({ data }, jwtKey, { expiresIn: '300s' }, (err, token) => {
                res.status(200).json({ token })
            })
        }
        // console.warn("decrypted",decrypted);
        //res.json(data)
    })
})
app.listen(5000)