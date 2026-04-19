<script setup>
import { ref, onMounted, inject, computed, watch } from 'vue'
import Question from '../components/Question.vue'
import { useUtils } from '../composables/useUtils'

const global = inject('global')
const { updateAccount, isAdmin } = useUtils()

const questions = ref([])
const questionIndex = ref(0)
const questionsAnswered = ref([])
const answerSelected = ref(null)

const questionsTotal = computed(() => global.settings.quiz.questionsCount)
const questionsCorrect = computed(() =>
  questionsAnswered.value.reduce(
    (n, r) => n + (r.answers?.[0]?.correct === true ? 1 : 0),
    0,
  ),
)
const quizCompleted = computed(() => questionsAnswered.value.length === questionsTotal.value)
const quizPerfect = computed(
  () =>
    questionsCorrect.value === questionsTotal.value && questionsTotal.value > 0,
)

const loadQuestions = async () => {
  global.loading++
  let response = null
  let data = await import('../data/questions1.json')
  questions.value = data.questions
  console.log('questions', questions.value)
  questions.value = questions.value
    .sort(() => Math.random() - 0.5)
    .slice(0, global.settings.quiz.questionsCount)
  questions.value.forEach((question) => {
    question.answers = question.answers.sort(() => Math.random() - 0.5)
  })
  //console.log('questions', questions.value)
  global.loading--
  return
  // #TODO load from ai model
  try {
    const cocktail = 'white russian'
    response = await fetch(`.netlify/functions/quizBuild?cocktail=${cocktail}${global.debug ? '&debug' : ''}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    data = await response.json()
    questions.value = JSON.parse(data.raw.output[0].content[0].text.trim().replaceAll('```json', '').replaceAll('```', '')).questions
  } catch (err) {
    console.error('Quiz load failed:', err)
    console.log('data', data)
    global.dialog = {
      text: 'Impossibile caricare il quiz.',
      confirmText: 'Continua',
      onConfirm: () => {
        global.loading--
      },
    }
  } finally {
    global.loading--
  }
}


function restoreQuiz() {
  const saved = global.account?.questionsAnswered
  const n = global.settings.quiz.questionsCount
  if (!Array.isArray(saved) || saved.length !== n) return false
  if (quizCompleted.value && questionsAnswered.value.length === n) return true

  questionsAnswered.value = saved
  questions.value = saved.map((r) => r.question)
  questionIndex.value = n - 1
  quizCompleted.value = true
  return true
}

watch(
  () => global.account,
  () => {
    restoreQuiz()
  },
)

onMounted(async () => {
  global.bgColor = '#FF722F'
  if (restoreQuiz()) return
  await loadQuestions()
})

const nextQuestion = async () => {
  const question = questions.value[questionIndex.value]
  questionsAnswered.value.push({
    question: question,
    answers: [answerSelected.value],
  })
  console.log('questionsAnswered', questionsAnswered.value)
  if (questionIndex.value < questions.value.length - 1) {
    questionIndex.value++
    answerSelected.value = null
  } else {
    if (global.account?.uid) {
      try {
        const payload = JSON.parse(JSON.stringify(questionsAnswered.value))
        await updateAccount({ questionsAnswered: payload })
      } catch (err) {
        console.error('Salvataggio quiz su account fallito:', err)
      }
    }
    quizCompleted.value = true
    console.log('Punteggio:', calculateScore())
  }
}

const calculateScore = () => {
  let score = 0
  questionsAnswered.value.forEach((question) => {
    if (question.answers.some((answer) => answer.correct)) {
      score++
    }
  })
  return score
}

async function restartQuiz() {
  quizCompleted.value = false
  questionsAnswered.value = []
  questionIndex.value = 0
  answerSelected.value = null
  if (global.account?.uid) {
    try {
      await updateAccount({ questionsAnswered: [] })
    } catch (err) {
      console.error('Reset quiz su account fallito:', err)
    }
  }
  await loadQuestions()
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
    <section v-if="!quizCompleted" class="mb-4 flex flex-col gap-5 text-white">
      <h1 class="m-0 px-4 text-center text-3xl font-bold leading-tight">
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
    <section v-else class="mb-4 flex flex-col gap-5 text-white">
      <h1 class="m-0 px-4 text-center text-3xl font-bold leading-tight">
        Quiz completato!
        <br>
      </h1>
      <div class="m-0 text-xl text-center">
        Hai risposto correttamente a<br> {{ questionsCorrect }} domande su {{ questionsTotal }}.
      </div>
    </section>

    <section class="flex flex-1 flex-col gap-6 bg-gray-100 px-6 pb-12 pt-8">
      <div
        v-if="quizCompleted"
        class="flex flex-col items-center gap-6 text-center"
      >
        <template v-if="quizPerfect">
          <p class="m-0 max-w-md text-lg font-semibold text-neutral-800">
            Complimenti, hai risposto a {{ questionsCorrect }} su {{ questionsTotal }} domande.
          </p>
          <button type="button" class="btn btn-primary w-full" @click="() => {
            console.log('Ritira il tuo premio')
          }">
            Ritira il tuo premio
          </button>
        </template>
        <template v-else>
          <p class="m-0 max-w-md text-lg text-neutral-700">
            Mi spiace, c'eri quasi, riprova la prossima volta.
          </p>
        </template>
        <button
          v-if="isAdmin()"
          type="button"
          class="btn btn-secondary w-full"
          @click="restartQuiz"
        >
          Ricomincia
        </button>
      </div>

      <template v-else-if="questions.length && questions[questionIndex]">
        <Question :question="questions[questionIndex]" v-model="answerSelected" />
        <div class="flex flex-col items-center gap-6">
          <button
            v-if="answerSelected"
            type="button"
            class="btn btn-primary w-full"
            @click="nextQuestion"
          >
            Prosegui
          </button>
        </div>
      </template>
    </section>
  </div>
</template>
