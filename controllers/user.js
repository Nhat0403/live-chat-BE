require('dotenv').config();
const check = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.postSignup = async(req, res, next) => {
  const { name, email, password } = req.query;
  const errors = check.validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg })
  }
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });
    const result = await user.save();
    return res.status(200).json({ 
      message: 'User ' + name + ' created!',
      userId: result._id
    });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    };
    next(err);
  };
};

exports.postLogin = async(req, res, next) => {
  const { email, password } = req.query;
  const errors = check.validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array()[0].msg })
  };
  try {
    const user = await User.findOne({ email: email });
    if(!user) {
      return res.status(422).json({ message: 'Invalid email or password!' });
    };
    const doMatch = await bcrypt.compare(password, user.password);
    if(!doMatch) {
      return res.status(422).json({ message: 'Invalid email or password!' });
    };
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.YOUR_SECRET_KEY);
    return res.status(200).json({ 
      message: 'User ' + user.name + ' logged in!',
      userId: user._id,
      token: token
    });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    };
    next(err);
  };
}