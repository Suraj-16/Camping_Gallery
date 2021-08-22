if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

console.log(process.env.secreat);

const { applyEachSeries } = require('async');
const express = require('express');
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const ExpressSession = require('express-session'); 
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
//const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const userRoutes = require('./routes/users');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
//const MongoDBStore = require('connect-mongo')(ExpressSession);

mongoose.connect(dbUrl,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true,
    useFindAndModify : false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"Connection Error : "));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended : true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// const store = new MongoDBStore({
//     url: dbUrl,
//     secret : 'thisshouldbebetter',
//     touchAfter: 24 * 60 * 60
//  });

// store.on("error", function(e){
//     console.log("Session store error", e);
// });

const sessionConfig = {
    //store,
    secret : 'thisshouldbebetter',
    resave : false,
    saveUninitialized : true,
    cookie: {
        httpOnly : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 *7,
        maxAge : 1000 * 60 * 60 * 24 *7
    }
}
app.use(ExpressSession(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'coult@gmail.com', username: 'coult'})
    const newUser = await(User.register(user, 'chicken'));
    res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req,res) => {
    res.render("home");
});



app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found !!", 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "oh No, Something went Wrong!!";

    res.status(statusCode).render("error", {err});
});

app.listen(3000, () => {
    console.log("Server running at port 3000");
});