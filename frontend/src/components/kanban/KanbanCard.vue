<script setup>
defineProps({
  application: {
    type: Object,
    required: true
  }
});

defineEmits(['select']);
</script>

<template>
  <div 
    @click="$emit('select', application.id)"
    class="bg-slate-800 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-500/60 transition group relative cursor-pointer"
  >
    <div class="space-y-2">
      <h4 class="font-bold text-sm text-white group-hover:text-indigo-400 transition leading-snug">
        {{ application.title }}
      </h4>
      <p class="text-xs text-slate-400 font-medium">{{ application.company }}</p>
      
      <!-- Tags Badges List -->
      <div v-if="application.tags && application.tags.length" class="flex flex-wrap gap-1.5 pt-1">
        <span 
          v-for="tag in application.tags" 
          :key="tag"
          class="bg-slate-900 border border-slate-700/40 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>
