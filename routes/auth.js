const { Router } = require('express')
const regEmail = require('../emails/registration')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator/check')
const User = require('../models/user')
const mail = require('mail')
const router = Router()
const { registerValidators, loginValidator } = require('../utils/validators')

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  })
})

router.post('/login', loginValidator, async (req, res) => {
  try {
    const { email, password } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#login')
    }

    const candidate = await User.findOne({ email })
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save((err) => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Неверный пароль')
        res.redirect('/auth/login')
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/register', registerValidators, async (req, res) => {
  const { email, password, name } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash('registerError', errors.array()[0].msg)
    return res.status(422).redirect('/auth/login#register')
  }

  const hashPassword = await bcrypt.hash(password, 10)
  const user = new User({
    email,
    password: hashPassword,
    name,
    cart: { items: [] },
  })
  await user.save()
  await transporter
    .message(regEmail())
    .body('Node speaks SMTP!')
    .send(function (err) {})

  res.redirect('/auth/login#login')
})

module.exports = router
