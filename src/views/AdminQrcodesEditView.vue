<script setup>
import { useRoute } from 'vue-router'
import QrcodeForm from '../components/QrcodeForm.vue'

import { useAdminGuard } from '../composables/useAdminGuard.js'
useAdminGuard()

const route = useRoute()
</script>

<template>
  <QrcodeForm mode="edit" :document-id="route.params.id" />
</template>
