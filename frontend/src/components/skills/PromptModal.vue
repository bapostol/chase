<script setup>
import { ref, watch } from 'vue';
import { Terminal, Save, X, Eye, FileEdit, AlertTriangle, ListFilter } from 'lucide-vue-next';
import { useSkills } from '../../composables/useSkills.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

// Master configuration taxonomy mapping parameters
const activeCategory = ref('system_recruiter');
const activeSlug = ref('default');
const newSlugName = ref('');
const localContent = ref('');
const localValidationError = ref('');

// Ingest our dynamic, centralized state composable hooks
const { isSkillsLoading, skillsError, promptVariations, fetchInventory, fetchPrompt, savePrompt } = useSkills();

const handleModalClose = () => emit('close');
const handleBackdropClick = () => emit('close');

const selectCategory = (catId) => {
  activeCategory.value = catId;
  activeSlug.value = 'default'; // Always reset fallback target safely on track change
};

const selectSlug = (slugName) => {
  activeSlug.value = slugName;
};

// Helper utility to convert raw snake_case keys into Proper Case titles automatically
const formatCategoryName = (snakeStr) => {
  return snakeStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Unified background async sync handler
const syncPromptFromBackend = async () => {
  localValidationError.value = '';
  newSlugName.value = '';
  const data = await fetchPrompt(activeCategory.value, activeSlug.value);
  if (data) {
    localContent.value = data.content;
  }
};

// CONSOLIDATION FIX: Single, clean visibility watcher orchestrates initial directory loads
watch(() => props.isOpen, async (nextState) => {
  if (nextState) {
    await fetchInventory(); // Discovers all local variations live off your disk
    await syncPromptFromBackend();
  }
}, { immediate: true });

// Single property watcher re-hydrates your textarea sandbox during user tab selections
watch([activeCategory, activeSlug], () => {
  if (props.isOpen) {
    syncPromptFromBackend();
  }
});

const executeSaveWorkflow = async () => {
  localValidationError.value = '';
  let targetSlug = activeSlug.value;

  // Protect default templates from git index override attempts
  if (activeSlug.value === 'default') {
    const sanitizedSlug = newSlugName.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!sanitizedSlug || sanitizedSlug === 'default') {
      localValidationError.value = 'Provide a unique lowercase slug name (letters, numbers, hyphens) to save a variant.';
      return;
    }
    targetSlug = sanitizedSlug;
  }

  const success = await savePrompt(activeCategory.value, targetSlug, localContent.value);
  if (success) {
    activeSlug.value = targetSlug;
    newSlugName.value = '';
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    
    <!-- Darkened Modal Backdrop Overlay Barrier -->
    <div 
      class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="handleBackdropClick"
    ></div>

    <!-- Centered Modal Panel Body Box -->
    <div class="bg-slate-800 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col h-[85vh] z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Panel Header Bar Layout -->
      <div class="px-6 py-4 bg-slate-800 border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div class="flex flex-col">
          <h2 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal class="w-4 h-4 text-indigo-400" />
            AI Expert Prompt Orchard Settings
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Manage your local 70B expert-system prompts, model persona bounds, and section compilation rule-sets.
          </p>
        </div>
        <button 
          @click="handleModalClose"
          class="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Split Panel Content Grid Workspace -->
      <div class="flex-1 flex overflow-hidden min-h-0">
        
        <!-- LEFT CONTROL SIDEBAR: Category Navigation and Slugs Lists -->
        <div class="w-72 border-r border-slate-700/50 bg-slate-900/20 p-4 space-y-5 overflow-y-auto shrink-0 select-none">
          
          <!-- Category Selector Block -->
          <!-- Replace your Category button loop markup in PromptModal.vue with this clean version -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ListFilter class="w-3 h-3" /> Core Capabilities
            </label>
            <div class="space-y-1">
              <button
                v-for="(_, catKey) in promptVariations"
                :key="catKey"
                @click="selectCategory(catKey)"
                :class="['w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 cursor-pointer', activeCategory === catKey ? 'bg-slate-800 border-slate-700 text-indigo-400 font-bold shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-300']"
              >
                <!-- Automatically un-snake-cases category names for proper UI display -->
                <div class="font-bold text-slate-200 leading-tight" :class="{'text-indigo-400': activeCategory === catKey}">
                  {{ formatCategoryName(catKey) }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                  Click to manage customized prompt variants.
                </div>
              </button>
            </div>
          </div>


          <!-- Variations List Box Selector -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available Variations</label>
            <div class="space-y-1">
              <button
                v-for="slug in promptVariations[activeCategory]"
                :key="slug"
                @click="selectSlug(slug)"
                :class="['w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide border transition cursor-pointer', activeSlug === slug ? 'bg-slate-800 border-indigo-500/40 text-indigo-400 font-extrabold shadow-sm' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700/50']"
              >
                <span class="truncate">{{ slug }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0" :class="slug === 'default' ? 'bg-slate-800 text-slate-500 border border-slate-700/40' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'">
                  {{ slug === 'default' ? 'GIT' : 'FILE' }}
                </span>
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT PANEL: Markdown Text Ingestion Sandbox Textarea -->
        <div class="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          
          <!-- Live Local Client Validation Alert Info Bar Box -->
          <div v-if="localValidationError || skillsError" class="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 shrink-0">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
            <span class="font-medium leading-relaxed">{{ localValidationError || skillsError }}</span>
          </div>

          <!-- Read-Only Notice Shield Alert box triggered on default templates -->
          <div v-if="activeSlug === 'default'" class="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-400 shrink-0 select-none">
            <Eye class="w-4 h-4 shrink-0 mt-0.5" />
            <div class="space-y-0.5">
              <div class="font-bold">Viewing Baseline Git Template</div>
              <p class="text-slate-400 text-[11px] leading-relaxed">The `default.md` core asset file is read-only. Saving modifications will clone it into a unique custom variation.</p>
            </div>
          </div>

          <!-- Workspace Editor Input Layer Canvas -->
          <div class="flex-1 p-6 flex flex-col min-h-0">
            <div class="flex-1 flex flex-col bg-slate-950 border border-slate-800 focus-within:border-slate-700 rounded-2xl shadow-inner overflow-hidden p-4">
              <label class="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-2 select-none flex items-center gap-1">
                <FileEdit class="w-3 h-3" /> markdown_prompt_sandbox
              </label>
              <textarea
                v-model="localContent"
                :disabled="isSkillsLoading"
                class="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-y-auto"
                placeholder="# Enter custom prompt template parameters here..."
              ></textarea>
            </div>
          </div>

          <!-- Control Action Footer Panel Configuration Bar -->
          <div class="px-6 py-4 bg-slate-800/40 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            
            <div class="flex-1 flex items-center gap-2 max-w-sm">
              <template v-if="activeSlug === 'default'">
                <input
                  v-model="newSlugName"
                  type="text"
                  placeholder="Enter unique-slug-name-v1"
                  class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition shadow-inner font-mono"
                />
              </template>
              <template v-else>
                <span class="text-xs text-slate-500 font-medium font-mono truncate select-none">
                  Target: /skills/{{ activeCategory }}/{{ activeSlug }}.md
                </span>
              </template>
            </div>

            <button
              @click="executeSaveWorkflow"
              :disabled="isSkillsLoading"
              class="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition shadow-md shrink-0 cursor-pointer"
            >
              <Save class="w-3.5 h-3.5" />
              {{ isSkillsLoading ? 'Synchronizing...' : 'Save Prompt Variant' }}
            </button>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>
