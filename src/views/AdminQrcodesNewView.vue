<script setup>
import QrcodeForm from '../components/QrcodeForm.vue'
import { useAdminGuard } from '../composables/useAdminGuard.js'

useAdminGuard()
</script>

<template>
  <QrcodeForm mode="create" />
</template>
