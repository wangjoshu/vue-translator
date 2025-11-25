<template>
  <div class="translator-container">
    <!-- 悬浮历史记录按钮 -->
    <button 
      class="floating-history-btn"
      @click="toggleHistory"
      :class="{ active: showHistory }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </button>

    <!-- 历史记录侧边栏 -->
    <transition name="slide">
      <div v-if="showHistory" class="history-sidebar">
        <div class="sidebar-header">
          <h3>翻译历史</h3>
          <button class="close-btn" @click="showHistory = false">×</button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="(record, index) in store.history" 
            :key="record.id"
            class="history-item"
          >
            原文:{{ record.content }}	&#8594; 译文:{{ record.translateContent }}
            <div class="item-actions">
              <button 
                class="action-btn copy-btn"
                @click.stop="copyText(record.content)"
              >
                复制原文
              </button>
              <button 
                class="action-btn copy-btn"
                @click.stop="copyText(record.translateContent)"
              >
                复制译文
              </button>
              <button 
                class="action-btn delete-btn"
                @click.stop="deleteHistory(record.id)"
              >
                删除
              </button>
            </div>
          </div>
          
          <div v-if="store.recordCount === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#ccc">
              <path d="M12 8V12L15 15M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"/>
            </svg>
            <p>暂无翻译历史</p>
          </div>
        </div>
        
        <div class="sidebar-footer">
          <button 
            v-if="store.recordCount > 0"
            class="clear-all-btn"
            @click="clearAllHistory"
          >
            清空所有记录
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHistoryStore } from '@/stores/history'

// 响应式数据
const showHistory = ref(false)
const store = useHistoryStore() 


// 切换历史记录侧边栏
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}


// 复制文本
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 删除单条历史记录
const deleteHistory = (index) => {
  store.removeRecord(index)
}

// 清空所有历史记录
const clearAllHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    store.clearHistory()
  }
}

</script>

<style scoped>
.translator-container {
  position: relative;
}

/* 悬浮按钮样式 */
.floating-history-btn {
  position: fixed;
  top: 30px;
  right: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #9ad0f5;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 999;
  font-size: 14px;
  font-weight: 500;
}

.floating-history-btn:hover {
  background: #62c8eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.floating-history-btn.active {
  background: #65bfe6;
  box-shadow: 0 2px 8px rgba(97, 178, 215, 0.5);
}

.floating-history-btn svg {
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
}

/* 历史记录侧边栏样式 */
.history-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.history-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.history-item:hover {
  border-color: #9ad0f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.language-direction {
  font-size: 12px;
  color: #9ad0f5;
  font-weight: 500;
  margin-bottom: 8px;
}

.original-text {
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
}

.translated-text {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: #e7f3ff;
  border-color: #4dabf7;
  color: #1971c2;
}

.delete-btn:hover {
  background: #e7f3ff;
  border-color: #4dabf7;
  color: #1971c2;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.clear-all-btn {
  width: 100%;
  padding: 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.clear-all-btn:hover {
  background: #ff5252;
}

/* 动画效果 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-history-btn {
    top: 10px;
    right: 10px;
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .btn-text {
    display: none;
  }
  
  .history-sidebar {
    width: 100vw;
  }
  
  .history-item {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .floating-history-btn {
    padding: 8px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    justify-content: center;
  }
  
  .floating-history-btn svg {
    margin: 0;
  }
}
</style>