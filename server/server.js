// server.js
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

// 正确加载环境变量
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000  // 重要：使用环境变量端口

// 中间件
app.use(cors())
app.use(express.json())

// 静态文件服务 - 生产环境服务Vue构建文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
}

// 从环境变量获取API配置
const BAIDU_APP_ID = process.env.BAIDU_APP_ID
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY
const PIXABAY_KEY = process.env.PIXABAY_KEY

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '翻译服务运行中',
    environment: process.env.NODE_ENV || 'development'
  })
})

// 根路径重定向到前端
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  } else {
    res.json({ 
      message: '开发模式：请访问前端开发服务器',
      frontend_url: 'http://localhost:5173'
    })
  }
})

// 翻译端点（保持不变）
app.post('/api/translate', async (req, res) => {
  try {
    const { q, from = 'auto', to = 'en' } = req.body

    if (!q) {
      return res.status(400).json({ error: '缺少翻译文本' })
    }

    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      return res.status(500).json({ error: '服务器翻译配置错误' })
    }

    // 生成百度API需要的参数
    const salt = Date.now().toString()
    const sign = crypto.createHash('md5').update(BAIDU_APP_ID + q + salt + BAIDU_SECRET_KEY).digest('hex')

    const response = await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate?', 
      new URLSearchParams({
        q,
        from,
        to,
        appid: BAIDU_APP_ID,
        salt,
        sign
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    res.json(response.data)
  } catch (error) {
    console.error('翻译服务错误:', error)
    
    if (error.response) {
      res.status(400).json({ 
        error: '翻译失败', 
        details: error.response.data 
      })
    } else {
      res.status(500).json({ 
        error: '翻译服务内部错误',
        message: error.message 
      })
    }
  }
})

// 英语词典（保持不变）
app.post('/api/dictionary', async (req, res) => {
  try {
    const { word } = req.body
    console.log('收到词典查询请求:', word)
    
    if (!word) {
      return res.status(400).json({ error: '缺少查询单词' })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          error: '未找到该单词的释义',
          word: word
        })
      }
      return res.status(response.status).json({ 
        error: `词典API错误: ${response.status}` 
      })
    }
    
    const data = await response.json()
    console.log('词典查询成功:', word)
    
    res.json({
      success: true,
      data: data
    })
    
  } catch (error) {
    console.error('Dictionary API error:', error)
    
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: '词典查询超时，请稍后重试'
      })
    }
    
    res.status(500).json({ 
      error: '词典服务暂时不可用',
      message: error.message 
    })
  }
})

// 图片获取（保持不变）
app.post('/api/pixabay', async (req, res) => {
  try {
    const { query } = req.body
    const PIXABAY_KEY = process.env.PIXABAY_KEY
    if (!query) {
      return res.status(400).json({ error: '缺少查询参数' })
    }
    if (!PIXABAY_KEY) {
      return res.status(500).json({ error: '服务器图片服务配置错误' })
    }
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_KEY,
        q: query,
        image_type: 'photo',
        per_page: 10
      }
    })
    const images = response.data.hits.map(image => ({
      id: image.id,
      url: image.previewURL
    }))
    res.json({
      success: true,
      data:images
    })
  } catch (error) {
    console.error('图片服务错误:', error)
    res.status(500).json({
      error: '图片服务内部错误',
      message: error.message
    })
  }
})

// SPA路由支持 - 所有未匹配的路由返回前端页面
// 或者更简单的写法
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 翻译后端服务运行在端口: ${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log('📊 API配置状态:')
  console.log(`   - 百度翻译: ${BAIDU_APP_ID ? '已配置' : '未配置'}`)
  console.log(`   - Pixabay: ${PIXABAY_KEY ? '已配置' : '未配置'}`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`📍 生产环境访问: https://你的项目名.railway.app`)
  } else {
    console.log(`📍 本地前端访问: http://localhost:5173`)
    console.log(`📍 本地API访问: http://localhost:${PORT}`)
  }
})