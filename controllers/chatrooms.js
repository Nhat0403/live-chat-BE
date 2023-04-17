const check = require('express-validator');
const Chatroom = require('../models/Chatroom');

exports.createNewRoom = async(req, res, next) => {
  const { name } = req.query;
  const errors = check.validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg });
  };
  const chatroom = new Chatroom({
    name: name,
    content: [
      {
        userId: req.user.id,
        username: req.user.name,
        message: "==NEW ROOM=="
      }
    ]
  });
  try {
    await chatroom.save();
    return res.status(200).json({ message: 'Chatroom ' + name + ' created!', chatroom: chatroom });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    };
    next(err);
  };
};

exports.getAllChatrooms = async(req, res, next) => {
  const chatrooms = await Chatroom.find();
  return res.status(200).json({ message: 'Fetch success', chatrooms: chatrooms });
};

exports.getChatroomById = async(req, res, next) => {
  const { chatroomId } = req.query;
  try {
    const chatroom = await Chatroom.findById(chatroomId);
    if(!chatroom) {
      return res.status(422).json({ message: 'Chatroom not found!' });
    };
    console.log('get chat room:');
    console.log(req.query);
    return res.status(200).json({ chatroom: chatroom });
  } catch(err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    };
    next(err);
  }
}