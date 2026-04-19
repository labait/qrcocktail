<script setup>
function redeem() {
  console.log('redeem')
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 px-4 py-8">
    <button
      type="button"
      class="cursor-pointer rounded-lg bg-emerald-700 px-6 py-3 text-base font-medium text-white shadow transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      @click="redeem"
    >
      redeem
    </button>
  </div>
</template>
