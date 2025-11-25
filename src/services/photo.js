import axios from "axios";

/**
 * @description: 图片服务
 * @param {string} query 查询关键词
 * @return {object} 图片查询结果
 */
export async function fetchPhoto(query) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const url = `${baseURL}/api/pixabay`
    try {
        const params = { query }
        console.log('发送图片请求到后端:', { url, params })
        const res = await axios.post(url, params, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log('图片服务响应:', res.data)
        return res.data
    } catch (error) {
        console.error('调用后端图片服务失败:', error)
        if (error.response) {
            const errorMessage = error.response.data?.error || 
                                error.response.data?.message || 
                                `图片服务错误: ${error.response.status}`
            throw new Error(errorMessage)
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('图片查询超时，请稍后重试')
        } else if (error.request) {
            throw new Error('无法连接到图片服务，请检查后端服务是否启动')
        } else {
            throw new Error(`图片请求失败: ${error.message}`)
        }
    }
}

export default {
    fetchPhoto
}
