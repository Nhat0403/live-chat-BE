const express = require('express');
const check = require('express-validator');

const User = require('../models/User');
const userController = require('../controllers/user');
const router = express.Router();

router.post(
  '/signup', 
  [
    check.query('email')
      .isEmail().withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if(userDoc) {
              return Promise.reject('Email already exists!');
            };
          });
      })
      .normalizeEmail(),
    check.query('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Please enter a valid password'),
    check.query('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Please enter a valid name')
  ],
  userController.postSignup
);

router.post(
  '/login',
  [
    check.query('email')
      .isEmail().withMessage('Please enter a valid email.')
      .normalizeEmail(),
    check.query('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Please enter a valid password'),
  ],
  userController.postLogin
);

module.exports = router;