<script setup>
import KanbanColumn from './KanbanColumn.vue';

const props = defineProps({
  lanes: {
    type: Array,
    required: true
  },
  applications: {
    type: Array,
    required: true
  }
});

defineEmits(['cardSelect']);

const getCardsByLane = (lane) => {
  return props.applications.filter(app => app.status === lane);
};
</script>

<!-- Inside frontend/src/components/kanban/KanbanBoard.vue -> update template definitions line -->
<template>
  <div class="flex-1 overflow-x-auto flex items-stretch xl:justify-center bg-canvas-bg border-t border-border-line/10 gap-4 px-6">
    
    <KanbanColumn 
      v-for="lane in lanes"
      :key="lane"
      :title="lane"
      :applications="getCardsByLane(lane)"
      @card-select="(id) => $emit('cardSelect', id)"
      @card-drop="(payload) => $emit('cardDrop', payload)"
    />

  </div>
</template>
