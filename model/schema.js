let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let userSchema = new Schema({
    username : {type: String, unique: true},
    email : {type: String, unique: true},
    password: String,
    userId: String,
    refererId: String,
    firstname : String,
    lastname : String,
    address : String,
    DOB : String,
    gender: String,
    phone : String,
    profilePic : String,
    eVerCode : String,
    eVerified : Boolean,
});

let financeSchema = new Schema({
    userId: String,
    refererId: String,
    finCode : String,
    level1 : {
        totalAmount : Number,
        startup : Number,
        tBank : Number,
        Withdrawable : Number,
        constantWithdrawable : Number
    },
    level2 : {
        totalAmount : Number,
        startup : Number,
        tBank : Number,
        Withdrawable : Number,
        constantWithdrawable : Number
    },
    getPay : {
        bankName: String,
        accNum : String,
        accName : String,
        bvn : String,
        level1: Number,
        level2:  Number
    },
    packageType : String,
    packageAmount : Number,
    paymentMade : Boolean,
    packageComplete : Boolean
});

let dRefSchema = new Schema({
    userId : String,
    paidRef : Number,
    downlines : [
        {
            firstname : String,
            lastname : String,
            RefNum : String,
            img : String,
            startupPaid: Boolean,
            level1 : String
        }
    ]
});

let PRefSchema = new Schema({
    upperRef : String,
    userId : String,
    paidRef : Number,
    passiveDowns: [
        {
            firstname : String,
            lastname : String,
            RefNum : String,
            img : String,
            startupPaid: Boolean,
            level1 : String
        }
    ]
});

let AdminSchema = new Schema({
    username : String,
    password : String,
})

exports.User = mongoose.model("User", userSchema);
exports.Finance = mongoose.model("Finance", financeSchema);
exports.DirectRef = mongoose.model("DirectRef", dRefSchema);
exports.PassiveRef = mongoose.model("PassiveRef", PRefSchema);
exports.Admin = mongoose.model("Admin", AdminSchema);