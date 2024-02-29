import { Schema, model } from 'mongoose'

const schema = new Schema({
  title: {
    type: String,
    required: [true, '請輸入任務標題']
  },
  // publisher: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: [true, '缺少任務發布者']
  // },
  reward: {
    type: Number,
    required: [true, '缺少任務報酬'],
    min: [1, '任務報酬不能小於1']
  },
  description: {
    type: String,
    required: [true, '缺少任務詳情']
  },
  image: {
    type: String,
    required: [true, '缺少商品圖片']
  },
  status: {
    type: String,
    required: [true, '缺少任務狀態'],
    enum: {
      values: ['公開', '私人'],
      message: '任務狀態錯誤'
    }
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('missions', schema)
