import { defineStore } from 'pinia'

const KEY_SRC = 'translator_source'
const KEY_TGT = 'translator_target'

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    source: localStorage.getItem(KEY_SRC) || 'zh',
    target: localStorage.getItem(KEY_TGT) || 'en',
    txt: localStorage.getItem('translator_text') || '',
    changeContent: false
  }),
  actions: {
    setSource(code) {
      this.source = code
      localStorage.setItem(KEY_SRC, code)
    },
    setTarget(code) {
      this.target = code
      localStorage.setItem(KEY_TGT, code)
    },
    setTxt(txt) {
      this.txt = txt
      localStorage.setItem('translator_text', txt)
    },
    swap() {
      const t = this.source
      this.source = this.target
      this.target = t
      localStorage.setItem(KEY_SRC, this.source)
      localStorage.setItem(KEY_TGT, this.target)
      this.changeContent = !this.changeContent
    }
  }
})

export default {
  useTranslationStore
}