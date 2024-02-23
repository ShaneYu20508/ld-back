import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import routeUsers from './routes/users.js'
import routeMissions from './routes/missions.js'
import { StatusCodes } from 'http-status-codes'
import './passport/passport.js'

const app = express()
// app.use 會根據排序才決定請求順序

// 設定允許哪些地方的跨域請求
app.use(cors({
  // origin = 請求的來源
  // callback(錯誤，是否允許)
  origin (origin, callback) {
    // 如果來源是 undefined 、包含 github 、包含 localhost (本機測試)
    if (origin === undefined || origin.includes('github.io') || origin.includes('localhost')) {
      // 沒有錯誤, 允許
      callback(null, true)
    } else {
      // 網域不允許的錯誤
      callback(new Error('CORS'), false)
    }
  }
}))
app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: '拒絕請求'
  })
})

app.use(express.json())
app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: '資料格式錯誤'
  })
})
// 如果請求成功到這行就會進去了
app.use('/users', routeUsers)
app.use('/missions', routeMissions)

// 代表所有請求方式
// * 代表任意路徑
// 任何路徑的所有請求都失敗的話
app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

// 如果雲端伺服器有指定就用指定的，沒有的話就用 4000
app.listen(process.env.PORT || 4000, async () => {
  console.log('伺服器啟動')
  await mongoose.connect(process.env.DB_URL)
  console.log('資料庫連線成功')
})
