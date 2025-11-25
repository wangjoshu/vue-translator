import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 管理用户使用历史记录的 store
export const useHistoryStore = defineStore('history', () => {
  const history = ref([])
  // 添加翻译记录
  const addRecord = (record,translateContent) => {
    history.value.unshift({
      id: Date.now(),
      content:record,
      translateContent:translateContent
    })
    
    // 只保留最近20条记录
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
  }

  // 删除记录
  const removeRecord = (id) => {
    history.value = history.value.filter(item => item.id !== id)
  }

  // 清空记录
  const clearHistory = () => {
    history.value = []
  }

  // 获取记录数量
  const recordCount = computed(() => history.value.length)

  return {
    history,
    addRecord,
    removeRecord,
    clearHistory,
    recordCount
  }
});
