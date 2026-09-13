<script setup>
import { ref, watch, computed } from 'vue';
import { Briefcase, Link2, FileText, Tag, Plus, X, Save, AlertCircle, Unlock, Lock } from 'lucide-vue-next';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  // If provided, we are editing or viewing an existing card registry entry
  applicationData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

// Form core reactive state structure (Reflects your backend Application validation schemas)
const form = ref({
  title: '',
  company: '',
  url: '',
  status: 'Ready to Apply',
  description_text: ''
});

const tagInput = ref('');
const localTags = ref([]);
const validationError = ref('');

// Administrative force-override tracking state flag for post-applied data rows
const isForceUnlocked = ref(false);

// 1. DYNAMIC MODE EVALUATION GATE: Determines our default component lifecycle behaviors
const mode = computed(() => {
  if (!props.applicationData) return 'create';
  
  // If the record exists but sits outside the initial lane, it defaults to locked view mode
  if (props.applicationData.status !== 'Ready to Apply' && !isForceUnlocked.value) {
    return 'view';
  }
  return 'edit';
});

const isReadOnly = computed(() => mode.value === 'view');

// Calculated title strings feed down into our BaseModal shell wrapper properties
const modalTitle = computed(() => {
  if (mode.value === 'create') return 'Ingest New Job Application Lead';
  if (mode.value === 'edit') return `Modify Scratchpad: ${form.value.title}`;
  return `Telemetry Record: ${form.value.title}`;
});

const modalSubtitle = computed(() => {
  if (mode.value === 'create') return 'Add metadata rows and copy-paste job parameters to feed your local prompt models.';
  if (mode.value === 'edit') return 'You are modifying a pre-applied application track. Fields are completely unlocked for typing updates.';
  return 'This application has active tracking status history. Fields are locked into read-only mode to preserve snapshot context parameters.';
});

// 2. HYDRATION ENGINE: Maps inbound record objects straight onto local form inputs safely
watch(() => props.applicationData, (newData) => {
  if (newData) {
    form.value.title = newData.title || '';
    form.value.company = newData.company || '';
    form.value.url = newData.url || '';
    form.value.status = newData.status || 'Ready to Apply';
    form.value.description_text = newData.description_text || '';
    localTags.value = Array.isArray(newData.tags) ? [...newData.tags] : [];
    isForceUnlocked.value = false; // Reset lock track state on data payload re-load switches
  } else {
    // Reset to baseline defaults if initializing a clean ingestion block
    form.value = { title: '', company: '', url: '', status: 'Ready to Apply', description_text: '' };
    localTags.value = [];
    isForceUnlocked.value = false;
  }
}, { immediate: true, deep: true });

const handleAddTag = () => {
  if (isReadOnly.value) return;
  const cleanTag = tagInput.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  if (cleanTag && !localTags.value.includes(cleanTag)) {
    localTags.value.push(cleanTag);
  }
  tagInput.value = '';
};

const handleRemoveTag = (targetTag) => {
  if (isReadOnly.value) return;
  localTags.value = localTags.value.filter(t => t !== targetTag);
};

const handleCloseClick = () => {
  emit('close');
};

const validateForm = () => {
  validationError.value = '';

  if (!form.value.title.trim()) {
    validationError.value = 'Job title is required to initialize a tracking lane context.';
    return false;
  }
  if (!form.value.company.trim()) {
    validationError.value = 'Company name identifier is required.';
    return false;
  }
  if (!form.value.description_text.trim()) {
    validationError.value = 'Job description text context copy-paste is required.';
    return false;
  }

  if (form.value.url.trim()) {
    const lowercaseUrl = form.value.url.toLowerCase();
    if (!lowercaseUrl.startsWith('http://') && !lowercaseUrl.startsWith('https://')) {
      validationError.value = 'Web connection url link paths must begin with http:// or https://.';
      return false;
    }
  }

  return true;
};

const handleSubmit = () => {
  if (!validateForm()) return;

  const payload = {
    title: form.value.title.trim(),
    company: form.value.company.trim(),
    url: form.value.url.trim() || null,
    status: form.value.status,
    description_text: form.value.description_text.trim(),
    tags: [...localTags.value]
  };

  // If editing an existing record, pass its identifier back up the transaction pipeline channels
  if (props.applicationData?.id) {
    payload.id = props.applicationData.id;
  }

  emit('save', payload);
};
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    max-width="max-w-2xl"
    @close="handleCloseClick"
  >
    <template #icon>
      <Briefcase class="w-4 h-4 text-header-ink" />
    </template>

    <template #content>
      <!-- Dynamic Form Content Section Viewport: bg-canvas-bg with text-ink-primary -->
      <div class="p-6 space-y-4 bg-canvas-bg text-ink-primary select-none">
        
        <!-- Local Validation HUD Error Banner Overlays -->
        <div v-if="validationError" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800 font-sans">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span class="font-medium leading-relaxed">{{ validationError }}</span>
        </div>

        <!-- Input Field Row A: Job Title & Company Name Mapping -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Job Title *</label>
            <input 
              v-model="form.title" 
              type="text" 
              :disabled="isReadOnly"
              placeholder="e.g. Senior Distributed Systems Engineer" 
              class="bg-panel-bg border border-border-line/40 disabled:opacity-70 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner font-serif" 
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Company Name *</label>
            <input 
              v-model="form.company" 
              type="text" 
              :disabled="isReadOnly"
              placeholder="e.g. Stark Industries" 
              class="bg-panel-bg border border-border-line/40 disabled:opacity-70 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner font-serif" 
            />
          </div>
        </div>

        <!-- Input Field Row B: Posting Link URL & Dynamic Status Lane Dropdowns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Job Posting Link URL</label>
            <div class="relative flex items-center">
              <Link2 class="absolute left-3.5 w-4 h-4 text-ink-muted pointer-events-none" />
              <input 
                v-model="form.url" 
                type="url" 
                :disabled="isReadOnly"
                placeholder="https://linkedin.com..." 
                class="w-full bg-panel-bg border border-border-line/40 disabled:opacity-70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner font-sans font-medium" 
              />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Current Ingestion Status *</label>
            <select 
              v-model="form.status" 
              :disabled="isReadOnly"
              class="bg-panel-bg border border-border-line/40 disabled:opacity-70 rounded-xl px-4 py-2.5 text-sm text-ink-primary focus:border-brand-primary focus:outline-none transition shadow-inner cursor-pointer font-sans font-semibold"
            >
              <option value="Ready to Apply">Ready to Apply</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Ghosted">Ghosted</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Input Field Row C: Metadata Search Tags Appender Registry -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Metadata Tracking Tags</label>
          <div v-if="!isReadOnly" class="flex items-center gap-2">
            <input 
              v-model="tagInput" 
              type="text" 
              placeholder="Type tag keywords and hit enter (e.g. vue3)" 
              @keydown.enter.prevent="handleAddTag" 
              class="flex-1 bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" 
            />
            <button @click="handleAddTag" class="bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink p-2.5 rounded-xl transition cursor-pointer">
              <Plus class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Live Active Metadata Tags Render Array List -->
          <div v-if="localTags.length" class="flex flex-wrap gap-1.5 pt-1.5">
            <span 
              v-for="tag in localTags" 
              :key="tag" 
              class="bg-panel-bg border border-border-line/30 text-ink-primary text-xs font-bold font-sans px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              {{ tag }}
              <button v-if="!isReadOnly" @click="handleRemoveTag(tag)" class="text-ink-muted hover:text-rose-700 p-0.5 transition cursor-pointer">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <!-- Input Field Row D: Rich Job Description Context Document Area Textbox -->
        <div class="flex flex-col gap-1.5 h-full min-h-[260px]">
          <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Job Description Source Text *</label>
          <div class="flex-1 flex flex-col bg-panel-bg border border-border-line/40 rounded-2xl shadow-inner overflow-hidden p-4 min-h-[200px]">
            <label class="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1">
              <FileText class="w-3 h-3" /> raw_description_text_stream
            </label>
            <textarea 
              v-model="form.description_text" 
              :disabled="isReadOnly"
              placeholder="Paste the raw description copy text here. This block acts as the baseline reference anchor when running gap calculations and section tailoring routines..." 
              class="w-full flex-1 bg-transparent text-ink-primary font-serif text-sm focus:outline-none resize-none leading-relaxed overflow-y-auto"
            ></textarea>
          </div>
        </div>

      </div>
    </template>

    <template #footer>
      <!-- Mode Context Left Slot Utility Controls -->
      <div class="flex-1 flex items-center">
        <!-- View Mode: Render administrative override unlock button layout -->
        <button
          v-if="mode === 'view'"
          @click="isForceUnlocked = true"
          class="flex items-center gap-1.5 bg-header-bg hover:opacity-90 border border-border-line/20 text-header-ink px-3 py-1.5 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer"
        >
          <Unlock class="w-3.5 h-3.5" />
          Unlock Administrative Fields
        </button>
        
        <!-- Edit Mode Override Warning Label Badge Tracker -->
        <span 
          v-else-if="mode === 'edit' && props.applicationData?.status !== 'Ready to Apply'"
          class="flex items-center gap-1.5 text-[10px] font-bold font-sans uppercase bg-indigo-600 text-header-ink border border-border-line/20 px-2.5 py-1 rounded"
        >
          <Lock class="w-3 h-3 animate-pulse" />
          Force-Override Active
        </span>
      </div>

      <!-- General Form Closing Action Triggers -->
      <button 
        @click="handleCloseClick" 
        class="bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer"
      >
        Close
      </button>

      <!-- Primary Action Commit Trigger Button: Hidden while locked in View Mode -->
      <button 
        v-if="mode !== 'view'"
        @click="handleSubmit" 
        class="flex items-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-md cursor-pointer"
      >
        <Save class="w-3.5 h-3.5 text-header-ink" />
        <template v-if="mode === 'create'">Ingest Application Lead</template>
        <template v-else>Save Scratchpad Modifications</template>
      </button>
    </template>
  </BaseModal>
</template>
