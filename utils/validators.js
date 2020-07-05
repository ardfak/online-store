const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
  body('email', 'Введите корректный email')
    .isEmail()
    .custom(async (value, req) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject('Такой email уже существует')
        }
      } catch (e) {
        console.log(e)
      }
    })
    .normalizeEmail(),
  body('password', 'Минимальная длинна пароля 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли не совпадают')
      }
      return true
    })
    .trim(),
  body('name')
    .isLength({ min: 3 })
    .withMessage('Имя должно быть минимум 3 символа')
    .trim(),
]

exports.loginValidator = [
  body('email', 'Введите корректный email').normalizeEmail().isEmail(),
  body('password', 'Введите пароль').exists(),
]

exports.courseValidator = [
  body('title')
    .isLength({ min: 3 })
    .withMessage('Минимальная длинна названия 3 символа')
    .trim(),
  body('price').isNumeric().withMessage('Введите корректную цену'),
  body('img', 'Введите корректный url картинки').isURL(),
]
