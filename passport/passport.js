// 登入 & 驗證
import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import users from '../models/users.js'

// 帳號密碼
// 建立一個叫 login 的驗證方式，使用 passportLocal 的驗證策略
passport.use('login', new passportLocal.Strategy({
  // 設定 username 的欄位
  usernameField: 'account',
  // 設定 password 的欄位
  passwordField: 'password'
  // 執行 async 的 function
}, async (account, password, done) => {
  try {
    // 尋找一個帳號
    const user = await users.findOne({ account })
    // 如果沒有找到，丟出一個錯誤
    if (!user) {
      throw new Error('ACCOUNT')
    }
    // 有找到，檢查密碼有沒有正確(明文密碼, 密文密碼)
    if (!bcrypt.compareSync(password, user.password)) {
    // 如果密碼不正確，再拋出一個錯誤
      throw new Error('PASSWORD')
    }
    return done(null, user, null)
  } catch (error) {
    // 如果錯誤訊息 === '帳號'
    if (error.message === 'ACCOUNT') {
      return done(null, null, { message: '帳號不存在' })
      // 如果錯誤訊息 === '密碼'
    } else if (error.message === 'PASSWORD') {
      return done(null, null, { message: '密碼錯誤' })
      // 如果錯誤訊息皆非以上兩點，則顯示未知錯誤
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))

// jwt 身份驗證
// passport 使用一個新的叫做 jwt 的驗證方式(自己寫的), 使用 JWT 的驗證策略
passport.use('jwt', new passportJWT.Strategy({
  // jwt 是哪來的 (env 檔案內的 JWT_SECRET 資料)
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  // 之後的 callback 才能拿到請求資訊
  passReqToCallback: true,
  // 略過過期檢查(預設)
  ignoreExpiration: true
  // async(請求的資訊, 請求出來的資料, )
}, async (req, payload, done) => {
  try {
    // 檢查過期狀態(自己寫)
    // jwt 過期時間單位是秒，node.js 日期單位是毫秒，所以要 * 1000
    // payload.exp 是 jwt 檢驗出來的過期日期
    // new Date().getTime() 取當下日期
    const expired = payload.exp * 1000 < new Date().getTime()

    /*
      http://localhost:4000/users/test?aaa=111&bbb=2
      req.originalUrl = /users/text=?aaa=111&bbb=2
      req.baseUrl = /users
      req.path = /test
      req.query = { aaa:111, bbb:222 }
    */
    const url = req.baseUrl + req.path
    // 如果過期，且路徑不是 users，且路徑的網址不是使用者的登出的話
    // 只允許 extend (舊換新)以及 logout(登出) 的路徑有過期
    if (expired && url !== '/users/extend' && url !== '/users/logout') {
      // 拋出新錯誤
      throw new Error('EXPIRED')
    }

    // 請求 token
    // 兩種寫法都可以
    // const token = req.headers.authorization.split('')
    const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    // 取到之後去檢查有沒有這個使用者 findOne({ _id:請求出來的_id, tokens:有沒有包含現在這個 token })
    const user = await users.findOne({ _id: payload._id, tokens: token })
    // 如果沒有的話
    if (!user) {
      // 拋出錯誤
      throw new Error('JWT')
    }
    // OK 的話
    // callback 到 middlewares 的 jwt 驗證
    return done(null, { user, token }, null)
    // 錯誤的話回傳錯誤訊息
  } catch (error) {
    if (error.message === 'EXPIRED') {
      return done(null, null, { message: 'JWT 過期' })
    } else if (error.message === 'JWT') {
      return done(null, null, { message: 'JWT 無效' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))
