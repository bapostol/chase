<script setup>
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import KanbanBoard from '../components/kanban/KanbanBoard.vue';
import ApplicationModal from '../components/ui/ApplicationModal.vue'; // New Import
import { useApplications } from '../composables/useApplications.js';

const LANES = ['Ready to Apply', 'Applied', 'Interviewing', 'Ghosted', 'Offer', 'Rejected'];

const { applications, isLoading, error, fetchApplications, createApplication, patchApplication, fetchSingleApplication } = useApplications();

const handleCardSelection = async (id) => {
  // Trigger an async handshake back to Express to fetch the full row metadata and disk file contents
  const deepApplicationData = await fetchSingleApplication(id);
  
  if (deepApplicationData) {
    selectedApplication.value = deepApplicationData;
    isAppModalOpen.value = true;
  }
};

const handleCardMovement = async ({ applicationId, newStatus }) => {
  // Triggers your composable's optimistic patch! 
  // It moves the card visually instantly and fires a network background transaction pass
  await patchApplication(applicationId, { status: newStatus });
  console.log(`Successfully shifted card UUID: ${applicationId} to active tracking pipeline status: ${newStatus}`);
};

// Modal visibility and payload state tracking configurations
const isAppModalOpen = ref(false);
const selectedApplication = ref(null);

onMounted(async () => {
  await fetchApplications(false);
});

// Launch modal in "Create Mode"
const handleAddApplicationClick = () => {
  selectedApplication.value = null;
  isAppModalOpen.value = true;
};

// Handle unified form saves (Create or Patch)
const handleApplicationSave = async (payload) => {
  let success = false;

  if (payload.id) {
    // Edit Workflow: Sync updates across the SQLite pipeline paths
    await patchApplication(payload.id, payload);
    success = true; // Optimistic UI handles listing mutations instantly
  } else {
    // Create Workflow: Write new entry and generate data disk folders
    success = await createApplication(payload);
  }

  if (success) {
    isAppModalOpen.value = false;
    selectedApplication.value = null;
  }
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-canvas-bg">
    
    <!-- SUB-HEADER BAR -->
    <div class="h-12 px-6 bg-header-button border-b border-header-ink/20 flex items-center justify-between shrink-0 select-none text-header-ink">
      <div class="flex items-center gap-2">
        <h2 class="text-xs font-bold font-sans uppercase tracking-wider">Active Ingestion Funnel</h2>
        <span v-if="isLoading" class="text-[10px] font-mono animate-pulse opacity-80">Loading Ledger...</span>
        <span v-else class="text-[10px] bg-header-toggle border border-border-line/20 px-2 py-0.5 rounded font-mono font-bold">Leads: {{ applications.length }}</span>
      </div>
      
      <button @click="handleAddApplicationClick" class="flex items-center gap-1 bg-header-toggle hover:opacity-90 border border-border-line/20 text-header-ink px-2.5 py-1 rounded-lg text-[11px] font-bold font-sans tracking-wide transition cursor-pointer">
        <Plus class="w-3.5 h-3.5" /> Add Application
      </button>
    </div>

    <!-- Error HUD -->
    <div v-if="error" class="m-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs rounded-xl font-medium font-sans">{{ error }}</div>

    <!-- Kanban Board Canvas -->
    <KanbanBoard 
    v-else 
    :lanes="LANES" 
    :applications="applications" 
    @card-select="handleCardSelection" 
    @card-drop="handleCardMovement" 
  />

    <!-- Mount Ingestion Context Form Overlay -->
    <ApplicationModal 
      :is-open="isAppModalOpen"
      :application-data="selectedApplication"
      @close="isAppModalOpen = false"
      @save="handleApplicationSave"
    />

  </div>
</template>
