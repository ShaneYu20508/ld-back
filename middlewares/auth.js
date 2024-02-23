import passport from 'passport'
import { StatusCodes } from 'http-status-codes'
// 判斷是否為套件錯誤
import jsonwebtoken from 'jsonwebtoken'

export const login = (req, res, next) => {
  // passport 驗證
  // 此處 'login' 為 passport.js 內建立的 login 驗證方式
  passport.authenticate('login', { session: false }, (error, user, info) => {
    // 如果沒有使用者或是有錯誤
    if (!user || error) {
      // 檢查錯誤
      // info.message === '缺少欄位' (此為套件錯誤)
      if (info.message === 'Missing credentials') {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '欄位錯誤'
        })
        return
      } else if (info.message === '未知錯誤') {
        // INTERNAL_SERVER_ERROR 內部伺服器錯誤 (自己的問題, code 出錯)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '未知錯誤'
        })
        return
      } else {
        // 此為正常錯誤
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: info.message
        })
        return
      }
    }
    req.user = user
    next()
  })(req, res, next)
}

// passport 的登入驗證完成後跳過來執行這邊
export const jwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, data, info) => {
    // 如果有錯或沒有資料
    if (error || !data) {
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        // JWT 格式不對、SECRET 不對
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'JWT 無效'
        })
      } else if (info.message === '未知錯誤') {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: '未知錯誤'
        })
      } else {
        // 其他錯誤
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: info.message
        })
      }
      return
    }
    req.user = data.user
    req.token = data.token
    // 都沒問題後 next 到下一步
    next()
  })(req, res, next)
}
