//import all external packages************************************
const   mongoose = require('mongoose'),
        shortId = require("shortid");

//import all local packages***************************************
const   Schema = require("../model/schema.js"),
        config = require("./config.js")

//variable declaration********************************************
let User = Schema.User;

module.exports = (passport, LocalStrategy, nodemailer)=>{

    //passport serialization for sessions*************************
    passport.serializeUser((user, done)=>done(null, user.id));
    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            done(err, user);
        });
    });

    //passport auth handling register*****************************
    passport.use("local-register", new LocalStrategy({
        passReqToCallback   : true,
        usernameField       : "regUsername",
        passwordField       : "regPassword"
    },
    (req, regUsername, regPassword, done)=>{
        if(req.body.regPassword !== req.body.regPassword2){
            return done(null, false,
            req.flash("error", "Password does not match"));
        }else{
            User.findOne({email: req.body.regEmail}, (err, user)=>{
                if(err){
                    return done(err); 
                }else if(user){
                    return done(null, false,
                    req.flash("error", "The imputed email already existed"))
                }else{
                    User.findOne({username: regUsername}, (err, user)=>{
                        if(err){
                            return done(err); 
                        }else{
                            if(user){
                                return done(null, false,
                                req.flash("error", "The imputed username already existed"))
                            }else{
                                let newUser = new User(),
                                    userId = shortId.generate(),
                                    eVerCode = shortId.generate();

                                newUser.username  = regUsername;
                                newUser.email = req.body.regEmail.toLowerCase();
                                newUser.password = req.body.regPassword;
                                newUser.userId = userId;
                                newUser.eVerCode = eVerCode;
                                newUser.eVerified = false;

                                newUser.save((err)=>{
                                    if(err){
                                        if(err.code === 11000){
                                            req.flash("error", "User already existed")
                                        }
                                        else console.log(err);
                                    }else{
                                        let transporter = nodemailer.createTransport({
                                            service: 'Gmail',
                                            auth: {
                                                user: 'tobishills12@gmail.com',
                                                pass: 'Catholic 1234'
                                            }
                                        });
        
                                        let html = `<h1>The Verification Mail</h1>\n
                                                    <p>Please find the the link below to verify your registration</p>
                                                    <h1><a href="http://travcutt.herokuapp.com/verify/${eVerCode}">the link</a></h1>`;
        
                                        let mailOptions = {
                                            from: 'tobishills12@gmail.com',
                                            to: req.body.regEmail,
                                            subject: "Travcut Travel Bank",
                                            html: html
                                        };
        
                                        transporter.sendMail(mailOptions, (error, info)=>{
                                            if(error){
                                                console.log(error);
                                            }else{
                                                console.log('Message sent to ' +req.body.regEmail + " " + info.response);
                                                return done(null, newUser);
                                            };
                                        });
                                    }
                                });
                            }
                        }
                    })
                }
            });
        }
    }));

    //passport auth handling login*****************************
    passport.use("local-login", new LocalStrategy({
        passReqToCallback   : true,
        usernameField       : "logUserName",
        passwordField       : "logPassword" 
    },
    (req, logUserName, logPassword, done)=>{
        User.findOne({username: logUserName}, (err, user)=>{
            if(err){
                return done(err);
            }else if(!user){
                return done(null, false,
                req.flash("error", "User not found!"));
            }else{
                if(user.password !== logPassword){
                    return done(null, false,
                    req.flash("error", "Invalid Password!"));
                }
                else if(user.eVerified == false){
                    return done(null, user,
                    req.flash("error", "Please verify your email before login"));
                }else{
                    return done(null, user);
                }
            }
        });
    }));
}