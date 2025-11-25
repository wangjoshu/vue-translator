// 提供与localStorage交互的组合式函数
// 用于状态持久化
import { ref, watch } from 'vue';

export function useLocalStorage(key, defaultValue) {
  const value = ref(defaultValue)

  // 从localStorage读取初始值
  try {
    const item = window.localStorage.getItem(key)
    if (item) {
      value.value = JSON.parse(item)
    }
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error)
  }

  // 监听变化并保存到localStorage
  watch(value, (newValue) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, { deep: true })

  return value
}