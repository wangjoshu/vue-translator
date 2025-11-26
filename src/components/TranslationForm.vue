<template>
    <div class="container">
        <LanguageSelector />
        <TranslationHistory />
        <div class="translation-form">
            <div class="box">
                <textarea
                placeholder="Enter text to translate"
                v-model="text"
                @keyup.enter="onEnter"
                >{{ text }}</textarea>
            </div>
            <div class="box">
                <textarea
                placeholder="Translated text will appear here"
                v-model="translatedText"
                readonly
                >{{ translatedText }}</textarea>
            </div>
        </div>
        <TranslationAdd />
    </div>
</template>

<script setup>
// 主要的翻译输入输出界面
import TranslationAdd from './TranslationAdd.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import  TranslationHistory from './TranslationHistory.vue'
import { ref, onMounted, watch } from 'vue'
import { baiduTranslate } from '../services/translationApi'
import { useTranslationStore } from '@/stores/localStorage'
import { useHistoryStore } from '@/stores/history'

const store = useTranslationStore()
const historyStore = useHistoryStore()
const text = ref('') // 用户输入的文本
const translatedText = ref('') // 翻译后的文本
// 监听 source 和 target 的变化
watch(
  () => [store.source, store.target],
  ([newSource, newTarget]) => {
    console.log('Source or Target changed:', newSource, newTarget)
    // 可以在这里触发翻译，或更新其他状态
    if ((text.value) ) {
      onEnter() // 重新翻译当前文本
    }
  }
)

watch(
    () => store.changeContent,
    (newVal) => {
        if ((text.value) ) {
            var temp = text.value
            text.value = translatedText.value
            translatedText.value = temp
        }
    }
)

function onEnter() {
    const t = text.value.trim()
    if (!t) return
    baiduTranslate(t,store.source,store.target).then(res => {
        translatedText.value = res.trans_result[0].dst
        store.setTxt(translatedText.value) //翻译后保存到store
        // 保存到历史记录
        historyStore.addRecord(t,translatedText.value)
    }).catch(err => {
        console.error('Translation error:', err)
    })
}
onMounted(() => {
  // 初始化时获取 source 和 target
  text.value = ''
  translatedText.value = ''
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20px;
  flex-direction: column;
}
.translation-form {
    display: flex;
    flex-direction: row;
    justify-content: center;
    
}   
.box {
    display: flex;
    height: 300px;
    flex: 1;
}
.box textarea {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    border: 2px solid #ccc;
    padding: 5px;
    font-weight: 300;
    font-size: 30px;
    text-align: left; /* 左对齐文本 */
    resize: none;      /* 修改：禁止用户拖动改变大小 */
    overflow: auto;    /* 内容溢出时显示滚动条 */
}

.box textarea:hover {
    outline: none;
    border-color: #9ad0f5;
    box-shadow: 0 0 8px rgba(114, 180, 233, 0.6);
}
/* 响应式设计 - 手机端 */
@media (max-width: 768px) {
    .translation-form {
        flex-direction: column; /* 改为垂直排列 */
        gap: 15px; /* 调整间距 */
    }
    
    .box {
        height: 250px; /* 手机端可以适当调整高度 */
        flex: none; /* 取消flex:1，让高度由内容决定 */
    }
    
    .box textarea {
        font-size: 24px; /* 手机端字体可以稍小一些 */
    }
    
    .container {
        padding: 15px; /* 手机端内边距可以小一些 */
    }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
    .box {
        height: 200px;
    }
    
    .box textarea {
        font-size: 20px;
        padding: 8px;
    }
    
    .container {
        padding: 10px;
    }
}
</style>