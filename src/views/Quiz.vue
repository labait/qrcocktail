<script setup>
import { ref, onMounted, inject } from 'vue'
import Question from '../components/Question.vue'
import { db } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import quizPool from '../data/quiz_pool.json'

const global = inject('global')
const questions = ref([])
const questionIndex = ref(0)
const loadError = ref('')
const selectedAnswer = ref(null)

const errors = ref(0)
const MAX_ERRORS = 1
const QUIZ_SIZE = 5

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadQuestions() {
  try {
    const pool = quizPool.questions
    if (!pool || pool.length < QUIZ_SIZE) {
      loadError.value = 'Pool domande insufficiente.'
      return
    }
    questions.value = shuffle(pool).slice(0, QUIZ_SIZE)
  } catch (err) {
    console.error('Quiz load failed:', err)
    loadError.value = 'Impossibile caricare il quiz.'
  }
}

onMounted(() => {
  loadQuestions()
})

async function setPhase(newPhase) {
  try {
    if (global.user?.uid) {
      const updates = { phase: newPhase }
      if (newPhase === 'redeem') {
        // Genera un coupon univoco per l'utente
        const couponCode = crypto.randomUUID()
        updates.coupon_code = couponCode
        global.account.coupon_code = couponCode
      }
      await updateDoc(doc(db, 'accounts', global.user.uid), updates)
      global.account.phase = newPhase
    }
  } catch (e) {
    console.error('Errore aggiornamento fase:', e)
  }
}

const nextQuestion = async () => {
  if (!selectedAnswer.value) return

  // Valuta la risposta corrente
  const currentQuestion = questions.value[questionIndex.value]
  const answerObj = currentQuestion.answers.find(a => a.text === selectedAnswer.value)
  if (!answerObj || !answerObj.correct) {
    errors.value++
  }

  // Troppi errori → lost
  if (errors.value > MAX_ERRORS) {
    await setPhase('lost')
    return
  }

  // Avanza o finisci
  if (questionIndex.value < questions.value.length - 1) {
    questionIndex.value++
    selectedAnswer.value = null
  } else {
    // Quiz superato!
    await setPhase('redeem')
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

    <!-- Errori indicator -->
    <div v-if="questions.length" class="quiz-errors-indicator">
      <span class="quiz-errors-label">Errori: {{ errors }} / {{ MAX_ERRORS }}</span>
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