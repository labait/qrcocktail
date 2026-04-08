<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})

const question = ref(props.question)
</script>

<template>
  <div>
    <h3>{{ question.text }}</h3>
  </div>
  <div v-for="answer in question.answers" :key="answer.text">
    <input type="radio" :value="answer.text" :name="question.text" />
    <label>{{ answer.text }}</label>
  </div>
</template>