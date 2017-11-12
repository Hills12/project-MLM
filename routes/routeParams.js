const   shortId = require("shortid"),
        formidable = require("formidable"),
        path = require('path'),
        cloudinary = require("cloudinary"),
        schema = require("../model/schema.js");

const   User = schema.User,
        Finance = schema.Finance,
        DirectRef = schema.DirectRef,
        PassiveRef = schema.PassiveRef,
        Admin = schema.Admin;

let today = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

let indexByParams = (array, key, value)=>{
    for(var i = 0; i < array.length; i++){
        if(array[i][key] == value){
            return i;
        }
    }
    return null
}

// All the router magic happens here*******************************************************
// The GET method works here******************************
exports.register = (req, res)=>{
    res.render("register", {        
        "title": "Register",
        "register": true,
        "error": req.flash("error")
	});
}

exports.login = (req, res)=>{
    res.render("login", {
	    "title": "Login",
        "register": true,
        "error": req.flash("error")
	});
}

exports.adminRegister = (req, res)=>{
    res.render("adminRegister", {
        "admin" : true,        
        "title": "Register",
        "register": true,
        "adminError": req.flash("adminError")
	});
}

exports.adminLogin = (req, res)=>{
    res.render("adminLogin", {
        "admin" : true,
	    "title": "Login",
        "register": true,
        "adminError": req.flash("adminError")
	});
}

exports.verifyme = (req, res)=>{
    User.findOne({username: req.user.username}, (err, user)=>{
        if(err){
            console.log(err);
        }else{
            if(user.eVerified == false){
                res.render("verify", {
                    "title": "Verify",
                    "verify": true,
                    "error": req.flash("verifyErr"),
                    "link": `<h1><a href="/verify/${eVerCode}"><u>Please RIGHT CLICK here as the DEMO LINK</u></a></h1>`
                });
            }else{
                req.flash("updateError", "<strong>Welcome back!</strong> please continue your registration");
                res.redirect("/update-info");
            }
        }
    });   
}

exports.verify = (req, res)=>{
    User.findOne({username: req.user.username}, (err, user)=>{
        if(err){
            console.log(err);
        }else if(!user){
            console.log("User does not exist");
            req.flash("verifyErr", "User does not exist");
            res.redirect("/verifyme");
        }else{
            if(req.params.eVerCode !== user.eVerCode){
                console.log("The verification code does not match");
                req.flash("verifyErr", "The verification link does not match, please check the link again");
                res.redirect("/verifyme");
            }else{
                user.eVerified = true;

                user.save((err)=>{
                    if(err){
                        console.log(err);
                    }else{
                        res.redirect("/update-info");
                    }
                })
            }
        }
    })
}

exports.updateInfo = (req, res)=>{
    User.findOne({username: req.user.username}, (err, user)=>{
        if(user.firstname){
            res.redirect("/dashboard");
        }else{
            res.render("update", {
                "title": "Update Account",
                "update": true,
                "error": req.flash("updateError"),
                "username": username
            });
        }
    });
}

exports.postUpdateInfo = (req, res)=>{
    if(!emptyReferingID){
        console.log("There is no user with the inputed referral ID");
        req.flash("updateError", "There is no user with the inputed referral Id");
        res.redirect("/update-info");  
    }else if(maxReferrals){
        console.log("The user can not accomodate more than four (4) referrals");
        req.flash("updateError", "The user can not accomodate more than four (4) referrals");
        res.redirect("/update-info");  
    }else if(emptyReferingID || !maxReferrals){
        User.findOne({userId: req.user.userId}, (err, user)=>{
            if(err)console.log(err);
            else{
                user.firstname = fields.firstname;
                user.lastname = fields.lastname;
                user.address = fields.address;
                user.DOB = `${fields.dd}/${fields.mm}/${fields.yy}`;
                user.gender = fields.gender;
                user.phone = fields.phone;
                user.refererId = fields.refererId;
                user.profilePic = `img/defaultpic.png`; //remove later

                user.save((err)=>{
                    if(err)console.log(err);
                    else{
                        console.log("User saved!")
                        Finance.findOne({userId: req.user.userId}, (err, finance)=>{
                            if(err)console.log(err);
                            else{
                                let newFinance = new Finance();
                                
                                newFinance.userId = req.user.userId;
                                newFinance.refererId = fields.refererId;
                                newFinance.level1.totalAmount = 0;
                                newFinance.level1.startup = 0;
                                newFinance.level1.tBank = 0;
                                newFinance.level1.Withdrawable = 0;
                                newFinance.level1.constantWithdrawable = 0;
                                newFinance.level2.startup = 0;

                                newFinance.save((err)=>{
                                    if(err)console.log(err);
                                    else{
                                        console.log("Finance saved!")
                                        res.redirect("/dashboard");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }      
}

exports.dashboard = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else if(finance.packageType == "Bronze")res.redirect("/pay/bronze");
        else if(finance.packageType == "Silver")res.redirect("/pay/silver");
        else if(finance.packageType == "Gold")res.redirect("/pay/gold");
        else if(finance.packageType == "Platinum")res.redirect("/pay/platinum");
        else{
            res.render("dashboard", {
                dashboard : true,
                Name : fullName,
                Image : imgTag,
                RefNum : refNum,
                totalAmount : totalAmount,
                startup : startup,
                tBank : tBank,
                Withdrawable : Withdrawable1,
                refId : refId == false ? "No referrer" : refId,
                refName : refName == false ? "No referrer" : refName,
                packageComplete : finance.packageComplete ? true : false,
                hackError1 : req.flash("hackError1"),
                matchCheck : req.flash("matchCheck")
            });
        }
    });
}

exports.postPackages = (req, res)=>{
    if(!refMatch){
        res.redirect("/dashboard");
    }else if(refMatch){
        if(req.params.name == "bronze"){
            ownFinance.packageType = "Bronze";
            ownFinance.packageAmount = 15000
            ownFinance.save(err=> err ? console.log(err) : res.redirect(`/pay/${req.params.name}`));
        }else if(req.params.name == "silver"){
            ownFinance.packageType = "Silver";
            ownFinance.packageAmount = 30000
            ownFinance.save(err=> err ? console.log(err) : res.redirect(`/pay/${req.params.name}`));
        }else if(req.params.name == "gold"){
            ownFinance.packageType = "Gold";
            ownFinance.packageAmount = 60000
            ownFinance.save(err=> err ? console.log(err) : res.redirect(`/pay/${req.params.name}`));
        }else if(req.params.name == "platinum"){
            ownFinance.packageType = "Platinum";
            ownFinance.packageAmount = 120000
            ownFinance.save(err=> err ? console.log(err) : res.redirect(`/pay/${req.params.name}`));
        }else{
            req.flash("hackError1", `<div class="callout callout-danger"><p>Someone Wanted to hack the system. Please be careful</p></div>`);
            res.redirect("/dashboard"); 
        }
    }
}

exports.pay = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else if(finance.paymentMade === true)res.redirect("/direct-referral");
        else{
            res.render("pay", {
                dashboard : true,
                Name : fullName,
                Image : imgTag,
                RefNum : refNum,
                totalAmount : totalAmount,
                startup : startup,
                tBank : tBank,
                Withdrawable : Withdrawable1,
                refId : refId,
                refName : refName,
                packageType : PackageType,
                packageAmount : PackageAmount,
                date : today,
                phoneNo: phoneNo,
                email : email,
                financeID : financeID,
                fincodeErr : req.flash("fincodeErr")
            });
        }
    });
}

exports.postFinAuth = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else if(req.body.finCode !== req.body.finCode2){
            req.flash("fincodeErr", `<div class="callout callout-danger"><p>The Travel Bank Code you inputed does not match</p></div>`);
            res.redirect(`/pay/${req.params.name}`);
        }else{
            finance.finCode = req.body.finCode;
            finance.getPay.bankName = req.body.bankName;
            finance.getPay.accNum = req.body.accNum;
            finance.getPay.accName = req.body.accName;
            finance.getPay.bvn = req.body.bvn;

            finance.save(err=>{
                if(err)console.log(err);
                else{
                    res.redirect("/pay-now");
                }
            });
        }
    });
}

exports.payNow = (req, res)=>{
    res.render("paynow", {
        dashboard : true,
        Name : fullName,
        Image : imgTag,
        RefNum : refNum,
        totalAmount : totalAmount,
        startup : startup,
        tBank : tBank,
        Withdrawable : Withdrawable1,
        refId : refId,
        refName : refName,
        packageType : PackageType,
        packageAmount : PackageAmount,
    });
}

exports.postPayNow = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else{
            finance.paymentMade = true;
            finance.level1.startup = finance.packageAmount;

            finance.save(err=>{
                if(err)console.log(err);
                else{
                    if(!directReferalPay) console.log("There is neither DIRECT nor PASSIVE REFERING USER");
                    else if(!passiveReferalPay) console.log("There is DIRECT but no PASSIVE REFERING USER");
                    else console.log("There are DIRECT and PASSIVE REFERING USERS");
                    res.redirect("/direct-referral");
                }
            });
        }
    });
}

exports.dRef = (req, res)=>{
    if(readyToPromote){
        res.redirect("/direct-referral-L2");
    }else if(!readyToPromote){
        res.render("dReferral", {
            dashboard : true,
            Name : fullName,
            Image : imgTag,
            RefNum : refNum,
            totalAmount : totalAmount,
            startup : startup,
            tBank : tBank,
            Withdrawable1 : Withdrawable1,
            Withdrawable2 : Withdrawable2,
            refId : refId,
            refName : refName,
            packageType : PackageType,
            packageAmount : PackageAmount,
            downlineArray : referralArray,
            noOfRef : numOfRef,
            numOfPaidRef : numOfPaidRef,
            less2 : numOfPaidRef < 2 ? true : false,
            more2 : numOfPaidRef > 2 && numOfPaidRef < 4 ? true : false,
            equal4 : numOfPaidRef == 4 ? true : false,
            passRefNum : passRefNum,
            PaidPass : PaidPass,
            passLess8 : PaidPass < 8 ? true : false,
            passMore8 : PaidPass > 8 && PaidPass < 16 || PaidPass == 8 ? true : false,
            passEqual16 : PaidPass == 16 ? true : false
        });
    }       
}


exports.dRefL2 = (req, res)=>{
    if(readyToPromote){
        res.redirect("/dashboard");
    }else if(!readyToPromote){
        Finance.findOne({userId: req.user.userId}, (err, finance)=>{
            if(err)console.log(err);
            else{
                res.render("dRefL2", {
                    dashboard : true,
                    Name : fullName,
                    Image : imgTag,
                    RefNum : refNum,
                    totalAmount : totalAmount,
                    startup : startup,
                    tBank : tBank,
                    Withdrawable1 : Withdrawable1,
                    Withdrawable2 : Withdrawable2,
                    finishedWithdrawable : finishedWithdrawable,
                    refId : refId,
                    refName : refName,
                    packageType : PackageType,
                    packageAmount : PackageAmount,
                    downlineArray : referralArray,
                    NumOfDRefPassL1 : NumOfDRefPassL1,
                    less2 : NumOfDRefPassL1 < 2 ? true : false,
                    more2 : NumOfDRefPassL1 > 2 && NumOfDRefPassL1 < 4 ? true : false,
                    equal4 : NumOfDRefPassL1 == 4 ? true : false,
                    NumOfPRefPassL1 : NumOfPRefPassL1,
                    passLess8 : NumOfPRefPassL1 < 8 ? true : false,
                    passMore8 : NumOfPRefPassL1 > 8 && NumOfPRefPassL1 < 16 || NumOfPRefPassL1 == 8 ? true : false,
                    passEqual16 : NumOfPRefPassL1 == 16 ? true : false,
                    getPayTrue : getPay == true || getPayL2 == true,
                    getPayFalse : getPay == false && getPayL2 == false,
                    packageComplete : finance.packageComplete ? true : false,
                    error: req.flash("finCodeError"),
                    hackError : req.flash("hackError")
    
                });
            }
        });
    }
}

exports.pRef = (req, res)=>{
    res.render("pReferral", {
        dashboard : true,
        Name : fullName,
        Image : imgTag,
        RefNum : refNum,
        totalAmount : totalAmount,
        startup : startup,
        tBank : tBank,
        Withdrawable1 : Withdrawable1,
        Withdrawable2 : Withdrawable2,
        refId : refId,
        refName : refName,
        packageType : PackageType,
        packageAmount : PackageAmount,
        downlineArray : referralArray,
        noOfRef : numOfRef,
        numOfPaidRef : numOfPaidRef,
        less2 : numOfPaidRef < 2 ? true : false,
        more2 : numOfPaidRef > 2 && numOfPaidRef < 4 ? true : false,
        equal4 : numOfPaidRef == 4 ? true : false,
        pRefArray : pRefArray,
        numOfPref : numOfPref,
        numOfpaidPRef : numOfpaidPRef,
        MyrefName : MyrefName,
        passRefNum : passRefNum,
        PaidPass : PaidPass,
        passLess8 : PaidPass < 8 ? true : false,
        passMore8 : PaidPass > 8 && PaidPass < 16 || PaidPass == 8 ? true : false,
        passEqual16 : PaidPass == 16 ? true : false
    });
}

exports.pRefL2 = (req, res)=>{
    res.render("pRefL2", {
        dashboard : true,
        Name : fullName,
        Image : imgTag,
        RefNum : refNum,
        totalAmount : totalAmount,
        startup : startup,
        tBank : tBank,
        Withdrawable1 : Withdrawable1,
        Withdrawable2 : Withdrawable2,
        refId : refId,
        refName : refName,
        packageType : PackageType,
        packageAmount : PackageAmount,
        downlineArray : referralArray,
        NumOfDRefPassL1 : NumOfDRefPassL1,
        less2 : NumOfDRefPassL1 < 2 ? true : false,
        more2 : NumOfDRefPassL1 > 2 && NumOfDRefPassL1 < 4 ? true : false,
        equal4 : NumOfDRefPassL1 == 4 ? true : false,
        pRefArray : pRefArray,
        MyrefName : MyrefName,
        NumOfPRefPassL1 : NumOfPRefPassL1,
        passLess8 : NumOfPRefPassL1 < 8 ? true : false,
        passMore8 : NumOfPRefPassL1 > 8 && NumOfPRefPassL1 < 16 || NumOfPRefPassL1 == 8 ? true : false,
        passEqual16 : NumOfPRefPassL1 == 16 ? true : false,
        getPayTrue : getPay == true || getPay2 == true,
        getPayFalse : getPay == false && getPay2 == false
    });
}

exports.finCodeGetPay = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else if(finance.finCode !== req.body.finCode){
            req.flash("finCodeError", `<div class="callout callout-danger"><p>The inputed Travel BanK Code is not correct</p></div>`);
            res.redirect("/direct-referral-L2")
        }else if(!req.body.level1 && !req.body.level2){
            req.flash("finCodeError", `<div class="callout callout-danger"><p>Please click one or more level to get payment from</p></div>`);
            res.redirect("/direct-referral-L2")
        }else if(finance.finCode == req.body.finCode){
            if(!req.body.level1){
                finance.getPay.level1 = 0;
                finance.getPay.level2 = req.body.level2.slice(2);
            }else if(!req.body.level2){
                finance.getPay.level1 = req.body.level1.slice(2);
                finance.getPay.level2 = 0;
            }else{
                finance.getPay.level1 = req.body.level1.slice(2);
                finance.getPay.level2 = req.body.level2.slice(2);
            }
            finance.save(err=> err ? console.log(err) : res.redirect("/get-pay"));
        }
    })
}

exports.getPayment = (req, res)=>{
    res.render("getPay", {
        dashboard : true,
        Name : fullName,
        Image : imgTag,
        RefNum : refNum,
        refId : refId,
        refName : refName,
        date : today,
        phoneNo: phoneNo,
        email : email,
        financeID : financeID,
        payLevel1 : payLevel1,
        payLevel2 : payLevel2,
        totalPay : totalPay,
        postPayL1 : postPayL1,
        postPayL2 : postPayL2
    })
}

exports.processGetPay = (req, res)=>{
    Finance.findOne({userId : req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else if(req.body.level1 != 0 && req.body.level1 != finance.level1.Withdrawable){
            req.flash("hackError", `<div class="callout callout-danger"><p>Someone Wanted to hack the system. Please be careful</p></div>`);
            res.redirect("/direct-referral-L2")
        }else if(req.body.level2 != 0 && req.body.level2 != finance.level2.Withdrawable){
            req.flash("hackError", `<div class="callout callout-danger"><p>Someone Wanted to hack the system. Please be careful</p></div>`);
            res.redirect("/direct-referral-L2")
        }else{
            finance.level1.Withdrawable = req.body.level1;
            finance.level2.Withdrawable = req.body.level2;

            finance.save(err=>{
                if(err)console.log(err);
                else res.redirect("/get-pay-feedback");
            });
        }
    })
}

exports.getPayFeedback = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else{
            res.render("getPayFeedback", {
                packageComplete : finance.packageComplete ? true : false,
            })
        }
    })
}

exports.accountStatement = (req, res)=>{
    res.render("accStatement", {
        dashboard : true,
        Name : fullName,
        Image : imgTag,
        RefNum : refNum,
        totalAmount : totalAmount,
        startup : startup,
        tBank : tBank,
        Withdrawable : Withdrawable1,
        refId : refId == false ? "No referrer" : refId,
        refName : refName == false ? "No referrer" : refName,
        WithdrawableL1 : WithdrawableL1,
        WithdrawableL2 : WithdrawableL2,
        totalWithdraw : totalWithdraw,
        tBankL1 : tBankL1,
        tBankL2 : tBankL2,
        totalTBank : totalTBank,
        totalAmountL1 : totalAmountL1,
        totalAmountL2 : totalAmountL2,
        sumTotalAmount : sumTotalAmount,
        startupCap : startupCap,
        startupProgress : startupProgress,
        withdrawStatusL1 : withdrawStatusL1,
        withdrawStatusL1Progress : withdrawStatusL1Progress,
        withdrawStatusL2 : withdrawStatusL2,
        withdrawStatusL2Progress : withdrawStatusL2Progress
    });
}

exports.adminCheckUser = (req, res)=>{
    res.render("adminCheckUser", {
        admin : true,
        "noUserError": req.flash("noUser")
    });
}

exports.postAdminCheckUser = (req, res)=>{
    res.redirect(`/get-the-user/${req.body.refNum.slice(9)}`);
}

exports.getTheUser = (req, res)=>{
    if(!theUser){
        req.flash("noUser", `<div class="callout callout-danger"><h4>Warning!</h4><p>There is no user with the referral ID. Ask the customer to cross check the referal ID given.</p></div>`);
        res.redirect("/check-user");
    }else if(theUser){
        res.render("getTheUser", {
            admin : true,
            theUser : theUser,
            thefinance : thefinance,
            theDRef : theDRef,
            thePRef : thePRef,
            level : level,
            withdrawnStatusL1 : withdrawnStatusL1,
            withdrawnStatusL2 : withdrawnStatusL2,
            adminNumOfDRefPassL1 : adminNumOfDRefPassL1,
            adminNumOfPRefPassL1 : adminNumOfPRefPassL1
        });
    }
}

exports.logout = (req, res)=>{
    req.logout();
    res.redirect("/login");
}

exports.adminLogout = (req, res)=>{
    req.logout();
    res.redirect("login");
}
