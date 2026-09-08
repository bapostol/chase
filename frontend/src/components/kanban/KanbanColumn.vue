<script setup>
import KanbanCard from './KanbanCard.vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  applications: {
    type: Array,
    required: true
  }
});

defineEmits(['cardSelect']);
</script>

<template>
  <div class="flex flex-col w-80 shrink-0 bg-slate-800/40 border border-slate-800/60 rounded-xl p-4 max-h-[calc(100vh-180px)] shadow-inner">
    
    <!-- Column Header -->
    <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/20 shrink-0">
      <span class="font-bold text-xs text-slate-300 tracking-wide uppercase">{{ title }}</span>
      <span class="bg-slate-900 text-slate-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-700/40">
        {{ applications.length }}
      </span>
    </div>

    <!-- Scrollable Card Container Track -->
    <div class="flex-1 overflow-y-auto space-y-3 pr-1">
      
      <!-- List Render Layer -->
      <KanbanCard 
        v-for="app in applications"
        :key="app.id"
        :application="app"
        @select="(id) => $emit('cardSelect', id)"
      />

      <!-- Empty State Graphic Placeholder -->
      <div 
        v-if="applications.length === 0"
        class="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-600 font-medium select-none"
      >
        No active leads
      </div>

    </div>

  </div>
</template>
