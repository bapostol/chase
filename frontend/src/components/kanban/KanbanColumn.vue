<!-- Open frontend/src/components/kanban/KanbanColumn.vue and replace its content with this update -->
<script setup>
import { ref } from 'vue';
import KanbanCard from './KanbanCard.vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  applications: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['cardSelect', 'cardDrop']);

// Track local hovering state to dynamically glow border outlines on user contact passes
const isDragHovered = ref(false);

const handleDragOver = (event) => {
  event.preventDefault(); // Crucial: unlocks drop zones natively in browser sandboxes
  isDragHovered.value = true;
};

const handleDragLeave = () => {
  isDragHovered.value = false;
};

const handleDrop = (event) => {
  isDragHovered.value = false;
  const applicationId = event.dataTransfer.getData('text/plain');
  
  if (applicationId) {
    // Bubble the update parameter keys out to your active tracking lanes layout grids
    emit('cardDrop', { applicationId, newStatus: props.title });
  }
};
</script>

<template>
  <!-- ADDED NATIVE BROWSER DRAG-DROP DETECTORS AND DYNAMIC GLOW OUTLINES -->
  <div 
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="[
      'flex flex-col w-80 shrink-0 bg-panel-bg border-r border-l h-[calc(100vh-112px)] min-h-[calc(100vh-112px)] p-4 shadow-sm transition-all duration-150',
      isDragHovered ? 'border-brand-primary/50 bg-panel-bg/80 scale-[1.01]' : 'border-border-line/10'
    ]"
  >
    
    <!-- Prominent Editorial Column Header -->
    <div class="flex items-center justify-between mb-5 pb-3 border-b border-border-line/20 shrink-0 select-none">
      <h3 class="font-bold text-sm text-ink-primary tracking-wider uppercase leading-none">
        {{ title }}
      </h3>
      <span class="bg-canvas-bg text-ink-secondary text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-border-line/20">
        {{ applications.length }}
      </span>
    </div>

    <!-- Scrollable Card Container Track -->
    <div class="flex-1 overflow-y-auto space-y-3 pr-1">
      <KanbanCard 
        v-for="app in applications"
        :key="app.id"
        :application="app"
        @select="(id) => $emit('cardSelect', id)"
      />

      <div 
        v-if="applications.length === 0"
        class="h-24 border border-dashed border-border-line/30 rounded-xl flex items-center justify-center text-xs text-ink-muted/50 font-medium select-none font-sans"
      >
        No active leads
      </div>
    </div>

  </div>
</template>
