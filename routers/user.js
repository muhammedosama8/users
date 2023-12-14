const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_API)

const welcomeFunction = (email, name) => {
    sgMail.send({
        to: email,
        from: 'muhammed.o.nasser@gmail.com',
        subject: 'This is my First Email',
        text: `Welcome ${name} in our app`
    })
}

router.post('/users',(req, res)=>{
    const user = new User(req.body);
    user.save().then(()=> res.status(201).send(user)).catch(e=> res.send(e));
})

router.get('/users', async (req, res)=>{ // auth ,
    console.log(req)
    try{
        User.find({}).then(users=>{
            res.send(users)
        })
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res)=> {
    try{
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.post('/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        welcomeFunction(user.email, user.name)
        res.send({user,token})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/logout', auth, async (req, res) =>{
    try{
        req.user.tokens = req.user.tokens.filter(response=> response.token !== req.token )
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', async (req, res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'name', 'age', 'password']
    const isValid = updates.every(update=> allowedUpdates.includes(update))

    if(!isValid){
        return res.send({error: 'Invalid'})
    }

    try{
        const user = await User.findById(req.params.id)
        updates.forEach(update=> user[update] = req.body[update])
        await user.save()

        res.send(user)
    } catch(e) {res.send(e)}
})

module.exports = router