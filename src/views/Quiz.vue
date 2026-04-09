<script setup>
import { ref, onMounted, inject } from 'vue'
import Question from '../components/Question.vue'

const global = inject('global')
const questions = ref([])
const questionIndex = ref(0)
const loadError = ref('')

const loadQuestions = async () => {
  global.loading = true
  loadError.value = ''
  try {
    const cocktail = 'white russian'
    const response = await fetch(`.netlify/functions/quizBuild?cocktail=${cocktail}${global.debug ? '&debug' : ''}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    questions.value = JSON.parse(data.raw.output[0].content[0].text.trim().replaceAll('```json', '').replaceAll('```', '')).questions
    console.log(questions.value)
  } catch (err) {
    console.error('Quiz load failed:', err)
    loadError.value = 'Impossibile caricare il quiz.'
  } finally {
    global.loading = false
  }
}

onMounted(async () => {
  await loadQuestions()
})
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <h1 class="text-3xl font-black uppercase tracking-widest text-slate-900 mb-8 mt-4 text-center">Misura la tua abilità</h1>
    
    <p v-if="loadError" class="text-red-500 font-medium">{{ loadError }}</p>
    <Question v-else-if="questions.length && questions[questionIndex]" :question="questions[questionIndex]" />
    <p v-else class="text-slate-400">Caricamento quiz…</p>
  </div>
</template>