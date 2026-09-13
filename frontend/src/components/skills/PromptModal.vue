<script setup>
import { ref, watch } from 'vue';
import { Terminal, Save, Eye, FileEdit, AlertTriangle, ListFilter } from 'lucide-vue-next';
import { useSkills } from '../../composables/useSkills.js';
import BaseModal from '../ui/BaseModal.vue'; // Ingest core framework shell

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const activeCategory = ref('system_recruiter');
const activeSlug = ref('default');
const newSlugName = ref('');
const localContent = ref('');
const localValidationError = ref('');

const { isSkillsLoading, skillsError, promptVariations, fetchInventory, fetchPrompt, savePrompt } = useSkills();

const handleModalClose = () => emit('close');

const selectCategory = (catId) => {
  activeCategory.value = catId;
  activeSlug.value = 'default';
};

const selectSlug = (slugName) => {
  activeSlug.value = slugName;
};

const formatCategoryName = (snakeStr) => {
  return snakeStr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const syncPromptFromBackend = async () => {
  localValidationError.value = '';
  newSlugName.value = '';
  const data = await fetchPrompt(activeCategory.value, activeSlug.value);
  if (data) {
    localContent.value = data.content;
  }
};

watch(() => props.isOpen, async (nextState) => {
  if (nextState) {
    await fetchInventory();
    await syncPromptFromBackend();
  }
}, { immediate: true });

watch([activeCategory, activeSlug], () => {
  if (props.isOpen) {
    syncPromptFromBackend();
  }
});

const executeSaveWorkflow = async () => {
  localValidationError.value = '';
  let targetSlug = activeSlug.value;

  if (activeSlug.value === 'default') {
    const sanitizedSlug = newSlugName.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!sanitizedSlug || sanitizedSlug === 'default') {
      localValidationError.value = 'Provide a unique lowercase slug name to save a variant.';
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
  <BaseModal
    :is-open="isOpen"
    title="AI Expert Prompt Orchard Settings"
    subtitle="Manage your local 70B expert-system prompts, model persona bounds, and section compilation rule-sets."
    max-width="max-w-5xl"
    @close="handleModalClose"
  >
    <template #icon>
      <Terminal class="w-4 h-4 text-header-ink" />
    </template>

    <template #content>
      <div class="flex h-full min-h-0 text-ink-primary">
        <!-- Sidebar Navigation Track -->
        <div class="w-72 border-r border-border-line/20 bg-panel-bg/20 p-4 space-y-5 overflow-y-auto shrink-0 select-none">
          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1 font-sans">
              <ListFilter class="w-3 h-3" /> Core Capabilities
            </label>
            <div class="space-y-1">
              <button v-for="(_, catKey) in promptVariations" :key="catKey" @click="selectCategory(catKey)" :class="['w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 cursor-pointer', activeCategory === catKey ? 'bg-panel-bg border-border-line/40 text-ink-primary font-bold shadow-sm' : 'bg-transparent border-transparent text-ink-secondary hover:text-ink-primary']">
                <div class="font-bold leading-tight" :class="{'text-brand-primary font-extrabold': activeCategory === catKey}">{{ formatCategoryName(catKey) }}</div>
                <div class="text-[10px] opacity-70 font-medium mt-0.5 leading-relaxed font-sans">Manage prompt variations.</div>
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Available Variations</label>
            <div class="space-y-1">
              <button v-for="slug in promptVariations[activeCategory]" :key="slug" @click="selectSlug(slug)" :class="['w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide border transition cursor-pointer', activeSlug === slug ? 'bg-panel-bg border-border-line/40 text-ink-primary font-extrabold shadow-sm' : 'bg-transparent border-transparent text-ink-secondary hover:text-ink-primary']">
                <span class="truncate" :class="{'text-brand-primary font-bold': activeSlug === slug}">{{ slug }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 shadow-sm" :class="slug === 'default' ? 'bg-header-toggle text-header-ink border border-border-line/20' : 'bg-panel-bg border border-border-line/40 text-ink-secondary'">
                  {{ slug === 'default' ? 'GIT' : 'FILE' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sandbox Textarea Canvas -->
        <div class="flex-1 flex flex-col bg-canvas-bg overflow-hidden">
          <div v-if="localValidationError || skillsError" class="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-sans">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
            <span class="font-medium leading-relaxed">{{ localValidationError || skillsError }}</span>
          </div>

          <div v-if="activeSlug === 'default'" class="mx-6 mt-4 p-3 bg-panel-bg border border-border-line/40 rounded-xl flex items-start gap-2.5 text-xs text-ink-secondary select-none">
            <Eye class="w-4 h-4 shrink-0 mt-0.5 text-ink-secondary" />
            <div class="space-y-0.5">
              <div class="font-bold text-ink-primary">Viewing Baseline Git Template</div>
              <p class="text-ink-secondary text-[11px] leading-relaxed font-sans">The `default.md` file is read-only. Saving modifications clones a variation.</p>
            </div>
          </div>

          <div class="flex-1 p-6 flex flex-col min-h-0">
            <div class="flex-1 flex flex-col bg-panel-bg border border-border-line/40 focus-within:border-border-line/70 rounded-2xl shadow-inner p-4">
              <label class="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-muted mb-2 select-none flex items-center gap-1">
                <FileEdit class="w-3 h-3" /> markdown_prompt_sandbox
              </label>
              <textarea v-model="localContent" :disabled="isSkillsLoading" class="w-full flex-1 bg-transparent text-ink-primary font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-y-auto"></textarea>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex-1 flex items-center gap-2 max-w-sm">
        <template v-if="activeSlug === 'default'">
          <input v-model="newSlugName" type="text" placeholder="Enter unique-slug-name-v1" class="w-full bg-panel-bg border border-border-line/40 focus:border-brand-primary rounded-xl px-3.5 py-2 text-xs text-ink-primary placeholder-ink-muted focus:outline-none transition shadow-inner font-mono" />
        </template>
        <template v-else>
          <span class="text-xs text-header-ink font-medium font-mono truncate select-none">
            Target: /skills/{{ activeCategory }}/{{ activeSlug }}.md
          </span>
        </template>
      </div>

      <button @click="executeSaveWorkflow" :disabled="isSkillsLoading" class="flex items-center justify-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-md shrink-0 cursor-pointer">
        <Save class="w-3.5 h-3.5 text-header-ink" />
        {{ isSkillsLoading ? 'Synchronizing...' : 'Save Prompt Variant' }}
      </button>
    </template>
  </BaseModal>
</template>
