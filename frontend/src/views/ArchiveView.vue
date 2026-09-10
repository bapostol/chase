<script setup>
import { onMounted } from 'vue';
import { Calendar, Link2, RotateCcw, Trash2, ShieldAlert } from 'lucide-vue-next';
import { useApplications } from '../composables/useApplications.js';

// Ingest our live centralized database connection tools
const { applications, isLoading, error, fetchApplications, patchApplication, purgeApplication } = useApplications();

// Trigger a live database evaluation sweep targeting ONLY soft-deleted rows when view mounts
onMounted(async () => {
  await fetchApplications(true); // Passes true to filter exclusively for is_archived === 1
});

const handleRestore = async (id) => {
  // Flips the soft-delete flag back to false. 
  // Our optimistic UI composable will instantly drop it from this view list
  await patchApplication(id, { is_archived: false });
};

const handlePermanentDelete = async (id) => {
  const confirmed = confirm("Are you absolutely sure you want to permanently delete this application? This will wipe all database metrics and recursively erase its job description text file off your storage disk irreversibly.");
  if (confirmed) {
    await purgeApplication(id);
  }
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-slate-900">
    
    <!-- Local Options Sub-Bar Controls Section -->
    <div class="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between shrink-0 h-12">
      <div class="flex items-center gap-2 select-none">
        <h2 class="text-sm font-bold text-slate-200 tracking-tight">Archived Cold Storage</h2>
        
        <span 
          v-if="isLoading" 
          class="text-[10px] text-indigo-400 font-mono animate-pulse"
        >
          Querying SQLite Archive...
        </span>
        <span 
          v-else
          class="text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded font-mono"
        >
          Historical Records: {{ applications.length }}
        </span>
      </div>
    </div>

    <!-- Error HUD Alert Message Box Overlay -->
    <div 
      v-if="error" 
      class="m-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium"
    >
      {{ error }}
    </div>

    <!-- Scrollable Archive Workspace Layout List -->
    <div v-else class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-4">
        
        <!-- Render Live Archived Rows from Database -->
        <div 
          v-for="app in applications" 
          :key="app.id"
          class="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5 shadow-sm hover:border-slate-600/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
        >
          
          <div class="space-y-2 max-w-xl">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-bold text-base text-white group-hover:text-indigo-400 transition leading-none">
                {{ app.title }}
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-700/40">
                {{ app.status }}
              </span>
            </div>
            
            <p class="text-xs text-slate-400 font-medium leading-none">{{ app.company }}</p>
            
            <!-- Context Telemetry Badges (Date and URL Links) -->
            <div class="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] pt-1">
              <span class="flex items-center gap-1">
                <Calendar class="w-3.5 h-3.5" />
                Created: {{ new Date(app.created_at).toLocaleDateString() }}
              </span>
              <a 
                v-if="app.url" 
                :href="app.url" 
                target="_blank"
                class="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition"
              >
                <Link2 class="w-3.5 h-3.5" />
                View Posting
              </a>
            </div>

            <!-- Ingested Tags Render Box -->
            <div v-if="app.tags && app.tags.length" class="flex flex-wrap gap-1.5 pt-1">
              <span 
                v-for="tag in app.tags" 
                :key="tag"
                class="bg-slate-900 border border-slate-700/40 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Right Content Cluster: Action Controls -->
          <div class="flex items-center gap-2 sm:self-center shrink-0">
            
            <!-- Restore Button: Sends patch request to flip is_archived back to false -->
            <button 
              @click="handleRestore(app.id)"
              class="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm cursor-pointer"
              title="Restore to Active Kanban Pipeline"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Restore
            </button>

            <!-- Permanent Hard Deletion Trigger: Wipes database and recursive folders off disk -->
            <button 
              @click="handlePermanentDelete(app.id)"
              class="flex items-center gap-1.5 bg-slate-900/40 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/40 text-slate-500 hover:text-rose-400 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer"
              title="Permanently Purge Data and Files"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Purge
            </button>

          </div>
        </div>

        <!-- Empty Storage Layout Visual Feedback Placeholder State -->
        <div 
          v-if="!isLoading && applications.length === 0"
          class="border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center space-y-3 select-none"
        >
          <ShieldAlert class="w-8 h-8 text-slate-700" />
          <h4 class="font-bold text-slate-400 text-sm">Cold storage is empty</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Soft-deleted applications will materialize inside this register, protecting your historical data models from irreversible data loss.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>
