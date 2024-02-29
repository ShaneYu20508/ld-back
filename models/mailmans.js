import { Schema, model, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const schema = new Schema({
  image: {
    type: String,
    required: [true, '缺少幹員圖片']
  },
  account: {
    type: String,
    required: [true, '請輸入帳號'],
    minlength: [4, '帳號長度不符'],
    maxlength: [20, '帳號長度不符'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isAlphanumeric(value)
      },
      message: '帳號格式錯誤'
    }
  },
  code: {
    type: String,
    required: [true, '缺少幹員代號'],
    minlength: [1, '幹員代號長度不符'],
    maxlength: [20, '幹員代號長度不符'],
    unique: true
  },
  email: {
    type: String,
    required: [true, '信箱為必填欄位'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '信箱格式錯誤'
    }
  },
  password: {
    type: String,
    required: [true, '缺少密碼']
  },
  tokens: {
    type: [String]
  },
  experience: {
    type: String
  },
  skills: {
    type: String,
    required: [true, '缺少幹員專長']
  },
  role: {
    type: Number,
    default: UserRole.MAILMAN
  },
  pass: {
    type: Boolean,
    required: [true, '幹員未登錄']
  }
}, {
  timestamps: true,
  versionKey: false
})

schema.virtual('cartQuantity')
  .get(function () {
    return this.cart.reduce((total, current) => {
      return total + current.quantity
    }, 0)
  })

schema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    if (user.password.length < 4 || user.password.length > 20) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼長度不符' }))
      next(error)
      return
    } else {
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('mailmans', schema)
