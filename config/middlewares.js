const   Schema = require("../model/schema.js");

const   User = Schema.User,
        Finance = Schema.Finance,
        DirectRef = Schema.DirectRef,
        PassiveRef = Schema.PassiveRef;

exports.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "Login to access the requested page!");
        res.redirect("/login");
    }
}

exports.userParam = (req, res, next)=>{
    User.findOne({username: req.user.username}, (err, user)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            fullName = `${user.firstname} ${user.lastname}`;
            imgTag = user.profilePic;
            // imgTag = cloudinary.image(user.profilePic, { alt: fullName });
            refNum = `Ref/trav/${user.userId}`;
            phoneNo = user.phone;
            email = user.email;
            
            return next();
        }
    })
}

exports.financeParams = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            totalAmount = `NGN ${Math.round( finance.level1.totalAmount * 10 ) / 10 }`;
            startup = `NGN ${finance.level1.startup}`;
            tBank = `NGN ${Math.round( finance.level1.tBank * 10 ) / 10 }`;
            Withdrawable = `NGN ${Math.round( finance.level1.Withdrawable * 10 ) / 10 }`;
            PackageType = finance.packageType;
            PackageAmount = finance.packageAmount;
            financeID = `fin/trav/${finance.userId}`;
            level = finance.level1.level;               
            
            return next();
        }
    })
}

exports.financeParams2 = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            totalAmount = `NGN ${Math.round( finance.level2.totalAmount * 10 ) / 10 }`;
            startup = `NGN ${Math.round( finance.level2.startup * 10 ) / 10}`;
            tBank = `NGN ${Math.round( finance.level2.tBank * 10 ) / 10 }`;
            Withdrawable = `NGN ${Math.round( finance.level2.Withdrawable * 10 ) / 10 }`;
            PackageType = finance.packageType;
            PackageAmount = finance.packageAmount;
            financeID = `fin/trav/${finance.userId}`;
            level = finance.level1.level;               
            
            return next();
        }
    })
}

exports.Ref = (req, res, next)=>{
    User.findOne({userId : req.user.refererId.slice(9)}, (err, ref)=>{
        if(err){
            console.log(err);
        }else if(!ref){
            refId = false;
            refName = false;
            return next()
        }
        else{
            refId = `Ref/trav/${ref.userId}`;
            refName = `${ref.firstname} ${ref.lastname}`;
            return next()
        }

    });
}

exports.dRef =(req, res, next)=>{
    DirectRef.findOne({userId: req.user.userId}, (err, directRef)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!directRef){
            referralArray = [];
            numOfRef = 0;
            numOfPaidRef = 0;
            return next();
        }
        else{
            directRef.downlines.map((eachRef, index, dref)=>{
                referralArray = dref;
                return referralArray;
            });
            numOfRef = directRef.downlines.length;
            numOfPaidRef = directRef.paidRef;
            return next()
        }
    });
}

exports.pRef = (req, res, next)=>{
    PassiveRef.findOne({upperRef: req.user.userId, userId: req.params.id}, (err, passiveRef)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!passiveRef){
            pRefArray = [];
            numOfPref = 0;
            numOfpaidPRef = 0;
            return next();
        }else{
            passiveRef.passiveDowns.map((eachpRef, index, pref)=>{
                pRefArray = pref;
                return pRefArray;
            });
            numOfPref = passiveRef.passiveDowns.length;
            numOfpaidPRef = passiveRef.paidRef;
            return next();
        }
    });
}

exports.myRefName = (req, res, next)=>{
    User.findOne({userId : req.params.id}, (err, user)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!user){
            MyrefName = "";
            return next();
        }else{
            MyrefName = `${user.firstname} ${user.lastname}`;
            return next();
        }
    })
}

exports.getPassiveRefNum = (req, res, next)=>{
    PassiveRef.aggregate([
        {$unwind : "$passiveDowns" },
        {$match: { "upperRef" : req.user.userId }},
        {$project: {"passiveDowns": 1, "_id": 0}} 
    ], 
    (err, passiveRefNum)=>{
        if(err){
            console.log(err);
            return next();
        }
        else if(!passiveRefNum){
            passRefNum = 0;
            return next()
        }
        else{
            passRefNum = passiveRefNum.length;
            return next()
        }
    })
}

exports.getPaidPassRef = (req, res, next)=>{
    PassiveRef.aggregate([
        {$unwind : "$passiveDowns" }, 
        {$match: {
            "upperRef" : req.user.userId, 
            "passiveDowns.startupPaid" : true
        }}, 
        {$project: {"passiveDowns": 1, "_id": 0}} 
    ], 
    (err, paidPassRef)=>{
        if(err){
            console.log(err);
            return next();
        }
        else if(!paidPassRef){
            PaidPass = 0;
            return next()
        }
        else{
            PaidPass = paidPassRef.length;
            return next()
        }
    })
}

exports.dRefPassL1 = (req, res, next)=>{
    DirectRef.aggregate([
        { $unwind : "$downlines" },
        {$match: {
            "userId" : req.user.userId,
            "downlines.level1" : "Pass"
        }},
        {$project: {"downlines": 1, "_id": 0}}
    ], (err, dRefpassl1)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!dRefpassl1){
            NumOfDRefPassL1 = 0;
            return next();
        }else{
            NumOfDRefPassL1 = dRefpassl1.length;
            return next();
        }
    })
}

exports.pRefPassL1 = (req, res, next)=>{
    PassiveRef.aggregate([
        { $unwind : "$passiveDowns" },
        {$match: {
            "upperRef" : req.user.userId,
            "passiveDowns.level1" : "Pass"
        }},
        {$project: {"passiveDowns": 1, "_id": 0}}
    ], (err, pRefPassl1)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!pRefPassl1){
            NumOfPRefPassL1 = 0;
            return next();
        }else{
            NumOfPRefPassL1 = pRefPassl1.length;
            return next();
        }
    })
}

exports.GetPay = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err,finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            getPay = finance.level1.Withdrawable;
            return next()
        }
    })
}