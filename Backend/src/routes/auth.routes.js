const express = require('express')
const authController = require('../controller/auth.controller')
const authRoute = express.Router()

authRoute.post('/register' , authController.registerUser)
authRoute.post('/login' , authController.loginUser)
authRoute.post('/forget-password', authController.forgetPassword)
authRoute.post('/verify-otp', authController.verifyOtp)
authRoute.post('/reset-password', authController.resetPassword)

module.exports = authRoute