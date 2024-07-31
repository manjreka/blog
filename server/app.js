const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const database = 'mongodb+srv://ashwarya:ashwarya@cluster0.rjiv1wr.mongodb.net/Blogging?retryWrites=true&w=majority&appName=Cluster0'
const SECRETE_KEY = 'sndbwhgfvchgefgewrvhbfevfrhrefvehvgerfvhervg'

const user = require('./models/user')
const comment = require('./models/comment')
const blog = require('./models/blog')

app.listen(4058, () => {
    console.log('server connected successfully to port 4058')
})

mongoose.connect(database)
.then(() => {
    console.log('Database connected successfully!!')
})
.catch((err) => {
    console.log('err while connecting to DB', err)
})

// api calls 

// registration API 
app.post('/register', async (req, res) => {
    try {
        const { email, name , role,  password, confirmPassword } = req.body
        console.log(req.body)
        const oldUser = await user.findOne({ email })
        console.log(`olduser: ${oldUser}`)
        if (oldUser) {
            return res.status(400).json({ message: 'email already in use' })
        }
        const hasedPassword = await bcrypt.hash(password, 10)
        const hasedConfirmPassword = await bcrypt.hash(confirmPassword, 10)
        const newUser = new user({ email, password: hasedPassword, confirmPassword: hasedConfirmPassword, name, role })

        console.log(`newUser: ${newUser}`)

        if (password !== confirmPassword) {

            return res.status(401).json({ message: 'password not matching confirm password' })

        }

        await newUser.save()
        res.status(201).json({ message: 'user created sccessfully!!' })

    }
    catch (err) {
        res.status(500).json({ error: "error while signing up !!", err })
    }
})

//login API 

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userInfo = await user.findOne({ email })
        console.log(userInfo)
        
        if (!userInfo) {
            return res.status(400).json('Kindly register to login!!')
        }
        

        const passwordValidation = await bcrypt.compare(password, userInfo.password)
        console.log(passwordValidation)

        if (!passwordValidation) {
            return res.status(400).json({ message: 'inValid Password' })
        }

        const token = jwt.sign({ USERID: userInfo._id, role: userInfo.role }, SECRETE_KEY, { expiresIn: '15hr' })


        return res.status(200).json({ message: 'Login Successfull!!', token, userInfo })
    }
    catch (err) {
        return res.status(500).json({ message: 'Err while logging in', err })
    }
})



const userAuthentication = (req, res, next) => {
    let jwtToken;
    //const authHeader = req.headers["Authorization"];
    const authHeader = req.header('Authorization');
    console.log(authHeader)
    if (authHeader !== undefined) {
      //jwtToken = authHeader.split(" ")[1];
      jwtToken = authHeader.replace('Bearer ', '');
      console.log(jwtToken)
    }
    if (jwtToken === undefined) {
      res.status(401);
      res.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, SECRETE_KEY, async (error, payload) => {
        if (error) {
          res.status(401);
          console.log('err')
          res.send("Invalid xox JWT Token");
        } else {
          req.USERID = payload.USERID;
          console.log('next')
          next();
        }
      });
    }
  };

  

//Author permissions 
//Create Blogs 
app.post('/author/blog', userAuthentication,  async (req, res) => {
   try{
    const {USERID} = req
    const {title, content}  =req.body 
    const newBlog = new blog({
        title,
        content,
        userId: USERID,
        comments: []
    })
    await newBlog.save()
    res.status(201).json({message: 'Blog created successfully!!'})
   }
   catch(err){
    console.log(err)
    res.status(500).json({message: 'Internal server error!!'})
   }
})


//Delete Blogs
app.delete('/author/delete/:id', userAuthentication, async(req, res) => {
    try{
        const {id} = req.params
        const deleteBlog = await blog.findOneAndDelete({_id: id})
        if (!deleteBlog){
            return res.status(401).json({message: "no blog found"})
        }
        return res.status(201).json({message: 'blog deleted successfully!!'})

    }
    catch(err){
        return res.status(500).json({message: 'error while deleting info', err})
    }
})

//displayBlogs 
app.get('/author/blog', userAuthentication, async(req, res) => {
    try{
        const blogsToDisplay = await blog.find()
        if (!blogsToDisplay){
            return res.status(401).json({message: 'no blogs found'})
        }
        res.status(201).json(blogsToDisplay)
    }
    catch(err){
        res.status(500).json({message: 'err while fetching data from server', err})
    }
})

//editBlogs 
app.put('/author/update/:id', userAuthentication, async(req, res) => {
    try{
        const {id} = req.params
        const blogToEdit = await blog.findByIdAndUpdate(id, req.body)
        if (!blogToEdit){
            return res.status(401).json({message: "no blog found"})

        }
        return res.status(200).json({message: 'blog edited successfully!!'})
    }
    catch(err){
        res.status(500).json({message: 'err while fetching data from server', err})
    }
})
