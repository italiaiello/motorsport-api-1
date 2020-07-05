const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const knex = require('knex')
const cors = require('cors')
const morgan = require('morgan')

const signin = require('./controllers/signin')
const register = require('./controllers/register')
const profile = require('./controllers/profile')
const auth = require('./middleware/authorization')

const db = knex({
    client: 'pg',
    connection: process.env.POSTGRES_URI
})

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combine'))

app.get('/', (req, res) => res.json("It's working"))

app.post('/signin', signin.signinAuthentication(db, bcrypt))
app.post('/register', (req, res) => register.handleRegister(req, res, db, bcrypt))
app.get('/profile/:id', auth.requireAuth, (req, res) => profile.handleProfileGet(req, res, db))


app.listen(3000, () => {
    console.log(`app is running on port 3000`)
})

