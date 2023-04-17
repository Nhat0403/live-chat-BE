const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = async(req, res, next) => {
  const authHeader = req.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  try {
    if(!token) {
      return res.status(401).send({ message: 'Unauthorization!' });
    }
    await jwt.verify(
      token,
      process.env.YOUR_SECRET_KEY,
      (err, user) => {
        if(err) {
          return res.status(401).send({ message: 'You need to login!' });
        }
        req.user = user;
        next();
      }
    )
  } catch(err) {
    return res.status(401).send({ message: 'Unauthorization!' });
  };
};