const express=require('express');
const router=express.Router();
const User=require('../models/User');
const {body, validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const jwtSecret='Mynameisvamshidharreddy3';

//signup route
router.post('/createuser',[
    body('name').isLength({min:3}),
    body('email').isEmail(),
    body('password').isLength({min:5}),
    body('location').isLength({min:3})
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){ 
      return res.status(400).json({ success: false, errors:errors.array()});
    }
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    try{
        const created = await User.create({
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword,
            location:req.body.location               
        })
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: created.id,
                name: created.name,
                email: created.email,
                location: created.location,
            }
        });
    }catch(error){
        console.error('Error creating user:',error);
        if (error && error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        return res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});
//login route
router.post('/login', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
    
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success: true, message: 'Login successful', authToken });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Failed to log in user' });
    }
});

module.exports=router;
