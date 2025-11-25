// server.js
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import crypto from 'crypto'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.replace(/\\/g, '/').replace(/\/server\.js$/, '');

// 加载环境变量
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

const app = express()
const PORT = 3000 || process.env.PORT

// 中间件
app.use(cors())
app.use(express.json())

// 从环境变量获取百度API配置
const BAIDU_APP_ID = process.env.BAIDU_APP_ID
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '翻译服务运行中' })
})

// 翻译端点
app.post('/api/translate', async (req, res) => {
  try {
    const { q, from = 'auto', to = 'en' } = req.body

    if (!q) {
      return res.status(400).json({ error: '缺少翻译文本' })
    }

    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      return res.status(500).json({ error: '服务器翻译配置错误' })
    }

    // 生成百度API需要的参数 - 使用 crypto 替代 md5
    const salt = Date.now().toString()
    const sign = crypto.createHash('md5').update(BAIDU_APP_ID + q + salt + BAIDU_SECRET_KEY).digest('hex')

    // 调用百度翻译API
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
      // 百度API返回的错误
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

// 英语词典
app.post('/api/dictionary', async (req, res) => {
  try {
    const { word } = req.body
    console.log('收到词典查询请求:', word)
    
    if (!word) {
      return res.status(400).json({ error: '缺少查询单词' })
    }

    // 添加超时设置
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    
    // 修复URL：使用动态单词参数
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      // 根据外部API的错误状态返回相应信息
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
    
    // 修复：通过res.json()返回数据给前端
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
    
    // 修复：确保所有错误路径都有响应
    res.status(500).json({ 
      error: '词典服务暂时不可用',
      message: error.message 
    })
  }
})

// 图片获取
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

app.listen(PORT, () => {
  console.log(`翻译后端服务运行在 http://localhost:${PORT}`)
  console.log('百度API配置:', { 
    appId: BAIDU_APP_ID ? '已配置' : '未配置',
    secretKey: BAIDU_SECRET_KEY ? '已配置' : '未配置' 
  })
})