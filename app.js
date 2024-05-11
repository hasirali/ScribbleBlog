const express = require('express');
const app = express();
const path = require('path')
const userModel = require('./models/user')
const postModel = require('./models/post')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser'); 
let jwt = require('jsonwebtoken')

app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
})
app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/profile' , isLoggedIn , (req , res)=>{
    console.log(req.user);
    res.render('profile')
})

app.post('/register', async (req, res) => {
    let { email, username, password, age, name } = req.body;
    let user = await userModel.findOne({ email });
    if (user) return res.status(400).send('User already registered');


    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                username,
                email,
                name,
                age,
                password: hash
            });

            let token = jwt.sign({ email: email, userId: user._id }, "secretKey")
            res.cookie("token", token)
            res.send('User registered successfully')
        })
    })
})
app.post('/login' , async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) return res.status(500).send('Something Went Wrong');

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: email, userId: user._id }, "secretKey")
            res.cookie("token", token)
            res.status(200).send("You can Login");
        }
        else res.redirect('/login')
    })

})
app.get('/logout', (req, res) => {
    res.cookie("token", "")
    res.redirect('/login');
})

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") res.redirect('/login')
    else {
        let data = jwt.verify(req.cookies.token, "secretKey")
        req.user = data;
    }
    next();
}

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})