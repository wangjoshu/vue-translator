import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingStore = defineStore('setting', () => {
  const defaultService = ref('baidu')
  const autoCopy = ref(false)
  const showHistory = ref(true)
  const theme = ref('light')

  // 服务提供商显示名称
  const serviceName = computed(() => {
    const services = {
      'baidu': '百度翻译'
    }
    return services[defaultService.value] || '百度翻译'
  })

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    defaultService,
    autoCopy,
    showHistory,
    theme,
    serviceName,
    toggleTheme
  }
});