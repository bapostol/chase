<script setup>
import { ref } from 'vue';
import { Calendar, Link2, RotateCcw, Trash2, ShieldAlert } from 'lucide-vue-next';

// 1. Mock Data representing your soft-deleted database historical entries
const archivedApplications = ref([
  {
    id: 'b45c3da1-209f-4318-872e-9d2643a110ef',
    title: 'Junior Infrastructure Associate',
    company: 'Initech Systems',
    url: 'https://initech.com',
    status: 'Rejected',
    is_archived: true,
    tags: ['aws', 'python'],
    created_at: '2026-05-12'
  },
  {
    id: 'e92d8f11-71b0-410a-bc91-23a8e41209b1',
    title: 'Contract Frontend Developer',
    company: 'Cyberdyne Systems',
    url: '',
    status: 'Ghosted',
    is_archived: true,
    tags: ['react', 'webpack'],
    created_at: '2026-04-02'
  }
]);

const handleRestore = (id) => {
  console.log(`Intercepted restore action. Flipping 'is_archived' back to false for ID: ${id}`);
};

const handlePermanentDelete = (id) => {
  console.log(`Intercepted hard delete action. Triggering permanent cascading disk/DB purge for ID: ${id}`);
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-slate-900">
    
    <!-- Sub-Header Utility Options Metadata Section Bar -->
    <div class="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2 select-none">
        <h2 class="text-sm font-bold text-slate-200 tracking-tight">Archived Cold Storage</h2>
        <span class="text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded font-mono">
          Historical Entries: {{ archivedApplications.length }}
        </span>
      </div>
    </div>

    <!-- Scrollable Workspace List Panel -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-4">
        
        <!-- Render Archived List Cards -->
        <div 
          v-for="app in archivedApplications" 
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
                Archived: {{ app.created_at }}
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
            <div v-if="app.tags.length" class="flex flex-wrap gap-1.5 pt-1">
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
            
            <!-- Restore/Un-archive Action Link Trigger -->
            <button 
              @click="handleRestore(app.id)"
              class="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm"
              title="Restore to Active Kanban Pipeline"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Restore
            </button>

            <!-- Permanent Hard Deletion Loop Trigger -->
            <button 
              @click="handlePermanentDelete(app.id)"
              class="flex items-center gap-1.5 bg-slate-900/40 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/40 text-slate-500 hover:text-rose-400 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition"
              title="Permanently Purge Data and Files"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Purge
            </button>

          </div>
        </div>

        <!-- Empty Storage Layout Visual Feedback Placeholder State -->
        <div 
          v-if="archivedApplications.length === 0"
          class="border border-dashed border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto flex flex-col items-center justify-center space-y-3"
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
