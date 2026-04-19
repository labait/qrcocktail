<script setup>
defineProps({
  question: {
    type: Object,
    required: false,
    default: null,
  },
  modelValue: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div v-if="question" class="flex w-full flex-col gap-5">
    <h3 class="m-0 text-xl font-bold leading-[1.35] text-neutral-900">
      {{ question.text }}
    </h3>

    <div class="flex flex-col gap-2.5">
      <label
        v-for="answer in question.answers"
        :key="answer.text"
        class="flex cursor-pointer items-center gap-3.5 rounded-[14px] border-2 border-slate-200 bg-white px-[18px] py-3.5 transition-colors duration-200 hover:border-[rgba(124,111,224,0.4)] hover:bg-[rgba(124,111,224,0.04)] has-checked:border-[#7c6fe0] has-checked:bg-[rgba(124,111,224,0.08)]"
      >
        <input
          type="radio"
          :value="answer.text"
          :name="question.text"
          class="size-[18px] shrink-0 accent-[#7c6fe0]"
          :checked="modelValue === answer.text"
          @change="emit('update:modelValue', answer.text)"
        />
        <span class="text-[15px] font-medium leading-[1.4] text-slate-700">
          {{ answer.text }}
        </span>
      </label>
    </div>
  </div>
</template>
