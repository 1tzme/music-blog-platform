require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Validator = require('validatorjs');
const {User} = require('./db');

const secret = process.env.jwt_secret_key;

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({message:'No token provided'});

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({message:'Invalid token: ' + err.message});
    }
};

const register = async (req, res) => {
    try {
        const {email, password, username} = req.body;

        const validation = new Validator({email, password, username}, {
            email: 'required|email',
            password: 'required|min:8',
            username: 'required'
        });

        if (validation.fails()) {
            return res.status(400).json({message: 'Validation failed', errors: validation.errors.all()});
        }

        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            return res.status(400).json({message:'Email or username already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({email, password: hashedPassword, username});
        await user.save();
        res.status(201).json({message:'User registered successfully'});
    } catch (error) {
        res.status(500).json({message:'Failed to register user: ' + error.message});
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const validation = new Validator({email, password}, {
            email: 'required|email',
            password: 'required|min:8'
        });

        if (validation.fails()) {
            return res.status(400).json({message: 'Validation failed', errors: validation.errors.all()});
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const token = jwt.sign({id: user._id, username: user.username}, secret, {expiresIn: '1h'});
        res.json({token});
    } catch (error) {
        res.status(500).json({message:'Failed to login: ' + error.message});
    }
};

module.exports = {authMiddleware, register, login};