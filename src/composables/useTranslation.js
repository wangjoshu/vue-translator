/**
 * 封装翻译核心逻辑
 * 使用ref和computed管理翻译状态
 * 处理翻译请求和结果
 */
import { ref } from 'vue'
import { translationApi } from '../services/translationApi.js'
import { useHistoryStore } from '../stores/history.js'
import { useSettingStore } from '../stores/setting.js'

export function useTranslation() {
  const loading = ref(false)
  const error = ref('')
  const result = ref(null)
  
  const historyStore = useHistoryStore()
  const settingStore = useSettingStore()

  const translate = async (text, targetLang, sourceLang = 'auto', service = null) => {
    if (!text.trim()) {
      error.value = '请输入要翻译的文本'
      return
    }

    loading.value = true
    error.value = ''
    result.value = null

    try {
      const translationService = service || settingStore.defaultService
      const response = await translationApi.translate(
        text.trim(),
        targetLang,
        sourceLang,
        translationService
      )

      result.value = response

      // 保存到历史记录
      historyStore.addRecord({
        originalText: text,
        translatedText: response.translated_text,
        sourceLang: response.source_lang,
        targetLang: response.target_lang,
        service: response.service
      })

      // 自动复制到剪贴板
      if (settingStore.autoCopy) {
        navigator.clipboard.writeText(response.translated_text)
      }

    } catch (err) {
      error.value = err.response?.data?.detail || err.message || '翻译失败，请重试'
    } finally {
      loading.value = false
    }
  }

  const clearResult = () => {
    result.value = null
    error.value = ''
  }

  return {
    loading,
    error,
    result,
    translate,
    clearResult
  }
}