<template>
  <div id="app" class="add_container">
    <div class="word-card" v-if="temp">
      <div class="header">
        <div>
          <div class="word">
            {{ content }}
            <span class="language-indicator">{{ currentLanguage }}</span>
          </div>
          <div class="phonetic" v-if="phonetics && currentLanguage === '英语'">
            {{ phonetics }}
            <button class="audio-btn" @click="playAudio" v-if="audioUrl">
              <svg viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="content">
        <!-- 图片区域 - 使用浮动 -->
        <div class="image-wrapper">
          <div class="image-box">
            <slot name="image">
              <img v-if="imageUrl" :src="imageUrl" alt="image" />
              <div v-else class="placeholder">图片位置</div>
            </slot>
          </div>
        </div>

        <!-- 文字内容区域 -->
        <div class="text-content">
          <div v-if="currentLanguage === '英语'">
            <div class="section" v-for="(meaning, idx) in meanings" :key="idx">
              <div class="part">{{ meaning.partOfSpeech }}</div>
              <ul>
                <li v-for="(d, i) in meaning.definitions.slice(0,5)" :key="i">
                  {{ d.definition }}
                  <div class="example" v-if="d.example">例：{{ d.example }}</div>
                </li>
              </ul>
            </div>
          </div>
          
          <div v-else class="non-english-note">
            <p>当前语言为 {{ currentLanguage }}，此模块主要提供图片辅助理解。</p>
          </div>
        </div>

      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useTranslationStore } from '@/stores/localStorage'
import { SUPPORTED_LANGUAGES } from '@/utils/constant'
import { fetchDictionary } from '@/services/dic'
import { fetchPhoto } from '@/services/photo'
// 使用 ref 创建响应式数据

const store = useTranslationStore()
const temp = ref(false)
const loading = ref(false)
const currentLanguage = computed(() => SUPPORTED_LANGUAGES[store.target] || '')
const content = ref('')
const audioUrl = ref('')
const phonetics = ref('')
const meanings = ref([])
const imageUrl = ref('')
// 添加调试信息
onMounted(() => {
  console.log('组件挂载，初始状态:')
  console.log('store.txt:', store.txt)
  console.log('store.target:', store.target)
  console.log('currentLanguage:', currentLanguage.value)
})

// 修复监听器语法错误
watch(
  () => [store.txt, currentLanguage.value],
  ([newTxt, newLang]) => {
    console.log('store.txt 变化:', newTxt)
    console.log('currentLanguage 变化:', newLang)
    
    // 检查条件：有内容且目标语言是英语
    if (newTxt && newTxt.trim() && newLang === '英语') {
      console.log('满足条件，发起词典查询:', newTxt)
      loadDictionary(newTxt)
    } else {
      console.log('不满足条件，重置状态')
      temp.value = false
      content.value = ''
      phonetics.value = ''
      audioUrl.value = ''
      meanings.value = []
      loading.value = false
    }
  },
  { immediate: true }
)

// 从字典 API 拉取并赋值到 refs
async function loadDictionary(word) {
  // 如果单词为空或太短，不进行查询
  if (!word || word.trim().length < 1) {
    temp.value = false
    loading.value = false
    return
  }
  try {
    loading.value = true
    const data = await fetchDictionary(word)
    console.log('收到的词典数据:', data)
    
    // 检查返回的数据结构
    if (data.success && data.data) {
      // 后端包装过的数据结构
      const item = Array.isArray(data.data) ? data.data[0] : data.data
      content.value = item?.word || word
      phonetics.value = (item?.phonetics && item.phonetics[0]?.text) || ''
      audioUrl.value = (item?.phonetics && item.phonetics.find(p => p.audio)?.audio) || ''
      meanings.value = item?.meanings || []
      temp.value = true
    } else if (Array.isArray(data)) {
      // 原始字典API数据结构（兼容旧版本）
      const item = data[0]
      content.value = item?.word || word
      phonetics.value = (item?.phonetics && item.phonetics[0]?.text) || ''
      audioUrl.value = (item?.phonetics && item.phonetics.find(p => p.audio)?.audio) || ''
      meanings.value = item?.meanings || []
      temp.value = true
    } else {
      console.log('无有效的词典数据')
      temp.value = false
    }
    
    // 图片 URL 示例
    if (temp.value) {
      fetchPhoto(content.value).then(image => {
        var num = Math.floor(Math.random() * 10);
        console.log("随机数："+num);
        imageUrl.value = image.data[num].url
      }).catch(err => {
        console.error('Error fetching image:', err)
        imageUrl.value = ref('https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')
      }) 
    } else {
        imageUrl.value = ref('https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60')
    }  
  } catch (err) {
    console.error('Error fetching dictionary data:', err)
    temp.value = false
  } finally {
    loading.value = false
  }
}


// 方法
const playAudio = () => {
  if (audioUrl.value) {
    const audio = new Audio(audioUrl.value)
    audio.play()
  }
}


    
</script>

<style scoped>
.add_container {
    width: 100%;
    margin: 0 auto;
    margin-top: 30px;
}

.word-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}


.header {
    background: linear-gradient(135deg, #37acdf 0%, #2575fc 100%);
    color: white;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.word {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.phonetic {
    font-size: 18px;
    opacity: 0.9;
    display: flex;
    align-items: center;
    gap: 10px;
}

.audio-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.audio-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.audio-btn svg {
    width: 18px;
    height: 18px;
    fill: white;
}

.content {
  position: relative;
  padding: 24px;
}

.left {
  /* 移除 flex 相关属性 */
  margin-right: 300px; /* 为图片留出空间 */
}


.image-box {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 200px;
  text-align: center;
  background: #f9f9f9;
}

/* 清除浮动，确保后续内容正常排列 */
.content::after {
  content: "";
  display: table;
  clear: both;
}

.section {
    margin-bottom: 24px;
}

.part {
    font-size: 18px;
    font-weight: 600;
    color: #6fc0e3;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #eaeaea;
}

ul {
    list-style: none;
    padding-left: 16px;
}

li {
    margin-bottom: 12px;
    padding-left: 16px;
    position: relative;
    line-height: 1.5;
}

li:before {
    content: "•";
    color: #78cde7;
    position: absolute;
    left: 0;
}

.example {
    font-style: italic;
    color: #666;
    margin-top: 6px;
    padding-left: 8px;
    border-left: 2px solid #eaeaea;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #63a4e9;
    margin-bottom: 12px;
}


.image-box img {
    width: auto; /* 改为自动宽度，不拉伸 */
    height: 100%; /* 高度100%保持比例 */
    max-width: 100%; /* 防止超出容器 */
    object-fit: contain; /* 保持比例，不拉伸 */
    object-position: top right; /* 图片定位在右上角 */
}


.placeholder {
    color: #999;
    text-align: center;
    padding: 40px 20px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.language-indicator {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    margin-left: 12px;
}

.non-english-note {
    background: #f0f7ff;
    border-left: 4px solid #2575fc;
    padding: 16px;
    margin-top: 20px;
    border-radius: 4px;
    font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .content {
    flex-direction: column;
    }
    
    .right {
    width: 100%;
    }
    
    .image-box {
    height: 200px;
    }
}
</style>