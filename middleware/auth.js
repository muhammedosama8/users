const User = require('../models/user')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token, process.env.JWT_TOKEN)
        const user = await User.findById({_id: decode._id, 'tokens.token': token})

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({error: 'Authorization Failed.'})   
    }
}

module.exports = auth