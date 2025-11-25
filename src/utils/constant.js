// 支持的语言列表[15]
export const SUPPORTED_LANGUAGES = {
    'zh': '中文',
    'en': '英语',
    'jp': '日语',
    'kor': '韩语',
    'fra': '法语',
    'spa': '西班牙语',
    'th': '泰语',
    'ara': '阿拉伯语',
    'ru': '俄语',
    'de': '德语',
    'it': '意大利语',
    'pt': '葡萄牙语',
    'el': '希腊语',
    'nl': '荷兰语',
    'pl': '波兰语',
    'bul': '保加利亚语'
}

export default {
    SUPPORTED_LANGUAGES
}

// 翻译服务商
export const TRANSLATION_PROVIDERS = {
    'baidu': '百度翻译'
}

// API 配置[?]
export const API_CONFIG = {
    baidu: {
        baseUrl: 'https://fanyi-api.baidu.com/api/trans/vip/translate?',
        apiKeyEnv: 'VITE_BAIDU_API_KEY'
    }
}