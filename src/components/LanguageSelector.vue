<template>
    <div class="language-selector-container">
        <div class="language-selector">
            <div class="ellipse-container" @click="toggleSourceDropdown" tabindex="0" @keydown.enter="toggleSourceDropdown" @keydown.space="toggleSourceDropdown">
                <div style="display: flex; align-items: center;">
                    <div class="language-flag" :style="{ backgroundImage: `url(${sourceLanguage.flag})` }"></div>
                    <span class="language-name">{{ sourceLanguage.name }}</span>    
                </div>
                <span class="dropdown-arrow" :class="{ open: isSourceOpen }">▼</span>
            </div>
            <div class="dropdown-menu" :class="{ open: isSourceOpen }">
                <div class="language-option" 
                        v-for="lang in filteredSourceLanguages" 
                        :key="lang.code" 
                        @click="selectSourceLanguage(lang)" 
                        :class="{ active: lang.code === sourceLanguage.code }">
                    <div class="language-flag" :style="{ backgroundImage: `url(${lang.flag})` }"></div>
                    <span>{{ lang.name }}</span>
                </div>
            </div>
        </div>
        
        <div class="swap-button" @click="swapLanguages" tabindex="0" @keydown.enter="swapLanguages" @keydown.space="swapLanguages">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="center" stroke="currentColor" stroke-width="2">
                <path d="M7 16l-4-4m0 0l4-4m-4 4h18m-4 4l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
        </div>
       
        

        <div class="language-selector">
            <div class="ellipse-container" @click="toggleTargetDropdown" tabindex="0" @keydown.enter="toggleTargetDropdown" @keydown.space="toggleTargetDropdown">
                <div style="display: flex; align-items: center;">
                    <div class="language-flag" :style="{ backgroundImage: `url(${targetLanguage.flag})` }"></div>
                    <span class="language-name">{{ targetLanguage.name }}</span>
                </div>
                <span class="dropdown-arrow" :class="{ open: isTargetOpen }">▼</span>
            </div>
            <div class="dropdown-menu" :class="{ open: isTargetOpen }">
                <div class="language-option" 
                        v-for="lang in filteredTargetLanguages" 
                        :key="lang.code" 
                        @click="selectTargetLanguage(lang)" 
                        :class="{ active: lang.code === targetLanguage.code }">
                    <div class="language-flag" :style="{ backgroundImage: `url(${lang.flag})` }"></div>
                    <span>{{ lang.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// 语言选择下拉框
// 支持语言检测
// 包含源语言和目标语言选择器
import { ref, computed, onMounted } from 'vue'
import { useTranslationStore } from '@/stores/localStorage'
import { SUPPORTED_LANGUAGES } from '@/utils/constant'
import { ElButton } from 'element-plus'
const store = useTranslationStore()

const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
  code, name, flag: `https://flagcdn.com/w40/${code === 'zh' ? 'cn' : (code === 'en' ? 'us' : code)}.png`
}))

const isSourceOpen = ref(false)
const isTargetOpen = ref(false)

// 添加缺失的计算属性
const filteredSourceLanguages = computed(() => 
  languages.filter(lang => lang.code !== targetLanguage.value.code)
)

const filteredTargetLanguages = computed(() => 
  languages.filter(lang => lang.code !== sourceLanguage.value.code)
)

const sourceLanguage = computed({
  get: () => languages.find(l => l.code === store.source) || languages[0],
  set: (lang) => store.setSource(lang.code)
})

const targetLanguage = computed({
  get: () => languages.find(l => l.code === store.target) || languages[1] || languages[0],
  set: (lang) => store.setTarget(lang.code)
})

// 添加切换下拉框的函数
function toggleSourceDropdown() {
  isSourceOpen.value = !isSourceOpen.value
  if (isSourceOpen.value) {
    isTargetOpen.value = false
  }
}

function toggleTargetDropdown() {
  isTargetOpen.value = !isTargetOpen.value
  if (isTargetOpen.value) {
    isSourceOpen.value = false
  }
}

function selectSourceLanguage(lang) { 
  store.setSource(lang.code)
  isSourceOpen.value = false 
}

function selectTargetLanguage(lang) { 
  store.setTarget(lang.code)
  isTargetOpen.value = false 
}

function swapLanguages() { 
  store.swap()
  
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (!event.target.closest('.language-selector')) {
    isSourceOpen.value = false
    isTargetOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onMounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
.language-selector-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
}

.language-selector {
    position: relative;
    flex: 1;
}

.ellipse-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border: 2px solid #e1e8ed;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    min-height: 56px;
}

.ellipse-container:hover {
    border-color: #9ad0f5;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}


.language-flag {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    margin-right: 12px;
    border: 1px solid #e1e8ed;
}

.language-name {
    font-weight: 500;
    color: #2c3e50;
}

.detected-badge {
    background: #e74c3c;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 8px;
}

.dropdown-arrow {
    transition: transform 0.3s ease;
    color: #7f8c8d;
}

.dropdown-arrow.open {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    opacity: 0;
    z-index: 10;
    margin-top: 5px;
}

.dropdown-menu.open {
    max-height: 300px;
    opacity: 1;
    overflow-y: auto;
}

.language-option {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.language-option:hover {
    background-color: #f8f9fa;
}

.language-option.active {
    background-color: #e3f2fd;
    color: #1976d2;
}

.swap-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    color: #9ad0f5;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: #e1e8ed 0px 4px 12px;
    flex-shrink: 0;
}


.footer {
    text-align: center;
    margin-top: 30px;
    color: #7f8c8d;
    font-size: 14px;
}

@media (max-width: 600px) {
    .language-selector-container {
        flex-direction: column;
        gap: 15px;
    }
    
    .swap-button {
        transform: rotate(90deg);
    }
    
    .swap-button:hover {
        transform: rotate(270deg);
    }
}
</style>