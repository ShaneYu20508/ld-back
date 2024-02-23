// 引入產品的 models
import missions from '../models/missions.js'
// 引入狀態碼
import { StatusCodes } from 'http-status-codes'

import validator from 'validator'

export const create = async (req, res) => {
  try {
    // req.file.path 為圖片路徑
    req.body.image = req.file.path
    const result = await missions.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    // 驗證錯誤
    // 與 controllers 資料夾內的 users.js 的驗證錯誤一樣
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      // 若非以上錯誤，則未知
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 只查詢有上架的東西
export const getAll = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    // 設定預設的排序
    const sortOrder = parseInt(req.query.sortOrder) || '-1'
    // 一頁有幾個
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 20
    // 抓第幾頁
    const page = parseInt(req.query.page) || 1
    // 搜尋文字
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await missions
      .find({
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      // const text = 'a'
      // const obj = { [text]: 1 }
      // obj.a = 1
      .sort({ [sortBy]: sortOrder })
      // 如果一頁 10 筆
      // 第 1 頁 = 0 ~ 10 = 跳過 0 筆 = (1 - 1) * 10
      // 第 2 頁 = 11 ~ 20 = 跳過 10 筆 = (2 - 1) * 10
      // 第 3 頁 = 21 ~ 30 = 跳過 20 筆 = (3 - 1) * 10
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage === -1 ? undefined : itemsPerPage)

    // estimatedDocumentCount() 計算總資料數
    const total = await missions.estimatedDocumentCount()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

export const get = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    // 設定預設的排序
    const sortOrder = parseInt(req.query.sortOrder) || -1
    // 一頁有幾個
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 20
    // 抓第幾頁
    const page = parseInt(req.query.page) || 1
    // 搜尋文字
    const regex = new RegExp(req.query.search || '', 'i')

    const data = await missions
      .find({
        // 只看得到有上架的產品
        sell: true,
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      // const text = 'a'
      // const obj = { [text]: 1 }
      // obj.a = 1
      .sort({ [sortBy]: sortOrder })
      // 如果一頁 10 筆
      // 第 1 頁 = 0 ~ 10 = 跳過 0 筆 = (1 - 1) * 10
      // 第 2 頁 = 11 ~ 20 = 跳過 10 筆 = (2 - 1) * 10
      // 第 3 頁 = 21 ~ 30 = 跳過 20 筆 = (3 - 1) * 10
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage === -1 ? undefined : itemsPerPage)

    // estimatedDocumentCount() 計算總資料數，無法進行篩選
    // countDocuments() 依照 () 內篩選計算總資料
    const total = await missions.countDocuments({ sell: true })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 用 ID 尋找單個商品
export const getId = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    const result = await missions.findById(req.params.id)

    if (!result) throw new Error('NOT FOUND')

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無商品'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 編輯商品
export const edit = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // 沒有給圖片的話，給一個 undefined 他就不會更新
    req.body.image = req.file?.path

    // 去 商品的 model.執行以 ID 查詢並更新的指令(搜尋條件: 網址的 id, 更新內容: req.body, {跑驗證}).如果沒查到東西(拋出新錯誤('NOT FOUND'))
    // .orFail 這樣就不用寫一個新的 if
    await missions.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    // ID 錯誤
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
      // 找不到
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無商品'
      })
      // 驗證錯誤
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
      // 其他(code 打錯)
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
