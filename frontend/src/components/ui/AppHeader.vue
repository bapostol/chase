<script setup>
import { Briefcase, Archive, User, Activity } from 'lucide-vue-next';

// 1. Structural Component Contracts
defineProps({
  activeView: {
    type: String,
    required: true,
    validator: (value) => ['dashboard', 'archive'].includes(value)
  }
});

// 2. Clear Event Transports to drive parent App.vue state mutations
defineEmits(['navigate', 'openProfile']);
</script>

<template>
  <header class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md shrink-0">
    
    
    <div class="flex items-center gap-3 select-none">
      <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold tracking-wider text-white shadow-inner">
        C
      </div>
      <div class="flex flex-col">
        <h1 class="text-sm font-bold tracking-tight text-white leading-none">CHASE</h1>
        <span class="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">Career Hunt Assistant</span>
      </div>
    </div>

    <!-- Center Section: Master Dynamic Navigation Links Swapping -->
    <nav class="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-700/40">
      
      <!-- Dashboard View Target Tab Trigger -->
      <button 
        @click="$emit('navigate', 'dashboard')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200',
          activeView === 'dashboard' 
            ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/50 font-bold' 
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        <Briefcase class="w-3.5 h-3.5" />
        Pipeline Board
      </button>

      <!-- Archive View Target Tab Trigger -->
      <button 
        @click="$emit('navigate', 'archive')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200',
          activeView === 'archive' 
            ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/50 font-bold' 
            : 'text-slate-400 hover:text-slate-200'
        ]"
      >
        <Archive class="w-3.5 h-3.5" />
        Archive Yard
      </button>

    </nav>

    <!-- Right Section: System Connectivity Monitors & Configuration Actions -->
    <div class="flex items-center gap-4">
      
      <!-- Hardcoded Network Verification Telemetry Tag -->
      <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/40 text-[11px] text-slate-400 font-medium font-mono select-none">
        <Activity class="w-3 h-3 text-emerald-400 animate-pulse" />
        chase_core: v1.0
      </div>

      <!-- Settings Profile Modal Invoker Action Button -->
      <button 
        @click="$emit('openProfile')"
        class="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600/80 hover:border-slate-500/80 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm"
      >
        <User class="w-3.5 h-3.5" />
        Profile Config
      </button>

    </div>
  </header>
</template>
