<script setup>
import { ref, onMounted, inject } from 'vue'
import Question from '../components/Question.vue'

const global = inject('global')
const questions = ref([])
const questionIndex = ref(0)
const loadError = ref('')
const questionsAnswered = ref([])
const answerSelected = ref(null)

const loadQuestions = async () => {
  global.loading ++
  loadError.value = ''
  let response = null
  let data = await import('../data/questions1.json')
  questions.value = data.questions
  console.log("questions", questions.value)
  // get global.settings.quiz.questionsCount questions randomly
  questions.value = questions.value
  .sort(() => Math.random() - 0.5)
  .slice(0, global.settings.quiz.questionsCount)
  // for each question, shuffle the answers
  questions.value.forEach(question => {
    question.answers = question.answers.sort(() => Math.random() - 0.5)
  })
  console.log("questions", questions.value)
  global.loading --
  return 
  // load from ai model
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
  const question = questions.value[questionIndex.value]
  questionsAnswered.value.push({
    question: question,
    answers: [answerSelected.value],
  })
  console.log("questionsAnswered", questionsAnswered.value)
  if (questionIndex.value < questions.value.length - 1) {
    questionIndex.value++
    answerSelected.value = null
  } else {
    console.log("Quiz completato!")
    console.log("Punteggio:", calculateScore())
  }
}

const calculateScore = () => {
  let score = 0
  questionsAnswered.value.forEach(question => {
    if (question.answers.some(answer => answer.correct)) {
      score++
    }
  })
  return score
}

function progressDotClass(i) {
  const common =
    'size-8 shrink-0 rounded-full box-border transition-[background-color,border-width] duration-300'
  const record = questionsAnswered.value[i]
  if (record != null) {
    const correct = record.answers?.[0]?.correct === true
    return [
      common,
      'border-2 border-white',
      correct ? 'bg-[#7c6fe0]' : 'bg-white',
    ]
  }
  if (i === questionIndex.value) {
    return [common, 'border-[6px] border-white bg-transparent']
  }
  return [common, 'border-2 border-white bg-transparent']
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
      <div
        class="flex flex-wrap items-center justify-center gap-1.5"
        role="list"
        aria-label="Avanzamento domande"
      >
        <span
          v-for="(q, i) in questions"
          :key="i"
          :class="progressDotClass(i)"
          role="presentation"
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
        <Question :question="questions[questionIndex]" v-model="answerSelected" />
        <button
          v-if="answerSelected"
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