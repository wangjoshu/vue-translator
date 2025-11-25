import axios from 'axios'
import md5 from 'js-md5'

/**
 * 调用后端翻译服务
 * @param {string} q 要翻译的文本
 * @param {string} from 源语言，'auto' 自动检测
 * @param {string} to 目标语言，例如 'en'
 */
export async function baiduTranslate(q, from = 'auto', to = 'en') {
  // 使用后端服务的API地址
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  const url = `${baseURL}/api/translate`
  
  try {
    const params = {
      q: q,
      from: from,
      to: to
    }

    console.log('发送翻译请求到后端:', { url, params })
    
    const res = await axios.post(url, params, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('后端返回数据:', res.data)
    return res.data
  } catch (error) {
    console.error('调用后端翻译服务失败:', error)
    if (error.response) {
      // 后端返回的错误
      throw new Error(`翻译服务错误: ${error.response.data?.message || error.response.status}`)
    } else if (error.request) {
      // 请求发送但无响应
      throw new Error('无法连接到翻译服务，请检查后端服务是否启动')
    } else {
      // 其他错误
      throw new Error(`翻译请求失败: ${error.message}`)
    }
  }
}

/**
 * 健康检查 - 检查后端服务是否可用
 */
export async function checkTranslationService() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  try {
    const response = await axios.get(`${baseURL}/api/health`, { timeout: 5000 })
    return response.data
  } catch (error) {
    throw new Error('后端翻译服务不可用')
  }
}

export default {
  baiduTranslate,
  checkTranslationService
}