import { Schema, model } from 'mongoose'

// 定義欄位
const schema = new Schema({
  name: {
    type: String,
    required: [true, '缺少任務標題']
  },
  price: {
    type: Number,
    required: [true, '缺少任務報酬']
  },
  requiredPeople: {
    type: Number,
    required: [true, '缺少需求人數']
  },
  isPublic: {
    type: Boolean,
    required: [true, '缺少任務狀態']
  },
  mailman: {
    type: String,
    required: function() {
      return !this.isPublic;
    }
  },
  description: {
    type: String,
    required: [true, '缺少任務說明']
  },
}, {
  // 出現最近商品建立以及更新的日期
  timestamps: true,
  versionKey: false
})

export default model('products', schema)
