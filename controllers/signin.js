const jwt = require('jsonwebtoken');
const redis = require('redis')

// Setup redis
const redisClient = redis.createClient(process.env.REDIS_URI)

const handleSignIn = ( db, bcrypt, req, res ) => {
    const { email, password } = req.body
    if (!email || !password) {
        return Promise.reject('Incorrect form submission')
    }
    return db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            console.log(data)
            const isValid = bcrypt.compareSync(password, data[0].hash)
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => user[0])
                    .catch(err => Promise.reject('unable to get user'))
            } else {
                Promise.reject('wrong credentials')
            }
        })
        .catch(err => {
            console.log(err)
            return Promise.reject(err)})
}

const getAuthTokenId = (req, res) => {
    const { authorization } = req.headers;
    redisClient.get(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(400).json('Unauthorised')
        }
        return res.json({ id: reply })
    })
}

const signToken = (email) => {
    const jwtPayload = { email }
    return token = jwt.sign(jwtPayload, 'JWT-SECRET', { expiresIn: '2 days' })
}

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value))
}

const createSessions = (user) => {
    const { email, id } = user
    const token = signToken(email)
    return setToken(token, id)
        .then(() => ( {success: true, userId: id, token} ))
        .catch(console.log)
}



const signinAuthentication = (db, bcrypt) => (req, res) => {
    console.log(req.body)
    const { authorization } = req.headers
    return authorization ? getAuthTokenId(req, res) :
    handleSignIn(db, bcrypt, req, res)
    .then(data => {
        return data.id && data.email ? createSessions(data) : Promise.reject(data)
    })
    .then(session => res.json(session))
    .catch(err => res.status(400).json(err))
}

module.exports = {
    signinAuthentication,
    redisClient,
}