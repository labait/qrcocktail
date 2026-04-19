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
  global.bgColor = '#7e63e0'
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
  <div class="flex min-h-svh w-full flex-col">

    <section
      class="flex flex-col gap-5 bg-brand px-7 pb-11 pt-10 text-white"
    >
      <h1 class="m-0 pt-5 text-[32px] font-bold leading-tight">
        Misura la tua abilità
      </h1>
      <p class="m-0 text-[15px] font-normal leading-normal text-white/75">
        Rispondi alle domande per vincere il tuo cocktail omaggio.
      </p>
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
      class="flex flex-1 flex-col gap-6 bg-[#f5f5f5] px-6 pb-12 pt-8"
    >
      <p v-if="loadError" class="m-0 text-[15px] font-semibold text-red-500">
        {{ loadError }}
      </p>

      <template v-else-if="questions.length && questions[questionIndex]">
        <Question :question="questions[questionIndex]" v-model="selectedAnswer" />

        <button
          v-if="selectedAnswer"
          type="button"
          class="mt-4 w-full cursor-pointer rounded-2xl border-0 py-5 text-lg font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(255,114,48,0.5)] transition-[transform,box-shadow] duration-150 hover:scale-[1.02] hover:shadow-[0_14px_36px_-10px_rgba(255,114,48,0.6)] active:scale-[0.97]"
          @click="nextQuestion"
        >
          Prosegui
        </button>
      </template>

      <p v-else class="m-0 text-[15px] text-slate-400">
        Caricamento quiz…
      </p>
    </section>
  </div>
</template>