const   shortId = require("shortid"),
        formidable = require("formidable"),
        path = require('path'),
        cloudinary = require("cloudinary"),
        schema = require("../model/schema.js");

const   User = schema.User,
        Finance = schema.Finance,
        DirectRef = schema.DirectRef,
        PassiveRef = schema.PassiveRef;

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

exports.verifyme = (req, res)=>{
    User.findOne({username: req.user.username}, (err, user)=>{
        if(err){
            console.log(err);
        }else{
            if(user.eVerified == false){
                res.render("verify", {
                    "title": "Verify",
                    "verify": true,
                    "error": req.flash("verifyErr")
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
                "error": req.flash("updateError")
            });
        }
    });
}

exports.dashboard = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else{
            if(finance.packageType == "Bronze"){
                res.redirect("/pay/bronze");
            }else if(finance.packageType == "Silver"){
                res.redirect("/pay/silver");
            }else if(finance.packageType == "Gold"){
                res.redirect("/pay/gold");
            }else if(finance.packageType == "Platinum"){
                res.redirect("/pay/platinum");
            }else{
                res.render("dashboard", {
                    dashboard : true,
                    Name : fullName,
                    Image : imgTag,
                    RefNum : refNum,
                    totalAmount : totalAmount,
                    startup : startup,
                    tBank : tBank,
                    Withdrawable : Withdrawable,
                    refId : refId == false ? "No referrer" : refId,
                    refName : refName == false ? "No referrer" : refName
                });
            }
        }
    });
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
                Withdrawable : Withdrawable,
                refId : refId,
                refName : refName,
                packageType : PackageType,
                packageAmount : PackageAmount,
                date : today,
                phoneNo: phoneNo,
                email : email,
                financeID : financeID
            });
        }
    });
}

exports.finAuth = (req, res)=>{
    res.render("finAuth", {
        dashboard : true,
        profileimg : imgTag,
        profileName : fullName,
        "error": req.flash("finError")
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
        Withdrawable : Withdrawable,
        refId : refId,
        refName : refName,
        packageType : PackageType,
        packageAmount : PackageAmount,
    });
}

exports.dRef = (req, res)=>{
    Finance.findOne({userId : req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else if(finance.refererId == "" && PaidPass + numOfPaidRef == 20){
            if(finance.level2.tBank == finance.level1.tBank){
                res.redirect("/direct-referral-L2");
            }else{
                finance.level2.Withdrawable = 0;
                finance.level2.totalAmount = finance.level1.totalAmount - finance.level1.Withdrawable;
                finance.level2.tBank = finance.level1.tBank;
    
                finance.save((err)=>{
                    if(err)console.log(err);
                    else{
                        res.redirect("/direct-referral-L2");
                    }
                })
            }
        }else if(finance.refererId !== "" && PaidPass + numOfPaidRef == 20){
            if(finance.level2.tBank == finance.level1.tBank){
                res.redirect("/direct-referral-L2");
            }else{
                finance.level2.Withdrawable = 0;
                finance.level2.totalAmount = finance.level1.totalAmount - finance.level1.Withdrawable;
                finance.level2.tBank = finance.level1.tBank;
    
                finance.save((err)=>{
                    if(err)console.log(err);
                    else{
                        DirectRef.findOne({userId: finance.refererId.slice(9)}, (err, directRef)=>{
                            if(err)console.log(err);
                            else{
                                let index = indexByParams(directRef.downlines, "RefNum", req.user.userId);
            
                                directRef.downlines[index].level1 = "Pass";
                                
                                directRef.save((err)=>{
                                    if(err)console.log(err);
                                    else{
                                        User.findOne({userId: directRef.userId}, (err, user)=>{
                                            if(user.refererId == ""){
                                                res.redirect("/direct-referral-L2");
                                            }else if(user.refererId !== ""){
                                                PassiveRef.findOne({upperRef: user.userId, userId: directRef.userId}, (err, passiveRef)=>{
                                                    if(err)console.log(err);
                                                    else{
                                                        let passiveIndex = indexByParams(passiveRef.passiveDowns, "RefNum", req.user.userId);
            
                                                        passiveRef.passiveDowns[passiveIndex].level1 == "Pass";
            
                                                        passiveRef.save((err)=>{
                                                            if(err)console.log(err);
                                                            else{
                                                                res.redirect("/direct-referral-L2");
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }  
                        })
                    }
                })
            }
        }else{
            res.render("dReferral", {
                dashboard : true,
                Name : fullName,
                Image : imgTag,
                RefNum : refNum,
                totalAmount : totalAmount,
                startup : startup,
                tBank : tBank,
                Withdrawable : Withdrawable,
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
                passMore8 : PaidPass > 8 && PaidPass < 16 ? true : false,
                passEqual16 : PaidPass == 16 ? true : false
            });
        }
    })
}

exports.dRefL2 = (req, res)=>{
    res.render("dRefL2", {
        dashboard : true,
        Name : fullName,
        Image : imgTag,
        RefNum : refNum,
        totalAmount : totalAmount,
        startup : startup,
        tBank : tBank,
        Withdrawable : Withdrawable,
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
        passMore8 : NumOfPRefPassL1 > 8 && NumOfPRefPassL1 < 16 ? true : false,
        passEqual16 : NumOfPRefPassL1 == 16 ? true : false,
        getPay : getPay == 0 ? false : true
    });
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
        Withdrawable : Withdrawable,
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
        passMore8 : PaidPass > 8 && PaidPass < 16 ? true : false,
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
        Withdrawable : Withdrawable,
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
        passRefNum : passRefNum,
        NumOfPRefPassL1 : NumOfPRefPassL1,
        passLess8 : NumOfPRefPassL1 < 8 ? true : false,
        passMore8 : NumOfPRefPassL1 > 8 && NumOfPRefPassL1 < 16 ? true : false,
        passEqual16 : NumOfPRefPassL1 == 16 ? true : false,
        getPay : getPay == 0 ? false : true
    });
}

exports.logout = (req, res)=>{
    req.logout();
    res.redirect("/login");
}

// The POST method works here******************************

exports.postUpdateInfo = (req, res)=>{
    let form = new formidable.IncomingForm();

    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        let profilePic = files.profilePic.path;

        cloudinary.uploader.upload(
            profilePic,
            (picData)=>{
                let profileImgUrl = picData.url;

                User.findOne({username: req.user.username}, (err, user)=>{
                    if(err)console.log(err);
                    else{
                        user.profilePic = profileImgUrl;
                    }
                    user.save((err)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log("the Picture Uploaded with id:" + profileImgUrl)
                        }
                    });
                });
            },
            {
                public_id: `img_${req.user.userId}`, 
            }
        ); 

        User.findOne({userId : fields.refererId.slice(9)}, (err, refUser)=>{
            if(err)console.log(err);
            else if(!refUser){
                if(fields.refererId !== ""){
                    console.log("There is no user with the inputed referral ID");
                    req.flash("updateError", "There is no user with the inputed referral Id");
                    res.redirect("/update-info");
                }else if(fields.refererId == ""){
                    User.findOne({username: req.user.username}, (err, user)=>{
                        if(err)console.log(err);
                        else{
                            user.firstname = fields.firstname;
                            user.lastname = fields.lastname;
                            user.address = fields.address;
                            user.DOB = `${fields.dd}/${fields.mm}/${fields.yy}`;
                            user.gender = fields.gender;
                            user.phone = fields.phone;
                            user.refererId = fields.refererId;

                            user.save((err)=>{
                                if(err)console.log(err);
                                else{
                                    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
                                        if(err)console.log(err);
                                        else{
                                            let newFinance = new Finance();
                                            
                                            newFinance.userId = req.user.userId;
                                            newFinance.refererId = fields.refererId;
                                            newFinance.bankName = fields.bankName;
                                            newFinance.accName = fields.accName;
                                            newFinance.accNum = fields.accNum;
                                            newFinance.finCode = fields.finCode;
                                            newFinance.level1.level = 1;
                                            newFinance.level1.totalAmount = 0;
                                            newFinance.level1.startup = 0;
                                            newFinance.level1.tBank = 0;
                                            newFinance.level1.Withdrawable = 0;
                                            newFinance.level2.startup = 0;

                                            newFinance.save((err)=>{
                                                if(err)console.log(err);
                                                else{
                                                    setTimeout(()=>{
                                                        res.redirect("/dashboard");
                                                    }, 5000);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }else{
                DirectRef.findOne({userId: refUser.userId}, (err, directRef)=>{
                    if(err)console.log(err);
                    else if(directRef && directRef.downlines.length === 4){
                        console.log("The user can not accomodate more than four (4) referrals");
                        req.flash("updateError", "The user can not accomodate more than four (4) referrals");
                        res.redirect("/update-info");
                    }else{
                        User.findOne({username: req.user.username}, (err, user)=>{
                            if(err)console.log(err);
                            else{
                                user.firstname = fields.firstname;
                                user.lastname = fields.lastname;
                                user.address = fields.address;
                                user.DOB = `${fields.dd}/${fields.mm}/${fields.yy}`;
                                user.gender = fields.gender;
                                user.phone = fields.phone;
                                user.refererId = fields.refererId;

                                user.save((err)=>{
                                    if(err)console.log(err);
                                    else{
                                        Finance.findOne({userId: req.user.userId}, (err, finance)=>{
                                            if(err)console.log(err);
                                            else{
                                                let newFinance = new Finance();
                                                
                                                newFinance.userId = req.user.userId;
                                                newFinance.refererId = fields.refererId;
                                                newFinance.bankName = fields.bankName;
                                                newFinance.accName = fields.accName;
                                                newFinance.accNum = fields.accNum;
                                                newFinance.finCode = fields.finCode;
                                                newFinance.level1.level = 1;
                                                newFinance.level1.totalAmount = 0;
                                                newFinance.level1.startup = 0;
                                                newFinance.level1.tBank = 0;
                                                newFinance.level1.Withdrawable = 0;
                                                newFinance.level2.startup = 0;

                                                newFinance.save((err)=>{
                                                    if(err)console.log(err);
                                                    else{
                                                        if(!directRef){
                                                            let newDirectRef = new DirectRef();

                                                            newDirectRef.userId = refUser.userId;
                                                            newDirectRef.paidRef = 0;
                                                            newDirectRef.downlines.push({
                                                                firstname : fields.firstname,
                                                                lastname : fields.lastname,
                                                                RefNum : req.user.userId,
                                                                img : req.user.profilePic,
                                                                startupPaid : false,
                                                                level1 : "In progress",
                                                                level2 : "In progress",
                                                                level3 : "In progress",
                                                                level4 : "In progress"
                                                            });

                                                            newDirectRef.save((err)=>{
                                                                if(err)console.log(err);
                                                                else{
                                                                    if(refUser.refererId == ""){
                                                                        setTimeout(()=>{
                                                                            res.redirect("/dashboard");
                                                                        }, 5000);
                                                                    }else if(refUser.refererId !== ""){
                                                                        PassiveRef.findOne({userId : fields.refererId.slice(9), upperRef : refUser.refererId.slice(9)}, (err, passiveRef)=>{
                                                                            if(err)console.log(err);
                                                                            else if(!passiveRef){
                                                                                let newPassiveRef = new PassiveRef();

                                                                                newPassiveRef.upperRef = refUser.refererId.slice(9);
                                                                                newPassiveRef.userId =  refUser.userId;
                                                                                newPassiveRef.paidRef = 0;
                                                                                newPassiveRef.passiveDowns.push({
                                                                                    firstname : fields.firstname,
                                                                                    lastname : fields.lastname,
                                                                                    RefNum : req.user.userId,
                                                                                    img : req.user.profilePic,
                                                                                    startupPaid : false,
                                                                                    level1 : "In progress",
                                                                                    level2 : "In progress",
                                                                                    level3 : "In progress",
                                                                                    level4 : "In progress"
                                                                                });

                                                                                newPassiveRef.save((err)=>{
                                                                                    if(err)console.log(err);
                                                                                    else{
                                                                                        setTimeout(()=>{
                                                                                            res.redirect("/dashboard");
                                                                                        }, 5000);
                                                                                    }
                                                                                })
                                                                            }else if(passiveRef){

                                                                                passiveRef.passiveDowns.push({
                                                                                    firstname : fields.firstname,
                                                                                    lastname : fields.lastname,
                                                                                    RefNum : req.user.userId,
                                                                                    img : req.user.profilePic,
                                                                                    startupPaid : false,
                                                                                    level1 : "In progress",
                                                                                    level2 : "In progress",
                                                                                    level3 : "In progress",
                                                                                    level4 : "In progress"
                                                                                });

                                                                                passiveRef.save((err)=>{
                                                                                    if(err)console.log(err);
                                                                                    else{
                                                                                        setTimeout(()=>{
                                                                                            res.redirect("/dashboard");
                                                                                        }, 5000);
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }else if(directRef){
                                                            directRef.downlines.push({
                                                                firstname : fields.firstname,
                                                                lastname : fields.lastname,
                                                                RefNum : req.user.userId,
                                                                img : req.user.profilePic,
                                                                startupPaid : false,
                                                                level1 : "In progress",
                                                                level2 : "In progress",
                                                                level3 : "In progress",
                                                                level4 : "In progress"
                                                            });

                                                            directRef.save((err)=>{
                                                                if(err)console.log(err);
                                                                else{
                                                                    if(refUser.refererId == ""){
                                                                        setTimeout(()=>{
                                                                            res.redirect("/dashboard");
                                                                        }, 5000);
                                                                    }else if(refUser.refererId !== ""){
                                                                        PassiveRef.findOne({userId : fields.refererId.slice(9), upperRef : refUser.refererId.slice(9)}, (err, passiveRef)=>{
                                                                            if(err)console.log(err);
                                                                            else if(!passiveRef){
                                                                                let newPassiveRef = new PassiveRef();

                                                                                newPassiveRef.upperRef = refUser.refererId.slice(9);
                                                                                newPassiveRef.userId =  refUser.userId;
                                                                                newPassiveRef.paidRef = 0;
                                                                                newPassiveRef.passiveDowns.push({
                                                                                    firstname : fields.firstname,
                                                                                    lastname : fields.lastname,
                                                                                    RefNum : req.user.userId,
                                                                                    img : req.user.profilePic,
                                                                                    startupPaid : false,
                                                                                    level1 : "In progress",
                                                                                    level2 : "In progress",
                                                                                    level3 : "In progress",
                                                                                    level4 : "In progress"
                                                                                });

                                                                                newPassiveRef.save((err)=>{
                                                                                    if(err)console.log(err);
                                                                                    else{
                                                                                        setTimeout(()=>{
                                                                                            res.redirect("/dashboard");
                                                                                        }, 5000);
                                                                                    }
                                                                                })
                                                                            }else if(passiveRef){

                                                                                passiveRef.passiveDowns.push({
                                                                                    firstname : fields.firstname,
                                                                                    lastname : fields.lastname,
                                                                                    RefNum : req.user.userId,
                                                                                    img : req.user.profilePic,
                                                                                    startupPaid : false,
                                                                                    level1 : "In progress",
                                                                                    level2 : "In progress",
                                                                                    level3 : "In progress",
                                                                                    level4 : "In progress"
                                                                                });

                                                                                passiveRef.save((err)=>{
                                                                                    if(err)console.log(err);
                                                                                    else{
                                                                                        setTimeout(()=>{
                                                                                            res.redirect("/dashboard");
                                                                                        }, 5000);
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

exports.postPackages = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
        }else{
            if(req.params.name = "bronze"){
                finance.packageType = "Bronze";
                finance.packageAmount = 15000
            }

            finance.save((err)=>{
                if(err){
                    console.log(err)
                }else{
                    res.redirect("/pay/bronze")
                }
            });
        }
    });
}

exports.postFinAuth = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else{
             if(finance.finCode == req.body.finCode){
                res.redirect("/pay-now");
             }else{
                req.flash("finError", "The PIN you entered is incorrect");
                res.redirect("/financial-auth");
             }
        }
    })
}

exports.postPayNow = (req, res)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err)console.log(err);
        else{
            finance.paymentMade = true;
            finance.level1.startup = 15000;

            finance.save((err)=>{
                if(err)console.log(err);
                else{
                    DirectRef.findOne({userId: finance.refererId.slice(9)}, (err, directRef)=>{
                        if(err)console.log(err);
                        else if(!directRef)res.redirect("/direct-referral");
                        else{
                            let index = indexByParams(directRef.downlines, "RefNum", req.user.userId);

                            directRef.paidRef = directRef.paidRef + 1;
                            directRef.downlines[index].startupPaid = true; 

                            directRef.save((err)=>{
                                if(err)console.log(err);
                                else{
                                    Finance.findOne({userId : directRef.userId}, (err, finance)=>{
                                        if(err)console.log(err);
                                        else{
                                            let availCash = finance.packageAmount * (30/100),
                                                nextStartup = availCash * (28/100),
                                                readyCash = availCash - nextStartup

                                            finance.level1.totalAmount = finance.level1.totalAmount + readyCash;
                                            finance.level1.tBank = finance.level1.tBank + (readyCash * (55.5/100));
                                            finance.level1.Withdrawable = finance.level1.Withdrawable + (readyCash * (44.5/100));
                                            finance.level2.startup = finance.level2.startup + nextStartup;

                                            finance.save((err)=>{
                                                if(err)console.log(err);
                                                else{
                                                    PassiveRef.findOne({userId: directRef.userId}, (err, passiveRef)=>{
                                                        if(err)console.log(err);
                                                        else if(!passiveRef)res.redirect("/direct-referral");
                                                        else{
                                                            let passiveIndex = indexByParams(passiveRef.passiveDowns, "RefNum", req.user.userId);

                                                            passiveRef.paidRef = passiveRef.paidRef + 1;
                                                            passiveRef.passiveDowns[passiveIndex].startupPaid = true;

                                                            passiveRef.save((err)=>{
                                                                if(err)console.log(err);
                                                                else{
                                                                    Finance.findOne({userId : passiveRef.upperRef}, (err, finance2)=>{
                                                                        if(err)console.log(err);
                                                                        else{
                                                                            let availCash2 = finance2.packageAmount * (30/100),
                                                                                nextStartup2 = availCash2 * (28/100),
                                                                                readyCash2 = availCash2 - nextStartup2
                                                                                
                                                                            finance2.level1.totalAmount = finance2.level1.totalAmount + readyCash2;
                                                                            finance2.level1.tBank = finance2.level1.tBank + (readyCash2 * (55.5/100));
                                                                            finance2.level1.Withdrawable = finance2.level1.Withdrawable + (readyCash2 * (44.5/100));
                                                                            finance2.level2.startup = finance2.level2.startup + nextStartup2;
                                                                            

                                                                            finance2.save((err)=>{
                                                                                if(err)console.log(err);
                                                                                else {
                                                                                    res.redirect("/direct-referral");
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}