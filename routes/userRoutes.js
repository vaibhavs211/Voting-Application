const express = require('express')
const router = express.Router();

const User = require('./../models/user')
const {jwtAuthMiddleware,generateToken} = require('./../jwt')

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        const newUser = new User(data);

        const savedUser = await newUser.save();
        console.log('data saved');

        const payload = {
            id: savedUser.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({response: savedUser, token: token});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error" });
    }
})

// User Login
router.post('/login', async (req,res) => {
    try {
        const {aadharCardNumber, password} = req.body;

        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        const user = await User.findOne({aadharCardNumber:aadharCardNumber});

        if(!user || !await user.comparePassword(password)){
            return res.status(401).json({error: 'Invalid Aadhar or password'});
        }

        // generate tokens
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        res.json({token: token});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error'});
    }
});

router.get('/profile', jwtAuthMiddleware, async (req,res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Error'});
    }
})

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user; // Extract the id from token
        const {currentPassword, newPassword} = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }
        
        const user = await User.findById(userId);
        
        if(!user || !await user.comparePassword(currentPassword)){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: "Password Updated"});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})


module.exports = router; 