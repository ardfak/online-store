const { Router } = require('express')
const regEmail = require('../emails/registration')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const mail = require('mail')
const router = Router()

const userEmail = 'bagavdin0122@gmail.com'
const userPassword = 'ardfac0122'

const transporter = mail.Mail({
  host: 'smtp.gmail.com',
  username: userEmail,
  password: userPassword
})

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

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

router.post('/register', async (req, res) => {
  const { email, password, confirm, name } = req.body

  const candidate = await User.findOne({ email })

  if (candidate) {
    req.flash('registerError', 'Пользователь с таким email уже существует')
    res.redirect('/auth/login#register')
  } else {
    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email,
      password: hashPassword,
      name,
      cart: { items: [] }
    })
    await user.save()
    await transporter
      .message(regEmail())
      .body('Node speaks SMTP!')
      .send(function (err) {})

    res.redirect('/auth/login#login')
  }
})

module.exports = router
