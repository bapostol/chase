<script setup>
import { ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import KanbanBoard from '../components/kanban/KanbanBoard.vue';

const LANES = ['Ready to Apply', 'Applied', 'Interviewing', 'Ghosted', 'Offer', 'Rejected'];

const applications = ref([
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    title: 'Senior Full-Stack Engineer',
    company: 'Stark Industries',
    url: 'https://linkedin.com',
    status: 'Ready to Apply',
    is_archived: false,
    tags: ['vue3', 'node', 'tailwind'],
    created_at: '2026-09-08'
  },
  {
    id: 'a32b9f31-8c4d-4e9a-bc21-11d9f82c3041',
    title: 'Backend Systems Architect',
    company: 'Wayne Enterprises',
    url: 'https://linkedin.com',
    status: 'Interviewing',
    is_archived: false,
    tags: ['knex', 'sqlite', 'zod'],
    created_at: '2026-09-07'
  },
  {
    id: 'c81e728d-932d-41a4-b09e-712865431109',
    title: 'Software Developer',
    company: 'Acme Systems Corp',
    url: '',
    status: 'Ghosted',
    is_archived: false,
    tags: ['javascript', 'express'],
    created_at: '2026-08-15'
  }
]);

const handleCardSelection = (id) => {
  console.log(`Card selection event bubble caught inside DashboardView. Application Target ID: ${id}`);
};

const handleAddApplicationClick = () => {
  console.log('Open new application entry creation modal layout context...');
};
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-slate-900">
    
    <!-- Local Options Context Action Sub-Bar -->
    <div class="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-200 tracking-tight">Active Ingestion Funnel</h2>
        <span class="text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded font-mono">
          Total Leads: {{ applications.filter(a => !a.is_archived).length }}
        </span>
      </div>
      
      <button 
        @click="handleAddApplicationClick"
        class="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition shadow-sm"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Application
      </button>
    </div>

    <!-- Decoupled Component Board Layer -->
    <KanbanBoard 
      :lanes="LANES" 
      :applications="applications.filter(a => !a.is_archived)"
      @card-select="handleCardSelection"
    />

  </div>
</template>
