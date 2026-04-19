<script setup>
import { ref, onMounted, inject } from 'vue'
import Question from '../components/Question.vue'

const global = inject('global')
const questions = ref([])
const questionIndex = ref(0)
const loadError = ref('')
const answered = ref(false)
const selectedAnswer = ref(null)

const loadQuestions = async () => {
  global.loading ++
  loadError.value = ''
  let response = null
  let data = null
  try {
    const cocktail = 'white russian'
    response = await fetch(`.netlify/functions/quizBuild?cocktail=${cocktail}${global.debug ? '&debug' : ''}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data = await response.json()
    questions.value = JSON.parse(data.raw.output[0].content[0].text.trim().replaceAll('```json', '').replaceAll('```', '')).questions
  } catch (err) {
    console.error('Quiz load failed:', err)
    console.log("data", data)
    global.dialog = {
      text: 'Impossibile caricare il quiz.',
      confirmText: 'Continua',
      onConfirm: () => {
        global.loading --
      },
    }
  } finally {
    global.loading --
  }
}

onMounted(async () => {
  global.bgColor = '#FF722F'
  await loadQuestions()
})

const nextQuestion = () => {
  if (questionIndex.value < questions.value.length - 1) {
    questionIndex.value++
    selectedAnswer.value = null
  } else {
    console.log("Quiz completato!")
  }
}
</script>

<template>
  <div class="flex min-h-svh w-full flex-col">

    <section
      class="flex flex-col gap-5 mb-4 text-white"
    >
      <h1 class="m-0 text-3xl font-bold leading-tight text-center px-4">
        Rispondi alle domande per vincere il tuo cocktail omaggio
      </h1>
      <div class="flex flex-wrap items-center justify-center gap-1.5">
        <span
          v-for="(q, i) in questions"
          :key="i"
          class="h-1 w-7 shrink-0 rounded-sm transition-colors duration-300"
          :class="
            i === questionIndex
              ? 'bg-[#7c6fe0]'
              : i < questionIndex
                ? 'bg-white'
                : 'bg-[#ddd]'
          "
        />
      </div>
    </section>

    <section
      class="flex flex-1 flex-col gap-6 bg-gray-100 px-6 pb-12 pt-8"
    >
      <p v-if="loadError" class="m-0 text-[15px] font-semibold text-red-500">
        {{ loadError }}
      </p>

      <template v-if="questions.length && questions[questionIndex]">
        <Question :question="questions[questionIndex]" v-model="selectedAnswer" />
        <button
          v-if="selectedAnswer"
          type="button"
          class="btn btn-primary w-full"
          @click="nextQuestion"
        >
          Prosegui
        </button>
      </template>

    </section>
  </div>
</template>