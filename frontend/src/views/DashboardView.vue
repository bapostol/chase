<script setup>
import { onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import KanbanBoard from '../components/kanban/KanbanBoard.vue';
import { useApplications } from '../composables/useApplications.js';

const LANES = ['Ready to Apply', 'Applied', 'Interviewing', 'Ghosted', 'Offer', 'Rejected'];

// Pull our live reactive database state utilities
const { applications, isLoading, error, fetchApplications } = useApplications();

// Trigger a live database pull over the proxy channels when the view mounts
onMounted(async () => {
  await fetchApplications(false); // Passes false to pull only active, non-archived leads
});

const handleCardSelection = (id) => {
  console.log(`Card selection event bubble caught inside DashboardView. Application Target ID: ${id}`);
};

const handleAddApplicationClick = () => {
  console.log('Triggering new application entry wizard creation form...');
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-slate-900">
    
    <!-- Sub-Header Utility Options Metadata Section Bar -->
    <div class="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between shrink-0 h-12">
      <div class="flex items-center gap-2 select-none">
        <h2 class="text-sm font-bold text-slate-200 tracking-tight">Active Ingestion Funnel</h2>
        
        <!-- Render a live loader spinner or the actual database row count -->
        <span 
          v-if="isLoading" 
          class="text-[10px] text-indigo-400 font-mono animate-pulse"
        >
          Querying SQLite Matrix...
        </span>
        <span 
          v-else
          class="text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded font-mono"
        >
          Total Active Leads: {{ applications.length }}
        </span>
      </div>
      
      <!-- Interactive Action Trigger to launch application ingestion modals -->
      <button 
        @click="handleAddApplicationClick"
        class="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition shadow-sm"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Application
      </button>
    </div>

    <!-- Error HUD Indicator overlay -->
    <div 
      v-if="error" 
      class="m-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium"
    >
      {{ error }}
    </div>

    <!-- Decoupled Component Board Layer -->
    <KanbanBoard 
      v-else
      :lanes="LANES" 
      :applications="applications"
      @card-select="handleCardSelection"
    />

  </div>
</template>
