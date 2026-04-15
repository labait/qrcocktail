<script setup>
import { ref, onMounted, inject } from 'vue'
import Question from '../components/Question.vue'
import { RouterLink } from 'vue-router'

const global = inject('global')
const questions = ref([])
const questionIndex = ref(0)
const loadError = ref('')
const answered = ref(false)
const selectedAnswer = ref(null)

const loadQuestions = async () => {
  global.loading = true
  loadError.value = ''
  try {
    const cocktail = 'white russian'
    const response = await fetch(`.netlify/functions/quizBuild?cocktail=${cocktail}${global.debug ? '&debug' : ''}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    questions.value = JSON.parse(data.raw.output[0].content[0].text.trim().replaceAll('```json', '').replaceAll('```', '')).questions
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

const nextQuestion = () => {
  if (questionIndex.value < questions.value.length - 1) {
    questionIndex.value++
    selectedAnswer.value = null
  } else {
    // Gestione fine quiz
    console.log("Quiz completato!")
  }
}
</script>

<template>
  <div class="quiz-root">

    <!-- Header viola con logo -->
    <section class="quiz-header">
      <img src="../assets/Laba-logo.svg" class="logo-laba" alt="LABA Logo" />
      <h1 class="quiz-title">Misura la tua abilità</h1>
      <p class="quiz-sub">Rispondi alle domande per vincere il tuo cocktail omaggio.</p>
    </section>

    <!-- Dots progress -->
        <div class="quiz-dots">
          <span
            v-for="(q, i) in questions"
            :key="i"
            class="quiz-dot"
            :class="{ active: i === questionIndex, done: i < questionIndex }"
          />
        </div>

    <!-- Corpo domanda -->
    <section class="quiz-body">
      <p v-if="loadError" class="quiz-error">{{ loadError }}</p>

      <template v-else-if="questions.length && questions[questionIndex]">

        <Question :question="questions[questionIndex]" v-model="selectedAnswer" />

        <button
          v-if="selectedAnswer"
          class="scan-btn"
          style="margin-top: 16px;"
          @click="nextQuestion"
        >
          Prosegui
        </button>
      </template>

      <p v-else class="quiz-loading">Caricamento quiz…</p>
    </section>

  </div>
</template>