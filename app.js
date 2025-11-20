const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const Degree = require('./model/Degree');
const Developer = require('./model/Developer');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage
});

app.use(session({
    secret: "eeee2134",
    resave: false,
    saveUninitialized: true
}));

mongoose.connect("mongodb://localhost:27017/before_exam_external_practice")
    .then(() => console.log("DB connected"))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', async (req, res) => {
    const degrees = await Degree.find();
    res.render("register", {
        degrees
    });
});

app.post('/register', upload.array('image'), async (req, res) => {

    const imageFiles = req.files.map(file => file.filename);
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const selectedDegreeNames = Array.isArray(req.body.degrees) ?
        req.body.degrees : [req.body.degrees];

    const selectedDegrees = await Degree.find({
        name: {
            $in: selectedDegreeNames
        }
    });

    const degreeIds = selectedDegrees.map(d => d._id);

    const newDeveloper = new Developer({
        name: req.body.name,
        email: req.body.email,
        password: hashedpassword,
        dob: req.body.dob,
        city: req.body.city,
        image: imageFiles,
        degrees: degreeIds
    });

    await newDeveloper.save();
    res.redirect('/login');
});

app.get('/home', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const user = await Developer.findById(req.session.userId).populate('degrees');
    res.json(user);
    //  res.render('home',{user});
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {

    const user = await Developer.findOne({
        email: req.body.email
    });

    if (!user) {
        res.status(400).json("Invalid email or password");
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
        res.status(400).json("Invalid email or password");
    }

    req.session.userId = user._id;
    return res.redirect('/home');
});

//advanced search
app.get('/developersearch', async (req, res) => {
    const keyword = String(req.query.name || "");

    const result = await Developer.find({
        name: {
            $regex: keyword,
            $options: 'i'
        }
    });

    res.render('search', {
        result
    });
});

//basic search
// app.get("/search", async (req, res) => {
//     const name = req.query.name;
//     const result = await Developer.findOne({ name });

//     res.render("search", { result });
// });

app.get('/developer/delete/:id', async (req, res) => {
    await Developer.findByIdAndDelete(req.params.id);
    res.redirect('/home');
});

// app.get('/movie/delete/:id', async (req, res) => {
//     await Movie.findByIdAndDelete(req.params.id);
//     res.redirect('/home');
// });

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => console.log("Server started on port http://localhost:3000"));