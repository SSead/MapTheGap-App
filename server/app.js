require('dotenv').config();

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Database
const database_config = require('./config/database_config')
require('./db/init_db')()


//Middleware
const checkUserAccessToken = (req, res, next) => {
    //Skip for login and register

    if (req.url == '/user/register' || req.url == '/user/login') {
        next()
        return
    }
    //Get token from header
    const token = (req.headers.authorization ? req.headers.authorization.substring(req.headers.authorization.indexOf(' ') + 1) : "")

    //Verify token
    jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
        if (error) {
            //Bad token
            res.status(401).send({
                success: false,
                request_id: Math.random().toString(36).substring(3),

                data: {},
                error: {
                    message: "Unauthorized user"
                }
            })
        } else {
            //Token verified
            req.userId = decoded.id

            next()
            return
        }
    })
}

//Add middleware
app.use(checkUserAccessToken)


//Import routes
const user_routes = require('./routes/user')
const issue_routes =  require('./routes/issue')
const feed_routes = require('./routes/feed')
const user_type_routes = require('./routes/user_type')

//Routes
app.use('/user', user_routes)
app.use('/issue', issue_routes)
app.use('/feed', feed_routes)
app.use('/user_type', user_type_routes)


//Listen port
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})