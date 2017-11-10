//import all external packages************************************
const   mongoose = require('mongoose'),
        shortId = require("shortid");

//import all local packages***************************************
const   Schema = require("../model/schema.js"),
        config = require("./config.js")

//variable declaration********************************************
let User = Schema.User,
    Admin = Schema.Admin;

module.exports = (passport, LocalStrategy, adminPassport, adminLocalStrategy, nodemailer)=>{

    //passport serialization for sessions*************************
    adminPassport.serializeUser((admin, done)=>{
        done(null, admin.id)
    });

    passport.serializeUser((user, done)=>{
        done(null, user.id)
    });

    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            if(err)done(err)
            else if(user){
                done(err, user);
            }else if(!user){
                Admin.findById(id, (err, admin)=>{
                    done(err, admin);
                });
            }
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
                                        // let transporter = nodemailer.createTransport({
                                        //     service: 'outlook',
                                        //     auth: {
                                        //         user: 'travcut12@outlook.com',
                                        //         pass: 'Catholic12'
                                        //     }
                                        // });
        
                                        // let html = `<h1>The Verification Mail</h1>\n
                                        //             <p>Please find the the link below to verify your registration</p>
                                        //             <h1><a href="http://travcutt.herokuapp.com/verify/${eVerCode}">the link</a></h1>`;
        
                                        // let mailOptions = {
                                        //     from: 'travcut12@outlook.com',
                                        //     to: req.body.regEmail,
                                        //     subject: "Travcut Travel Bank",
                                        //     html: html
                                        // };
        
                                        // transporter.sendMail(mailOptions, (error, info)=>{
                                        //     if(error){
                                        //         console.log(error);
                                        //     }else{
                                        //         console.log('Message sent to ' +req.body.regEmail + " " + info.response);
                                        //         return done(null, newUser);
                                        //     };
                                        // });
                                        return done(null, newUser);
                                    }
                                });
                            }
                        }
                    })
                }
            });
        }
    }));

    adminPassport.use("local-register-admin", new adminLocalStrategy({
        passReqToCallback   : true,
        usernameField       : "adminUsername",
        passwordField       : "adminPassword"
    },
    (req, adminUsername, adminPassword, done)=>{
        if(req.body.adminPassword !== req.body.adminPassword2){
            return done(null, false,
            req.flash("adminError", "Password does not match"));
        }else{
            Admin.findOne({username: adminUsername}, (err, admin)=>{
                if(err){
                    return done(err); 
                }else{
                    if(admin){
                        return done(null, false,
                        req.flash("adminError", "The Admin username already existed"))
                    }else{
                        let newAdmin = new Admin();

                        newAdmin.username  = adminUsername;
                        newAdmin.password = req.body.adminPassword;

                        newAdmin.save((err)=>{
                            if(err){
                                console.log(err);
                            }else{
                                return done(null, newAdmin);
                            }
                        });
                    }
                }
            })
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

    adminPassport.use("local-login-admin", new adminLocalStrategy({
        passReqToCallback   : true,
        usernameField       : "adminUserName",
        passwordField       : "adminPassword" 
    },
    (req, adminUserName, adminPassword, done)=>{
        Admin.findOne({username: adminUserName}, (err, admin)=>{
            if(err){
                return done(err);
            }else if(!admin){
                return done(null, false,
                req.flash("adminError", "Admin not found!"));
            }else{
                if(admin.password !== adminPassword){
                    return done(null, false,
                    req.flash("adminError", "Invalid Password!"));
                }else{
                    return done(null, admin);
                }
            }
        });
    }));
}