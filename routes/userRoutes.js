const express = require('express')
const router = express.Router();

const User = require('./../models/user')
const {jwtAuthMiddleware,generateToken} = require('./../jwt')

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        const newUser = new User(data);

        const savedUser = await newUser.save();
        console.log('data saved');

        const payload = {
            id: savedUser.id
        }
        const token = generateToken(payload);
        console.log("generated token: ",token);

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

        const user = await Person.findOne({aadharCardNumber:aadharCardNumber});

        if(!user || !await user.comparePassword(password)){
            return res.status(401).json({error: 'Invalid username or password'});
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