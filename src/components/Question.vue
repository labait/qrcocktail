<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: false,
    default: null
  },
})
</script>

<template>
  <div v-if="question" class="question-card">
    <h3 class="question-text">{{ question.text }}</h3>

    <div class="answers-grid">
      <label
        v-for="answer in question.answers"
        :key="answer.text"
        class="answer-label"
      >
        <input
          type="radio"
          :value="answer.text"
          :name="question.text"
          class="answer-radio"
        />
        <span class="answer-text">{{ answer.text }}</span>
      </label>
    </div>
  </div>
</template>