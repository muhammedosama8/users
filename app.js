const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const app = express()
const userRouter = require('./routers/user')
const port = process.env.PORT || 3000

const multer = require('multer')
const upload = multer({
    dest: 'avatars',
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload on image'))
        }

        cb(undefined, true)
    }
})

app.post('/upload', upload.single('avatar'), (req, res) => {
    res.send()
}, (error, req, res, next) =>{
    res.status(400).send({error: error.message})
})

app.use(express.json())
app.use(userRouter)

app.listen(port, ()=> console.log('Server is up on port ',port))