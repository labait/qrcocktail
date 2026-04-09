<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: false, // Changed to false for safety
    default: null
  },
})

// Use computed to stay reactive, or just use props.question directly
</script>

<template>
  <div v-if="question" class="w-full space-y-6 text-left">
    <h3 class="text-xl font-bold text-slate-900 leading-snug">{{ question.text }}</h3>
    
    <div class="grid gap-3">
      <div v-for="answer in question.answers" :key="answer.text" class="relative">
        <label class="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-brand/40 cursor-pointer transition-all group">
          <input 
            type="radio" 
            :value="answer.text" 
            :name="question.text" 
            class="w-5 h-5 text-brand border-slate-300 focus:ring-brand"
          />
          <span class="text-slate-700 font-medium group-hover:text-slate-900">{{ answer.text }}</span>
        </label>
      </div>
    </div>
  </div>
</template>