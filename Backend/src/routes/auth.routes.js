const express = require('express')
const authController = require('../controller/auth.controller')
const authRoute = express.Router()

authRoute.post('/register' , authController.registerUser)
authRoute.post('/login' , authController.loginUser)

module.exports = authRoute