const mongoose = require('mongoose');
const bcrpt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    // age: { type: Number },
    email: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: { 
        type: String,
        required: true,
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_TOKEN)
    user.tokens = user.tokens.concat({token})

    await user.save()
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.__v

    return userObj
}

userSchema.statics.findByCredentials = async (email , password) =>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('User Not Found')
    }

    const isMatch = await bcrpt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrpt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('users', userSchema)

module.exports = User