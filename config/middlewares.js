const   formidable = require("formidable"),
        Schema = require("../model/schema.js");

const   User = Schema.User,
        Finance = Schema.Finance,
        DirectRef = Schema.DirectRef,
        PassiveRef = Schema.PassiveRef;

let indexByParams = (array, key, value)=>{
    for(var i = 0; i < array.length; i++){
        if(array[i][key] == value){
            return i;
        }
    }
    return null
}

exports.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "Login to access the requested page!");
        res.redirect("/login");
    }
}

exports.adminIsLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("adminError", "Login to access the requested page!");
        res.redirect("login");
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
            username = user.username; // please remove later
            eVerCode = user.eVerCode; // please remove later
            
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
            totalAmount = `₦ ${Math.round( finance.level1.totalAmount * 10 ) / 10 }`;
            startup = `₦ ${finance.level1.startup}`;
            tBank = `₦ ${Math.round( finance.level1.tBank * 10 ) / 10 }`;
            Withdrawable1 = `₦ ${Math.round( finance.level1.Withdrawable * 10 ) / 10 }`;
            Withdrawable2 = `₦ ${Math.round( finance.level2.Withdrawable * 10 ) / 10 }`;
            PackageType = finance.packageType;
            PackageAmount = finance.packageAmount;
            financeID = `fin/trav/${finance.userId}`;               
            
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
            totalAmount = `₦ ${Math.round( finance.level2.totalAmount * 10 ) / 10 }`;
            startup = `₦ ${Math.round( finance.level2.startup * 10 ) / 10}`;
            tBank = `₦ ${Math.round( finance.level2.tBank * 10 ) / 10 }`;
            Withdrawable1 = `₦ ${Math.round( finance.level1.Withdrawable * 10 ) / 10 }`;
            Withdrawable2 = `₦ ${Math.round( finance.level2.Withdrawable * 10 ) / 10 }`;
            PackageType = finance.packageType;
            PackageAmount = finance.packageAmount;
            financeID = `fin/trav/${finance.userId}`;             
            
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

exports.dRefPassL2 = (req, res, next)=>{
    DirectRef.aggregate([
        { $unwind : "$downlines" },
        {$match: {
            "userId" : req.user.userId,
            "downlines.level2" : "Pass"
        }},
        {$project: {"downlines": 1, "_id": 0}}
    ], (err, dRefpassl2)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!dRefpassl2){
            NumOfDRefPassL2 = 0;
            return next();
        }else{
            NumOfDRefPassL2 = dRefpassl2.length;
            return next();
        }
    })
}

exports.pRefPassL2 = (req, res, next)=>{
    PassiveRef.aggregate([
        { $unwind : "$passiveDowns" },
        {$match: {
            "upperRef" : req.user.userId,
            "passiveDowns.level2" : "Pass"
        }},
        {$project: {"passiveDowns": 1, "_id": 0}}
    ], (err, pRefPassl2)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!pRefPassl2){
            NumOfPRefPassL2 = 0;
            return next();
        }else{
            NumOfPRefPassL2 = pRefPassl2.length;
            return next();
        }
    })
}

// Chanege formidable to multiparty
exports.doFormidable = (req, res, next)=>{
    let form = new formidable.IncomingForm();

    form.keepExtensions = true;
    form.parse(req, (err, formFields, formFiles)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            fields = formFields;
            
            let profilePic = formFiles.profilePic.path;
            
            /* files = formFiles;
    
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
            ); */
            return next()
        }
    })
}

exports.referingUser = (req, res, next)=>{
    User.findOne({userId : fields.refererId.slice(9)}, (err, refUser)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!refUser){
            if(fields.refererId == ""){
                emptyReferingID = true;
                maxReferrals = false;
            }else if(fields.refererId !== ""){
                emptyReferingID = false;
            }
            ReferingUser = false;
            return next();
        }else{
            emptyReferingID = true;
            // maxReferrals = false;
            ReferingUser = refUser;
            return next();
        }
    })
}

exports.directReferingUser = (req, res, next)=>{
    if(!ReferingUser)return next();
    else{
        DirectRef.findOne({userId: ReferingUser.userId}, (err, directRef)=>{
            if(err){
                console.log(err);
                return next();
            }else if(directRef){
                if(directRef.downlines.length === 4){
                    maxReferrals = true;
                    return next();
                }else{
                    maxReferrals = false;

                    directRef.downlines.push({
                        firstname : fields.firstname,
                        lastname : fields.lastname,
                        RefNum : req.user.userId,
                        img : `img/defaultpic.png`,
                        startupPaid : false,
                        level1 : "In progress"
                    });

                    directRef.save(err=> err ? console.log(err) : ReferingUser.refererId == "" ?  console.log(`There is NO passive referring user, hence info saved at AN OLD DirectRef document owned by ${ReferingUser.userId}`) : console.log(`There is passive referring user and info saved at AN OLD DirectRef document owned by ${ReferingUser.userId}`))
                    return next();
                }
            } 
            else if(!directRef){
                maxReferrals = false;
                let newDirectRef = new DirectRef();
                
                newDirectRef.userId = ReferingUser.userId;
                newDirectRef.paidRef = 0;
                newDirectRef.downlines.push({
                    firstname : fields.firstname,
                    lastname : fields.lastname,
                    RefNum : req.user.userId,
                    img : `img/defaultpic.png`,
                    startupPaid : false,
                    level1 : "In progress"
                });
    
                newDirectRef.save(err=> err ? console.log(err) : ReferingUser.refererId == "" ?  console.log(`There is NO passive referring user, hence info saved at A NEW DirectRef document owned by ${ReferingUser.userId}`) : console.log(`There is passive referring user, hence info saved at A NEW DirectRef document owned by ${ReferingUser.userId}`))
                return next();
            }
        });
    }
}

exports.passiveReferingUser = (req, res, next)=>{
    if(!ReferingUser)return next();
    else if(maxReferrals)return next();
    else{
        if(ReferingUser.refererId !== ""){
            PassiveRef.findOne({userId : fields.refererId.slice(9), upperRef : ReferingUser.refererId.slice(9)}, (err, passiveRef)=>{
                if(err)console.log(err);
                else if(passiveRef){
                    passiveRef.passiveDowns.push({
                        firstname : fields.firstname,
                        lastname : fields.lastname,
                        RefNum : req.user.userId,
                        img : `img/defaultpic.png`,
                        startupPaid : false,
                        level1 : "In progress"
                    });
    
                    passiveRef.save(err=> err ? console.log(err) : console.log(`Info saved at AN OLD PassiveRef document owned by ${ReferingUser.refererId.slice(9)}`))  
                }
                else if(!passiveRef){
                    let newPassiveRef = new PassiveRef();
                    
                    newPassiveRef.upperRef = ReferingUser.refererId.slice(9);
                    newPassiveRef.userId =  ReferingUser.userId;
                    newPassiveRef.paidRef = 0;
                    newPassiveRef.passiveDowns.push({
                        firstname : fields.firstname,
                        lastname : fields.lastname,
                        RefNum : req.user.userId,
                        img : `img/defaultpic.png`,
                        startupPaid : false,
                        level1 : "In progress"
                    });
    
                    newPassiveRef.save(err=> err ? console.log(err) : console.log(`Info saved at A NEW PassiveRef document owned by ${ReferingUser.refererId.slice(9)}`))
                }
            });
        }
        return next();
    }
}

exports.PayDirectReferingUser = (req, res, next)=>{
    DirectRef.findOne({userId : req.user.refererId.slice(9)}, (err, directRef)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!directRef){
            directReferalPay = false;
            return next();
        }else{
            directReferalPay = true;
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
                                readyCash = availCash - nextStartup;

                            finance.level1.totalAmount = finance.level1.totalAmount + readyCash;
                            finance.level1.tBank = finance.level1.tBank + (readyCash * (55.5/100));
                            finance.level1.Withdrawable = finance.level1.Withdrawable + (readyCash * (44.5/100));
                            finance.level1.constantWithdrawable = finance.level1.constantWithdrawable + (readyCash * (44.5/100));
                            finance.level2.startup = finance.level2.startup + nextStartup;

                            finance.save(err=>{
                                if(err)console.log(err);
                                else{
                                    console.log("the required percentages remitted to a DIRECT REFERERING account");
                                }
                            })
                        }
                    });
                }
            });
            directReferingUserId = directRef.userId;
            return next();
        }
    });
}

exports.PayPassiveReferingUser = (req, res, next)=>{
    if(directReferalPay){
        PassiveRef.findOne({userId: directReferingUserId}, (err, passiveRef)=>{
            if(err){
                console.log(err);
                return next();
            }else if(!passiveRef){
                passiveReferalPay = false;
                return next();
            }else{
                passiveReferalPay = true;

                let passiveIndex = indexByParams(passiveRef.passiveDowns, "RefNum", req.user.userId);
    
                passiveRef.paidRef = passiveRef.paidRef + 1;
                passiveRef.passiveDowns[passiveIndex].startupPaid = true;
    
                passiveRef.save((err)=>{
                    if(err)console.log(err);
                    else{
                        Finance.findOne({userId : passiveRef.upperRef}, (err, finance)=>{
                            if(err)console.log(err);
                            else{
                                let availCash = finance.packageAmount * (30/100),
                                    nextStartup = availCash * (28/100),
                                    readyCash = availCash - nextStartup;
    
                                finance.level1.totalAmount = finance.level1.totalAmount + readyCash;
                                finance.level1.tBank = finance.level1.tBank + (readyCash * (55.5/100));
                                finance.level1.Withdrawable = finance.level1.Withdrawable + (readyCash * (44.5/100));
                                finance.level1.constantWithdrawable = finance.level1.constantWithdrawable + (readyCash * (44.5/100));
                                finance.level2.startup = finance.level2.startup + nextStartup;
    
                                finance.save(err=>{
                                    if(err)console.log(err);
                                    else{
                                        console.log("the required percentages remitted to a PASSIVE REFERERING account");
                                    }
                                });
                            }
                        });
                        return next();
                    }
                });
            }
        });
    }else return next();
}

exports.GetPay = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err,finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            if(PaidPass + numOfPaidRef == 20){
                if(NumOfDRefPassL1 + NumOfPRefPassL1 == 20){
                    getPayL2 = finance.level2.Withdrawable == 0 ? false : true;
                }else if(NumOfDRefPassL1 + NumOfPRefPassL1 !== 20){
                    getPayL2 = false;
                }
                getPay2 = finance.level2.Withdrawable == 0 ? false : true;
                getPay = finance.level1.Withdrawable == 0 ? false : true;
                return next();
            }else{
                getPay = finance.level1.Withdrawable == 0 ? false : true;
                return next();
            }
        }
    });
}

exports.MyFinance = (req, res, next)=>{
    Finance.findOne({userId : req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }
        else if(PaidPass + numOfPaidRef == 20){
            if(finance.level2.Withdrawable >= 0){
                myfinance = false;
                readyToPromote = true;
                return next();
            }else if(!finance.level2.Withdrawable){
                finance.level2.Withdrawable = 0;
                finance.level2.constantWithdrawable = 0;
                finance.level2.totalAmount = finance.level1.totalAmount - finance.level1.Withdrawable;
                finance.level2.tBank = finance.level1.tBank;
    
                finance.save((err)=>{
                    if(err)console.log(err);
                    else{
                        if(finance.refererId == ""){
                            myfinance = false;
                            readyToPromote = true;
                            return next();
                        }else if(finance.refererId !== ""){
                            myfinance = finance;
                            readyToPromote = true;
                            return next();
                        }
                    }
                });
            }
        }
        else if(PaidPass + numOfPaidRef !== 20){
            myfinance = false;
            readyToPromote = false
            return next();
        }
    });
}

exports.directReferal_Finance = (req, res, next)=>{
    if(!myfinance){
        directReferingUser_fin = false;
        return next();
    }
    else{
        Finance.findOne({userId : myfinance.refererId.slice(9)}, (err, dirRef_fin)=>{
            if(err){
                console.log(err);
                return next();
            }else{
                let availCashh = dirRef_fin.level2.startup * (35/100),
                    nextStartupp = availCashh * (28/100),
                    readyCashh = availCashh - nextStartupp;

                dirRef_fin.level2.totalAmount = dirRef_fin.level2.totalAmount + readyCashh;
                dirRef_fin.level2.tBank = dirRef_fin.level2.tBank + (readyCashh * (55.5/100));
                dirRef_fin.level2.Withdrawable = dirRef_fin.level2.Withdrawable + (readyCashh * (44.5/100));
                dirRef_fin.level2.constantWithdrawable = dirRef_fin.level2.constantWithdrawable + (readyCashh * (44.5/100));

                dirRef_fin.save((err)=>{
                    if(err)console.log(err)
                    else{
                        DirectRef.findOne({userId: dirRef_fin.userId}, (err, directRef)=>{
                            if(err)console.log(err);
                            else{
                                let index = indexByParams(directRef.downlines, "RefNum", req.user.userId);
    
                                directRef.downlines[index].level1 = "Pass";
    
                                directRef.save((err)=>{
                                    if(err)console.log(err);
                                    else{
                                        console.log("info saved to the DIRECT REFERING USER'S FINANCE collection ")
        
                                        directReferingUser_fin = directRef.userId
                                        return next();
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

exports.passiveReferal_Finance = (req, res, next)=>{
    if(directReferingUser_fin){
        User.findOne({userId: directReferingUser_fin}, (err, user)=>{
            if(err)console.log(err)
            else if(user.refererId == ""){
                res.redirect("/direct-referral-L2");
            }else if(user.refererId !== ""){
                Finance.findOne({userId : user.refererId.slice(9)}, (err, passRef_fin)=>{
                    if(err)console.log(err);
                    else if(!passRef_fin)return next();
                    else{
                        let availCashh = passRef_fin.level2.startup * (35/100),
                            nextStartupp = availCashh * (28/100),
                            readyCashh = availCashh - nextStartupp

                        passRef_fin.level2.totalAmount = passRef_fin.level2.totalAmount + readyCashh
                        passRef_fin.level2.tBank = passRef_fin.level2.tBank + (readyCashh * (55.5/100));
                        passRef_fin.level2.Withdrawable = passRef_fin.level2.Withdrawable + (readyCashh * (44.5/100));
                        passRef_fin.level2.constantWithdrawable = passRef_fin.level2.constantWithdrawable + (readyCashh * (44.5/100));

                        passRef_fin.save((err)=>{
                            if(err)console.log(err);
                            else{
                                PassiveRef.findOne({upperRef: passRef_fin.userId, userId: directReferingUser_fin}, (err, passiveRef)=>{
                                    if(err)console.log(err);
                                    else{
                                        let passiveIndex = indexByParams(passiveRef.passiveDowns, "RefNum", req.user.userId);

                                        passiveRef.passiveDowns[passiveIndex].level1 = "Pass";

                                        passiveRef.save((err)=>{
                                            if(err)console.log(err);
                                            else{
                                                console.log("info saved to the PASSIVE REFERING USER'S FINANCE collection ")

                                                return next()
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
    }else return next();
}

exports.MyFinanceL2 = (req, res, next)=>{
    Finance.findOne({userId : req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }
        else if(NumOfDRefPassL1 + NumOfPRefPassL1 == 20){
            finance.packageComplete = true;

            finance.save(err=>{
                if(err)console.log(err);
                else if(!getPay2){
                    finishedWithdrawable = `₦ ${finance.level2.Withdrawable}`;
                    readyToPromote = true;
                    return next();
                }else if(getPay2){
                    finishedWithdrawable = `₦ ${finance.level2.Withdrawable}`;
                    readyToPromote = false;
                    return next();
                }
            })
        }
        else if(NumOfDRefPassL1 + NumOfPRefPassL1 !== 20){
            finishedWithdrawable = `₦ 0`;
            readyToPromote = false
            return next();
        }
    });
}

exports.purgeUser = (req, res, next)=>{
    if(!readyToPromote)return next();
    else if(readyToPromote){
        User.findOne({userId: req.user.userId}, (err, user)=>{
            user.refererId = "";

            user.save((err)=>{
                if(err)console.log(err);
                else{
                    console.log("The User collection is purged because package completed");
                    return next();
                }
            });
        });
    }
}

exports.purgeFinance = (req, res, next)=>{
    if(!readyToPromote)return next();
    else if(readyToPromote){
        Finance.findOne({userId: req.user.userId}, (err, finance)=>{
            finance.refererId = "";
            finance.level1.totalAmount = 0;
            finance.level1.startup = 0;
            finance.level1.tBank = 0;
            finance.level1.Withdrawable = 0;
            finance.level1.constantWithdrawable = 0;
            finance.level2.totalAmount = 0;
            finance.level2.startup = 0;
            finance.level2.tBank = 0;
            finance.level2.Withdrawable = 0;
            finance.level2.constantWithdrawable = 0;
            finance.packageType = "";
            finance.packageAmount = 0;
            finance.paymentMade = false;

            finance.save((err)=>{
                if(err)console.log(err);
                else{
                    console.log("The Finance collection is purged because package completed");
                    return next();
                }
            });
        });
    }
}

exports.purgeDirectRef = (req, res, next)=>{
    if(!readyToPromote)return next();
    else if(readyToPromote){
        DirectRef.remove({userId: req.user.userId}, (err, directRef)=>{
            if(err)console.log(err);
            else{
                console.log("The DirectRef collection is removed because package completed");
                return next();
            }
        });
    }
}

exports.purgePassiveRef = (req, res, next)=>{
    if(!readyToPromote)return next();
    else if(readyToPromote){
        PassiveRef.remove({upperRef: req.user.userId}, (err, passiveRef)=>{
            if(err)console.log(err);
            else{
                console.log("The PassiveRef collectionS is removed because package completed")
                return next();
            }
        });
    }
}

exports.getPayParams = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            financeID = `GetPay/trav/${finance.userId}`;
            payLevel1 = finance.getPay.level1;
            payLevel2 = finance.getPay.level2;
            postPayL1 = finance.getPay.level1 > 0 ? 0 : finance.level1.Withdrawable;
            postPayL2 = finance.getPay.level2 > 0 ? 0 : finance.level2.Withdrawable;
            totalPay = payLevel1 + payLevel2;
            
            return next();
        }
    })
}

exports.matchCheck = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            Finance.findOne({userId : finance.refererId.slice(9)}, (err, upRefFinance)=>{
                if(err)console.log(err);
                else if(!upRefFinance){
                    ownFinance = finance;
                    refMatch = true;
                    return next();
                }else if(upRefFinance){
                    if(req.params.name.toLowerCase() !== upRefFinance.packageType.toLowerCase()){
                        ownFinance = false;
                        refMatch = false;
                        req.flash("matchCheck", `<div class="callout callout-danger"><p>You have to pick thesame package as the user that referred you. Your referral package is <strong class="text-info">${upRefFinance.packageType.toUpperCase()}</strong></p></div>`);
                        return next();
                    }else if(req.params.name.toLowerCase() == upRefFinance.packageType.toLowerCase()){
                        ownFinance = finance;
                        refMatch = true;
                        return next();
                    }
                }
            });
        }
    });
}

exports.finStatement = (req, res, next)=>{
    Finance.findOne({userId: req.user.userId}, (err, finance)=>{
        if(err){
            console.log(err);
            return next();
        }else{
            WithdrawableL1 = finance.level1.constantWithdrawable ? Math.round( finance.level1.constantWithdrawable * 10 ) / 10 : 0;
            WithdrawableL2 = finance.level2.constantWithdrawable ? Math.round( finance.level2.constantWithdrawable * 10 ) / 10 : 0;
            totalWithdraw = WithdrawableL1 + WithdrawableL2;
            tBankL1 = finance.level1.tBank ? Math.round( finance.level1.tBank * 10 ) / 10 : 0;
            tBankL2 = finance.level2.tBank ? Math.round( finance.level2.tBank * 10 ) / 10 : 0;
            totalTBank = tBankL1 + tBankL2;
            totalAmountL1 = WithdrawableL1 + tBankL1;
            totalAmountL2 = WithdrawableL2 + tBankL2;
            sumTotalAmount = totalAmountL1 + totalAmountL2;
            startupCap = finance.paymentMade == true ? "Paid" : "In Progress";
            startupProgress = finance.paymentMade == true ? `<span class=" text-info fa fa-check"></span>` : `<strong class="text-success">. . .</strong>`;
            withdrawStatusL1 = PaidPass + numOfPaidRef == 20 && finance.level1.Withdrawable == 0 ? "Paid" : "In Progress";
            withdrawStatusL1Progress = PaidPass + numOfPaidRef == 20 && finance.level1.Withdrawable == 0 ? `<span class=" text-info fa fa-check"></span>` : `<strong class="text-success">. . .</strong>`;
            withdrawStatusL2 = NumOfDRefPassL1 + NumOfPRefPassL1 == 20 && finance.level2.Withdrawable == 0 ? "Paid" : "In Progress";
            withdrawStatusL2Progress = NumOfDRefPassL1 + NumOfPRefPassL1 == 20 && finance.level2.Withdrawable == 0 ? `<span class=" text-info fa fa-check"></span>` : `<strong class="text-success">. . .</strong>`;
            return next();
        }
    })
}

exports.GetUserBasic = (req, res, next)=>{
    User.findOne({userId: req.params.id}, (err, user)=>{
        if(err){
            console.log(err);
            return next();
        }else if(!user){
            theUser = false;
            return next();
        }else if(user){
            theUser = user;
            return next();
        }
    });
}

exports.GetUserFinance = (req, res, next)=>{
    if(theUser){
        Finance.findOne({userId: theUser.userId}, (err, finance)=>{
            if(err){
                console.log(err);
                return next();
            }else if(!finance){
                thefinance = false;
                return next();
            }else if(finance){
                thefinance = finance;
                level = finance.level2.tBank ? "Level 2" : "Level 1";
                return next();
            }
        });
    }else return next();
}

exports.GetUserDref = (req, res, next)=>{
    if(theUser){
        DirectRef.findOne({userId: theUser.userId}, (err, directRef)=>{
            if(err){
                console.log(err);
                return next();
            }else if(!directRef){
                theDRef = false;
                return next();
            }else if(directRef){
                theDRef = directRef;
                return next();
            }
        });
    }else return next();
}

exports.GetUserPref = (req, res, next)=>{
    if(theUser){
        PassiveRef.findOne({userId: theUser.userId}, (err, passiveRef)=>{
            if(err){
                console.log(err);
                return next();
            }else if(!passiveRef){
                thePRef = false;
                return next();
            }else if(passiveRef){
                thePRef = passiveRef;
                return next();
            }
        });
    }else return next();
}

exports.adminDRefPassL1 = (req, res, next)=>{
    if(theUser){
        DirectRef.aggregate([
            { $unwind : "$downlines" },
            {$match: {
                "userId" : theUser.userId,
                "downlines.level1" : "Pass"
            }},
            {$project: {"downlines": 1, "_id": 0}}
        ], (err, adminDRefpassl1)=>{
            if(err){
                console.log(err);
                return next();
            }else if(!adminDRefpassl1){
                adminNumOfDRefPassL1 = 0;
                return next();
            }else{
                adminNumOfDRefPassL1 = adminDRefpassl1.length;
                return next();
            }
        })
    }else return next();
}

exports.adminPRefPassL1 = (req, res, next)=>{
    if(theUser){
        PassiveRef.aggregate([
            { $unwind : "$passiveDowns" },
            {$match: {
                "upperRef" : theUser.userId,
                "passiveDowns.level1" : "Pass"
            }},
            {$project: {"passiveDowns": 1, "_id": 0}}
        ], (err, adminPRefPassl1)=>{
            if(err){
                console.log(err);
                return next();
            }else if(!adminPRefPassl1){
                adminNumOfPRefPassL1 = 0;
                return next();
            }else{
                adminNumOfPRefPassL1 = adminPRefPassl1.length;
                return next();
            }
        })
    }else return next();
}

exports.getwithdrawnStatus = (req, res, next)=>{
    if(theUser){
        withdrawnStatusL1 = theDRef.paidRef + thePRef.paidRef == 20 && thefinance.level1.Withdrawable == 0 ? "Withdrawn" : "Not Yet withdrawn";
        withdrawnStatusL2 = adminNumOfDRefPassL1 + adminNumOfPRefPassL1 == 20 && thefinance.level2.Withdrawable == 0 ? "Withdrawn" : "Not Yet withdrawn";
        return next();
    }else return next();    
}