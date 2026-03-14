const express = require('express')
const authController = require('../controller/auth.controller')
const identifyUser = require('../middleware/auth.middleware')
const authRoute = express.Router()

authRoute.post('/register' , authController.registerUser)
authRoute.post('/login' , authController.loginUser)
authRoute.post('/forget-password', authController.forgetPassword)
authRoute.post('/verify-otp', authController.verifyOtp)
authRoute.post('/reset-password', authController.resetPassword)
authRoute.get('/me', identifyUser, authController.getMe)
authRoute.put('/me', identifyUser, authController.updateMe)

module.exports = authRoute