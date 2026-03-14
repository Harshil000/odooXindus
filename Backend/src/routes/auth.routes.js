const express = require('express')
const authController = require('../controller/auth.controller')
const authRoute = express.Router()

authRoute.post('/register' , authController.registerUser)
authRoute.post('/login' , authController.loginUser)
authRoute.post('/forget-password', authController.forgetPassword)

module.exports = authRoute