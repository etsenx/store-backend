const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Incorrect Email Format',
    }
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  avatar: {
    type: String,
    default: 'tripleshop/example'
  },
  privilege: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

module.exports = mongoose.model('user', userSchema);