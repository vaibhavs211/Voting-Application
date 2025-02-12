const express = require('express')
const router = express.Router();
const User = require('./../models/user')
const Candidate = require('./../models/candidate')
const {jwtAuthMiddleware,generateToken} = require('./../jwt')

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user.role === 'admin'){
            return true;
        }
    } catch (err) {
        return false;
    }
}

// post route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user has no admin role"})
        }
        const data = req.body;

        const newCandidate = new Candidate(data);

        const savedCandidate = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: savedCandidate});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error" });
    }
})

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user has no admin role"})
        }
        const id = req.params.candidateId;
        const data = req.body;
        const updatedCandidate = await Candidate.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true //run Mongoose validations
        });
        if (!updatedCandidate) {
            res.status(404).json({ error: "Candidate not found" });
        }
        console.log('Candidate data updated');
        res.status(200).json(updatedCandidate);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: "user has no admin role"})
        }
        const id = req.params.candidateId;
        const deletedCandidate = await Candidate.findByIdAndDelete(id);
        if (!deletedCandidate) {
            res.status(404).json({ error: "Candidate not found" });
        }
        console.log('data deleted');
        res.status(200).json({ message: "Candidate deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error" });
    }
});

router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    const candidateId = req.params.candidateId;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            res.status(404).json({message: "candidate not found"});
        }

        const user = await User.findById(userId);
        if(!user){
            res.status(404).json({message: "user not found"});
        }

        if (user.hasVoted){
            res.status(400).json({message: "you have already voted."})
        }
        if(user.role === 'admin'){
            res.status(403).json({message: "admin cannot vote."})
        }

        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        user.hasVoted = true;
        await user.save();

        res.status(200).json({message: "Voted successfully"});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error" });
    }
});

// vote count
router.get('/vote/count', async (req,res) => {
    try {
        const candidate = await Candidate.find().sort({voteCount: 'desc'})
        
        const record = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(record);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error" });
    }
})

router.get('/', async (req, res) => {
    try {
        const candidate = await Candidate.find({}, 'name party -_id');
        res.status(200).json(candidate);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error" });
    }
})

module.exports = router; 