// 檔案上傳
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { StatusCodes } from 'http-status-codes'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const upload = multer({
  // 上傳設定
  storage: new CloudinaryStorage({ cloudinary }),
  // 限制可以上傳的檔案類型(請求的資訊, 上傳的檔案資訊, 判斷使否允許檔案)
  fileFilter (req, file, callback) {
    // 如果有包含 file 的檔案類型
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      // (沒有錯誤, 允許通過)
      callback(null, true)
    } else {
      // (新的套件錯誤(錯誤代碼))
      callback(new multer.MulterError('LIMIT_FILE_FORMAT'), false)
    }
  },
  // 限制檔案大小
  limits: {
    fileSize: 1024 * 1024
  }
})

export default (req, res, next) => {
  upload.single('image')(req, res, error => {
    // 如果是套件錯誤
    if (error instanceof multer.MulterError) {
      let message = '上傳錯誤'
      // 如果錯誤的 code 叫做'LIMIT_FILE_SIZE'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大'
      } else if (error.code === 'LIMIT_FILE_FORMAT') {
        message = '檔案格式錯誤'
      }
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
      // 如果還有其他錯誤
    } else if (error) {
      // 每個地方都設定檢查錯誤後續 debug 會比較方便
      console.log(error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
      // 沒有問題就進行下一步
    } else {
      next()
    }
  })
}
