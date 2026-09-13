<!-- Open frontend/src/components/kanban/KanbanCard.vue and replace its content with this update -->
<script setup>
const props = defineProps({
  application: {
    type: Object,
    required: true
  }
});

defineEmits(['select']);

// 1. Pack the application identifier key securely into the native browser drag context
const handleDragStart = (event) => {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', props.application.id);
};
</script>

<template>
  <!-- ADDED draggable="true" AND @dragstart INTERCEPTOR -->
  <div 
    draggable="true"
    @dragstart="handleDragStart"
    @click="$emit('select', application.id)"
    class="bg-canvas-bg border border-border-line/20 rounded-xl p-4 shadow-sm hover:border-brand-primary/40 hover:shadow-md transition-all duration-200 group relative cursor-grab active:cursor-grabbing"
  >
    <div class="space-y-2 select-none">
      <h4 class="font-bold text-sm text-ink-primary group-hover:text-brand-primary transition-colors duration-150 leading-snug">
        {{ application.title }}
      </h4>
      <p class="text-xs text-ink-secondary font-medium font-sans">
        {{ application.company }}
      </p>
      
      <!-- Tags Badges Grid -->
      <div v-if="application.tags && application.tags.length" class="flex flex-wrap gap-1.5 pt-1">
        <span 
          v-for="tag in application.tags" 
          :key="tag"
          class="bg-panel-bg border border-border-line/30 text-ink-primary text-[10px] font-bold font-sans px-2 py-0.5 rounded shadow-sm"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>
