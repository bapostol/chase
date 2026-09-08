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

// Filters cards into their matching column tracks
const getCardsByLane = (lane) => {
  return props.applications.filter(app => app.status === lane);
};
</script>

<template>
  <div class="flex-1 overflow-x-auto p-6 flex items-start gap-5 select-none">
    
    <!-- Map out each independent pipeline state lane column -->
    <KanbanColumn 
      v-for="lane in lanes"
      :key="lane"
      :title="lane"
      :applications="getCardsByLane(lane)"
      @card-select="(id) => $emit('cardSelect', id)"
    />

  </div>
</template>
