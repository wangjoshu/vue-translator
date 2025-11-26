import axios from 'axios'

/**
 * @description: 词典服务
 * @param {string} word 单词
 * @return {object} 词典查询结果
 */
export async function fetchDictionary(word) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://vue-translator-production.up.railway.app'
  const url = `${baseURL}/api/dictionary`
  
  try {
    const params = { word }
    console.log('发送词典请求到后端:', { url, params })
    
    const res = await axios.post(url, params, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('词典服务响应:', res.data)
    
    // 修复：返回响应数据而不是整个响应对象
    return res.data
    
  } catch (error) {
    console.error('调用后端词典服务失败:', error)
    
    if (error.response) {
      // 后端返回的错误（404、500等）
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          `词典服务错误: ${error.response.status}`
      throw new Error(errorMessage)
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('词典查询超时，请稍后重试')
    } else if (error.request) {
      // 请求发送但无响应
      throw new Error('无法连接到词典服务，请检查后端服务是否启动')
    } else {
      // 其他错误
      throw new Error(`词典请求失败: ${error.message}`)
    }
  }
}

export default {
  fetchDictionary
}