<script setup>
import { ref, onMounted, inject } from 'vue'
import Question from '../components/Question.vue'

const global = inject('global')
const questions = ref([])
const questionIndex = ref(0)


const loadQuestions = async () => {
  global.loading = true
  const cocktail = 'white russian'
  const response = await fetch(`.netlify/functions/quizBuild?cocktail=${cocktail}${global.debug ? '&debug' : ''}`)
  const data = await response.json()
  questions.value = JSON.parse(data.raw.output[0].content[0].text.trim().replaceAll('```json', '').replaceAll('```', '')).questions
  //console.log(data.raw.output[0].content[0].text)
  console.log(questions.value)
  global.loading = false
}

onMounted(async () => {
  await loadQuestions()
})
</script>

<template>
  <div>
    <h1>Quiz</h1>
    
    <Question :question="questions[questionIndex]" />
  </div>
</template>