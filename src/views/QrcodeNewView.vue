<script setup>
import QrcodeForm from '../components/qrcode_form.vue'
import { useAdminGuard } from '../composables/useAdminGuard.js'

useAdminGuard()
</script>

<template>
  <QrcodeForm mode="create" />
</template>
