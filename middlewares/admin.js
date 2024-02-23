// 判斷使用者是否為管理員
// 引入帳號權限
import UserRole from '../enums/UserRole.js'
// 引入狀態碼
import { StatusCodes } from 'http-status-codes'

export default (req, res, next) => {
  // 如果不是管理員
  if (req.user.role !== UserRole.ADMIN) {
    // 回應 '沒有權限'
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: '沒有權限'
    })
    // 是管理員，進行下一步
  } else {
    next()
  }
}
