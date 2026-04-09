<script setup>
import { inject, computed, ref } from 'vue'
import Progress from '../components/progress.vue'
import Quiz from './Quiz.vue'
import Scan from '../components/scan.vue'
import { RouterLink } from 'vue-router'

const global = inject('global')

const isLoggedIn = computed(() => !!global?.user)
const isAdmin = computed(() => Array.isArray(global?.roles) && global.roles.includes('admin'))

const points = ref(0)
const isScanning = ref(false)

function startScanner() {
  isScanning.value = true
}

function onQrDetected(code) {
  console.log('QR validato:', code)
  points.value++
  isScanning.value = false
}
</script>

<template>
  <div class="w-full">
    <!-- Main Dashboard Container -->
    <div v-if="points >= 3" class="w-full">
      <Quiz />
    </div>
    
    <div v-else class="flex w-full flex-col items-center gap-8 py-10 text-center px-4">
      <p v-if="!isLoggedIn" class="text-xl font-medium tracking-tight text-slate-500 max-w-xs leading-relaxed">
        Accedi per iniziare il tuo percorso e vedere i progressi.
      </p>
      
      <div v-else class="flex flex-col items-center gap-6 w-full max-w-md">
        <Progress />
        
        <div class="text-3xl font-black text-slate-900 tracking-tighter">
          Punti: <span class="text-brand">{{ points }}</span> / 3
        </div>
        
        <!-- Scan Interaction Area -->
        <div v-if="!isScanning" class="w-full mt-2">
          <button 
            @click="startScanner"
            class="group relative overflow-hidden rounded-2xl bg-brand px-8 py-5 text-xl font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(255,114,48,0.5)] transition-all hover:scale-[1.02] active:scale-95 w-full"
          >
            <span class="relative z-10">Scansiona QR</span>
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
        
        <div v-else class="w-full flex flex-col gap-4">
          <div class="overflow-hidden rounded-3xl border-4 border-brand shadow-2xl">
            <Scan @detected="onQrDetected" />
          </div>
          <button 
            @click="isScanning = false"
            class="rounded-xl border-2 border-slate-200 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all w-full"
          >
            Annulla Scansione
          </button>
        </div>

        <!-- Admin Quick Navigation -->
        <div v-if="isAdmin && !isScanning" class="w-full mt-12 p-8 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          
          <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
            <span class="w-8 h-px bg-slate-200"></span>
            Rapida Navigazione Admin
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <RouterLink
              :to="{ name: 'qrcodes_admin' }"
              class="flex flex-col items-center justify-center aspect-square rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all group"
            >
              <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-brand/10 transition-colors">
                <svg class="w-5 h-5 text-slate-400 group-hover:text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              </div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Lista QR</span>
            </RouterLink>
            
            <RouterLink
              :to="{ name: 'qrcodes_new' }"
              class="flex flex-col items-center justify-center aspect-square rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all group"
            >
              <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-brand/10 transition-colors">
                <svg class="w-5 h-5 text-slate-400 group-hover:text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Crea Nuovo</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- DEBUG Block -->
    <div style="position:fixed;bottom:0;left:0;right:0;background:#000;color:#0f0;font:12px monospace;padding:8px;z-index:9999;opacity:0.8;">
      <strong>DEBUG</strong> |
      accountReady: {{ global.accountReady }} |
      user: {{ global.user?.email ?? 'null' }} |
      roles: {{ JSON.stringify(global.roles) }} |
      points: {{ points }}
    </div>
  </div>
</template>