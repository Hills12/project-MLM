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
    bankName: String,
    accNum : String,
    accName : String,
    finCode : String,
    level1 : {
        level : Number,
        totalAmount : Number,
        startup : Number,
        tBank : Number,
        Withdrawable : Number,
    },
    level2 : {
        level : Number,
        totalAmount : Number,
        startup : Number,
        tBank : Number,
        Withdrawable : Number,
    },
    level3 : {
        level : Number,
        totalAmount : Number,
        startup : Number,
        tBank : Number,
        Withdrawable : Number,
    },
    level4 : {
        level : Number,
        totalAmount : Number,
        startup : Number,
        tBank : Number,
        Withdrawable : Number,
    },
    packageType : String,
    packageAmount : Number,
    paymentMade : Boolean,
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
            level1 : String,
            level2 : String,
            level3 : String,
            level4 : String
        }
    ]
})

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
            level1 : String,
            level2 : String,
            level3 : String,
            level4 : String
        }
    ]
})

exports.User = mongoose.model("User", userSchema);
exports.Finance = mongoose.model("Finance", financeSchema);
exports.DirectRef = mongoose.model("DirectRef", dRefSchema);
exports.PassiveRef = mongoose.model("PassiveRef", PRefSchema);