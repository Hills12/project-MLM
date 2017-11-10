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
    getPaidPassRef = middleware.getPaidPassRef,
    financeParams2 = middleware.financeParams2,
    dRefPassL1 = middleware.dRefPassL1,
    pRefPassL1 = middleware.pRefPassL1,
    GetPay = middleware.GetPay,
    doFormidable = middleware.doFormidable,
    referingUser = middleware.referingUser,
    directReferingUser = middleware.directReferingUser,
    passiveReferingUser = middleware.passiveReferingUser,
    PayDirectReferingUser = middleware.PayDirectReferingUser,
    PayPassiveReferingUser = middleware.PayPassiveReferingUser,
    directReferal_Finance = middleware.directReferal_Finance,
    passiveReferal_Finance = middleware.passiveReferal_Finance,
    MyFinance = middleware.MyFinance,
    financeParams3 = middleware.financeParams3,
    dRefPassL2 = middleware.dRefPassL2,
    pRefPassL2 = middleware.pRefPassL2,
    MyFinanceL2 = middleware.MyFinanceL2,
    purgeUser = middleware.purgeUser,
    purgeFinance = middleware.purgeFinance,
    purgeDirectRef = middleware.purgeDirectRef,
    purgePassiveRef = middleware.purgePassiveRef,
    getPayParams = middleware.getPayParams,
    matchCheck = middleware.matchCheck,
    finStatement = middleware.finStatement,
    GetUserBasic = middleware.GetUserBasic,
    GetUserFinance = middleware.GetUserFinance,
    GetUserDref = middleware.GetUserDref,
    GetUserPref = middleware.GetUserPref,
    getwithdrawnStatus = middleware.getwithdrawnStatus,
    adminDRefPassL1 = middleware.adminDRefPassL1,
    adminPRefPassL1 = middleware.adminPRefPassL1,
    adminIsLoggedIn = middleware.adminIsLoggedIn;


module.exports = (express, app, passport, adminPassport, cloudinary)=>{
    const   router = express.Router(),
            adminRouter = express.Router();

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

    adminRouter.route("/register")
        .get(routeParams.adminRegister)
        .post(adminPassport.authenticate("local-register-admin", {
            successRedirect : "check-user",
            failureRedirect : "register",
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

    adminRouter.route("/login")
	    .get(routeParams.adminLogin)
	    .post(adminPassport.authenticate("local-login-admin", {
            successRedirect : "check-user",
    	    failureRedirect : "login",
    	    failureFlash    : true
        }));

// Email verification alert page*********************************************************
    router.route("/verifyme").get(isLoggedIn, userParam, routeParams.verifyme)

// Email verification page*********************************************************
    router.route("/verify/:eVerCode").get(isLoggedIn, routeParams.verify)

// The page to update user info*********************************************************
    router.route("/update-info")
        .get(isLoggedIn, userParam, routeParams.updateInfo)
        .post(isLoggedIn, doFormidable, referingUser, directReferingUser, passiveReferingUser, routeParams.postUpdateInfo);

// The main dashboard*********************************************************
    router.route("/dashboard")
        .get(isLoggedIn, userParam, financeParams, Ref, routeParams.dashboard)

// The route for a paticular package*********************************************************
    router.route("/package/:name")
        .post(isLoggedIn, matchCheck, routeParams.postPackages);

// Router to pay for a specific package*********************************************************
    router.route("/pay/:name")
        .get(isLoggedIn, userParam, financeParams, Ref, routeParams.pay);

// The financial authentication*********************************************************
    router.route("/financial-auth/:name")
        .post(isLoggedIn, routeParams.postFinAuth);

// The router that handles the payment api*******************************************************
    router.route("/pay-now")
        .get(isLoggedIn, userParam, financeParams, Ref, routeParams.payNow)
        .post(isLoggedIn, PayDirectReferingUser, PayPassiveReferingUser, routeParams.postPayNow);

// The router that show the direct referal page**************************************************
    router.route("/direct-referral")
        .get(isLoggedIn,userParam, financeParams, Ref, dRef, getPassiveRefNum, getPaidPassRef, MyFinance, directReferal_Finance, passiveReferal_Finance, routeParams.dRef)

// The router that show the passive referal page*************************************************
    router.route("/passive-referral/:id")
        .get(isLoggedIn, userParam, financeParams, Ref, dRef, pRef, myRefName, getPassiveRefNum, getPaidPassRef, routeParams.pRef)

    router.route("/direct-referral-L2")
        .get(isLoggedIn, userParam, financeParams2, Ref, dRef, pRef, myRefName, dRefPassL1, pRefPassL1, GetPay, MyFinanceL2, purgeUser, purgeFinance, purgeDirectRef, purgePassiveRef, routeParams.dRefL2)   

    router.route("/passive-referral-L2/:id")
        .get(isLoggedIn, userParam, financeParams2, Ref, dRef, pRef, myRefName, dRefPassL1, pRefPassL1, GetPay, routeParams.pRefL2)

    router.route("/travel-bank-get-pay")
        .post(isLoggedIn, routeParams.finCodeGetPay);

    router.route("/get-pay")
        .get(isLoggedIn, userParam, getPayParams, Ref, routeParams.getPayment);

    router.route("/process-get-pay")
        .post(isLoggedIn, routeParams.processGetPay)

    router.route("/get-pay-feedback")
        .get(isLoggedIn, routeParams.getPayFeedback);

    router.route("/account-statement")
        .get(isLoggedIn, userParam, financeParams, Ref, dRef, getPaidPassRef, dRefPassL1, pRefPassL1, finStatement, routeParams.accountStatement);

    adminRouter.route("/check-user")
        .get(adminIsLoggedIn, routeParams.adminCheckUser)
        .post(adminIsLoggedIn, routeParams.postAdminCheckUser)

    adminRouter.route("/get-the-user/:id")
        .get(adminIsLoggedIn, GetUserBasic, GetUserFinance, GetUserDref, GetUserPref, adminDRefPassL1, adminPRefPassL1, getwithdrawnStatus, routeParams.getTheUser);

        
// The router that handles logout from session****************************************************
    router.route("/logout").get(isLoggedIn, routeParams.logout);

    adminRouter.route("/logout").get(adminIsLoggedIn, routeParams.adminLogout);

    app .use("/", router)
    app .use("/admin", adminRouter)
}