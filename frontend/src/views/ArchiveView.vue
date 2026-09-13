<script setup>
import { ref, onMounted } from 'vue';
import { Calendar, Link2, RotateCcw, Trash2, ShieldAlert } from 'lucide-vue-next';
import ApplicationModal from '../components/ui/ApplicationModal.vue';
import { useApplications } from '../composables/useApplications.js';

// Ingest your live state hooks including the new single-fetch method
const { applications, isLoading, error, fetchApplications, patchApplication, purgeApplication, fetchSingleApplication } = useApplications();

// Modal visibility control states
const isAppModalOpen = ref(false);
const selectedApplication = ref(null);

onMounted(async () => {
  await fetchApplications(true);
});

// ARCHITECTURAL FIX: Asynchronously request full metadata and disk file contents upon clicking a row
const handleRowClick = async (appRow) => {
  const deepApplicationData = await fetchSingleApplication(appRow.id);
  
  if (deepApplicationData) {
    selectedApplication.value = deepApplicationData;
    isAppModalOpen.value = true;
  }
};

const handleRestore = async (id) => {
  await patchApplication(id, { is_archived: false });
};

const handlePermanentDelete = async (id) => {
  const confirmed = confirm("Are you absolutely sure you want to permanently delete this application? This will wipe all database metrics and recursively erase its job description text file off your storage disk irreversibly.");
  if (confirmed) {
    await purgeApplication(id);
  }
};

const handleArchiveFormSave = async (payload) => {
  // If a user edits fields or un-archives directly via the administrative force override panel
  await patchApplication(payload.id, payload);
  isAppModalOpen.value = false;
  selectedApplication.value = null;
  await fetchApplications(true); // Re-hydrate cold storage rows cleanly
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-canvas-bg">
    
    <!-- SUB-HEADER BAR: h-12 -->
    <div class="h-12 px-6 bg-header-button border-b border-header-ink/20 flex items-center justify-between shrink-0 select-none text-header-ink">
      <div class="flex items-center gap-2">
        <h2 class="text-xs font-bold font-sans uppercase tracking-wider">Archived Cold Storage</h2>
        <span v-if="isLoading" class="text-[10px] font-mono animate-pulse opacity-80">Querying Archive...</span>
        <span v-else class="text-[10px] bg-header-toggle border border-border-line/20 px-2 py-0.5 rounded font-mono font-bold">Records: {{ applications.length }}</span>
      </div>
    </div>

    <!-- Error HUD Alert Message Box Overlay -->
    <div v-if="error" class="m-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs rounded-xl font-medium font-sans">{{ error }}</div>

    <!-- Archive List Register Track -->
    <div v-else class="flex-1 overflow-y-auto p-6 bg-panel-bg h-[calc(100vh-112px)] min-h-[calc(100vh-112px)]">
      <div class="max-w-4xl mx-auto space-y-4">
        
        <!-- Render Archived List Cards -->
        <div 
          v-for="app in applications" 
          :key="app.id"
          class="bg-canvas-bg border border-border-line/20 rounded-xl p-5 shadow-sm hover:border-brand-primary/40 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
          @click="handleRowClick(app)"
        >
          <!-- Left Details Stack -->
          <div class="space-y-2 max-w-xl flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-bold text-base text-ink-primary group-hover:text-brand-primary transition-colors duration-150 leading-none">
                {{ app.title }}
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-panel-bg border border-border-line/30 text-ink-secondary font-sans shadow-sm">
                {{ app.status }}
              </span>
            </div>
            
            <p class="text-xs text-ink-secondary font-medium font-sans leading-none">{{ app.company }}</p>
            
            <div class="flex flex-wrap items-center gap-4 text-ink-muted text-[11px] pt-1">
              <span class="flex items-center gap-1 font-sans"><Calendar class="w-3.5 h-3.5" />Created: {{ new Date(app.created_at).toLocaleDateString() }}</span>
              <a v-if="app.url" :href="app.url" target="_blank" @click.stop class="flex items-center gap-1 text-ink-secondary hover:text-brand-primary transition font-sans"><Link2 class="w-3.5 h-3.5" />View Posting</a>
            </div>

            <div v-if="app.tags && app.tags.length" class="flex flex-wrap gap-1.5 pt-1">
              <span v-for="tag in app.tags" :key="tag" class="bg-panel-bg border border-border-line/30 text-ink-primary text-[10px] font-bold font-sans px-2 py-0.5 rounded shadow-sm">{{ tag }}</span>
            </div>
          </div>

          <!-- Right Action Controls (stop modifier blocks propagation to prevent launching the modal dialog on button click) -->
          <div class="flex items-center gap-2 sm:self-center shrink-0" @click.stop>
            <button @click="handleRestore(app.id)" class="flex items-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-3 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer"><RotateCcw class="w-3.5 h-3.5" />Restore</button>
            <button @click="handlePermanentDelete(app.id)" class="flex items-center gap-1.5 bg-panel-bg/60 hover:bg-rose-500/10 border border-border-line/20 text-ink-secondary hover:text-rose-700 px-3 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer"><Trash2 class="w-3.5 h-3.5" />Purge</button>
          </div>
        </div>

        <div v-if="!isLoading && applications.length === 0" class="border border-dashed border-border-line/40 bg-canvas-bg/20 rounded-2xl p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center space-y-3 select-none">
          <ShieldAlert class="w-8 h-8 text-ink-secondary/60" />
          <h4 class="font-bold text-ink-primary text-sm">Cold storage is empty</h4>
          <p class="text-xs text-ink-secondary font-bold font-sans leading-relaxed tracking-wide">Soft-deleted records will materialize inside this registry view track safely.</p>
        </div>

      </div>
    </div>

    <!-- Mount Connected Multi-Mode Modal Context Form Overlay -->
    <ApplicationModal 
      :is-open="isAppModalOpen"
      :application-data="selectedApplication"
      @close="isAppModalOpen = false"
      @save="handleArchiveFormSave"
    />

  </div>
</template>
