// TODO: Change the connect.session() memory store.

//import all external packages*****************************
const   express = require("express"), app = express(),
        hbs = require("express-handlebars"),
        mongoose = require("mongoose"),
        session = require("express-session"),
        cookieParser = require("cookie-parser"),
        bodyParser = require("body-parser"),
        flash = require("connect-flash"),
        shortId = require("shortid"),
        nodemailer = require('nodemailer'),
        cloudinary = require("cloudinary"),
        passport = require("passport"),
        LocalStrategy = require("passport-local").Strategy;

//import all local packages*********************************
const   route = require("./routes/route.js");
        passportConfig = require("./config/passport.js"),
        configs = require("./config/config.js");

//connect to the database************************************
mongoose.connect(configs.production.dbLocation)
        .connection.on("connected", ()=>console.log("Server connected to mongoDB through mongoose ODM"));

cloudinary.config({ 
    cloud_name: "hills", 
    api_key: "575243781761468", 
    api_secret: "WTJei9ruKurMzQAyGB-ngWU_kkc" 
});

/* //variable declarations*************************************
let allowAJAX = configs.allowAJAX,
    err_404 = configs.err_404,
    err_500 = configs.err_500; */

//set enviromental details**********************************
app .set("views", `${__dirname}/views`)
    .set("port", process.env.PORT || 2020);

//express middleware declaration****************************
app .use(express.static(`${__dirname}/public`))
    .use(cookieParser())
    .use(bodyParser.urlencoded({extended: true}))
    .use(session({
        secret: "#itDoesNotConcernYouFriend",
        resave: false,
        saveUninitialized: false
    }))
    .use(flash())
    .use(passport.initialize())
    .use(passport.session());

//template engine specifications*****************************
let hbsLayout = {
    defaultLayout : "common",
    partialDir : `${app.get("views")}/partials`
};

app .engine("handlebars", hbs.create(hbsLayout).engine)
    .set("view engine", "handlebars");

//passport strategy configurations***************************
passportConfig(passport, LocalStrategy, nodemailer);

//about all routes*******************************************
route(express, app, passport, cloudinary);

/* //CORS origin allowance**************************************
app.use(allowAJAX); */

/* //error handlers*********************************************
app .use(err_404)
    .use(err_500); */

//server fired up********************************************
app.listen(app.get("port"), ()=>console.log(`Server listening on IP: 127.0.0.1 \+ PORT: ${app.get("port")}`));