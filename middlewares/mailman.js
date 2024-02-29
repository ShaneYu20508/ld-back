import UserRole from '../enums/UserRole.js'
import { StatusCodes } from 'http-status-codes'

export default (req, res, next) => {
  if (req.user.role !== UserRole.MAILMAN) {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: '沒有權限'
    })
  } else {
    next()
  }
}
