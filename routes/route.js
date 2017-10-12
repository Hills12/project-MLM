const   shortId = require("shortid"),
        formidable = require("formidable"),
        path = require('path'),
        Schema = require("../model/schema.js"),
        config = require("../config/config.js"),
        routeParams = require("./routeParams.js"),
        middleware = require("../config/middlewares.js");

const   User = Schema.User,
        Finance = Schema.Finance,
        DirectRef = Schema.DirectRef,
        PassiveRef = Schema.PassiveRef;

let isLoggedIn = middleware.isLoggedIn,
    userParam = middleware.userParam,
    financeParams = middleware.financeParams,
    Ref = middleware.Ref,
    dRef = middleware.dRef,
    pRef = middleware.pRef,
    myRefName = middleware.myRefName,
    getPassiveRefNum = middleware.getPassiveRefNum,
    getPaidPassRef = middleware.getPaidPassRef;
    financeParams2 = middleware.financeParams2;
    dRefPassL1 = middleware.dRefPassL1;
    pRefPassL1 = middleware.pRefPassL1;
    GetPay = middleware.GetPay;

module.exports = (express, app, passport, cloudinary)=>{
    const   router = express.Router();

// The Landing Page
    router.route("/").get((req, res)=>{
        res.sendFile('./public/index.html');
    });

// registration route handled by passportJs*************************************************
    router.route("/register")
        .get(routeParams.register)
        .post(passport.authenticate("local-register", {
            successRedirect : "/verifyme",
            failureRedirect : "/register",
            failureFlash    : true
        }));

// login route handled by passportJs*********************************************************
    router.route("/login")
	    .get(routeParams.login)
	    .post(passport.authenticate("local-login", {
            successRedirect : "/verifyme",
    	    failureRedirect : "/login",
    	    failureFlash    : true
        }));

// Email verification alert page*********************************************************
    router.route("/verifyme").get(isLoggedIn, routeParams.verifyme)

// Email verification page*********************************************************
    router.route("/verify/:eVerCode").get(isLoggedIn, routeParams.verify)

// The page to update user info*********************************************************
    router.route("/update-info")
        .get(isLoggedIn, routeParams.updateInfo)
        .post(isLoggedIn, routeParams.postUpdateInfo);

// The main dashboard*********************************************************
    router.route("/dashboard")
        .get(isLoggedIn, userParam, financeParams, Ref, routeParams.dashboard)

// The route for a paticular package*********************************************************
    router.route("/package/:name")
        .post(isLoggedIn, routeParams.postPackages);

// Router to pay for a specific package*********************************************************
    router.route("/pay/:name")
        .get(isLoggedIn, userParam, financeParams, Ref, routeParams.pay);

// The financial authentication*********************************************************
    router.route("/financial-auth")
        .get(isLoggedIn, userParam, routeParams.finAuth)
        .post(isLoggedIn, routeParams.postFinAuth);

// The router that handles the payment api*******************************************************
    router.route("/pay-now")
        .get(isLoggedIn, userParam, financeParams, Ref, routeParams.payNow)
        .post(isLoggedIn, routeParams.postPayNow);

// The router that show the direct referal page**************************************************
    router.route("/direct-referral")
        .get(isLoggedIn,userParam, financeParams, Ref, dRef, getPassiveRefNum, getPaidPassRef, routeParams.dRef)

// The router that show the passive referal page*************************************************
    router.route("/passive-referral/:id")
        .get(isLoggedIn, userParam, financeParams, Ref, dRef, pRef, myRefName, getPassiveRefNum, getPaidPassRef, routeParams.pRef)

    router.route("/direct-referral-L2")
        .get(isLoggedIn, userParam, financeParams2, Ref, dRef, pRef, myRefName, getPassiveRefNum, dRefPassL1, pRefPassL1, GetPay, routeParams.dRefL2)

    router.route("/passive-referral-L2/:id")
        .get(isLoggedIn, userParam, financeParams2, Ref, dRef, pRef, myRefName, getPassiveRefNum, dRefPassL1, pRefPassL1, GetPay, routeParams.pRefL2)

// The router that handles logout from session****************************************************
    router.route("/logout").get(isLoggedIn, routeParams.logout);

    app .use("/", router)
}