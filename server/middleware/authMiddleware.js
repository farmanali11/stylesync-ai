const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'stylesync_dev_secret_change_me';

exports.protect = async (req,res,next) =>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({error: 'Unauthorized'});
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if(!user){
        return res.status(401).json({error: 'Unauthorized'});
    }
    req.user = user;
    next();
    }
    catch(error){
        res.status(500).json({error: 'Internal server error', message: error.message});
    }
}