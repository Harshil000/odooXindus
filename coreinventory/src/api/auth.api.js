import client from './client'

export const loginApi        = (data) => client.post('/auth/login', data)
export const registerApi     = (data) => client.post('/auth/register', data)
export const forgetPasswordApi = (data) => client.post('/auth/forget-password', data)
export const verifyOtpApi    = (data) => client.post('/auth/verify-otp', data)
export const resetPasswordApi  = (data) => client.post('/auth/reset-password', data)
export const getMeApi        = ()     => client.get('/auth/me')
export const updateMeApi     = (data) => client.put('/auth/me', data)
