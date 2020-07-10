const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const homeRoutes = require('./routes/home')
const flash = require('connect-flash')
const session = require('express-session')
const cardRoutes = require('./routes/card')
const addRoutes = require('./routes/add')
const MongoStore = require('connect-mongodb-session')(session)
const authRoutes = require('./routes/auth')
const errorHandle = require('./middleware/error')
const coursesRoutes = require('./routes/courses')
const ordersRoutes = require('./routes/orders')
const helmet = require('helmet')
const csrf = require('csurf')
const varMiddleware = require('./middleware/variables')
const keys = require('./keys')
const fileMiddleware = require('./middleware/file')
const userMiddleware = require('./middleware/user')
const compression = require('compression')
const profileRoutes = require('./routes/profile')

const app = express()
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helper')
})

const store = new MongoStore({
  collections: 'session',
  uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
)
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandle)

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false
    })

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()
