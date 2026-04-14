<script setup>
import { inject, computed } from 'vue'
import Instructions from './Instructions.vue'
import Progress from './Progress.vue'

const global = inject('global')

const isLoggedIn = computed(() => !!global?.user)
</script>

<template>
  <div class="home-root">
    <template v-if="!isLoggedIn">
      <Instructions />
    </template>
    <template v-else>
      <Progress />
    </template>

    <!-- DEBUG -->
    <div style="position:fixed;bottom:0;left:0;right:0;background:#000;color:#0f0;font:12px monospace;padding:8px;z-index:9999;opacity:0.8;">
      <strong>DEBUG</strong> |
      accountReady: {{ global.accountReady }} |
      user: {{ global.user?.email ?? 'null' }} |
      roles: {{ JSON.stringify(global.roles) }}
    </div>
  </div>
</template>