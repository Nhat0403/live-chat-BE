const express = require('express');
const check = require('express-validator');
const router = express.Router();

const chatroomsControllers = require('../controllers/chatrooms');
const Chatrooms = require('../models/Chatroom');

router.post(
  '/createNewRoom', 
  [
    check.query('name', 'Invalid Name!')
      .isLength({ min: 5 })
      .trim()
      .custom((value, { req }) => {
        return Chatrooms.findOne({ name: value })
          .then(chatroomsDoc => {
            if(chatroomsDoc) {
              return Promise.reject('Name exists already.');
            };
          })
      })
  ],
  chatroomsControllers.createNewRoom
);

router.get('/getAllChatrooms', chatroomsControllers.getAllChatrooms);
router.get('/getChatroomById', chatroomsControllers.getChatroomById);

module.exports = router;