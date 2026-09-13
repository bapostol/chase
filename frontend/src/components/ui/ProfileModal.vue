<script setup>
import { ref, watch } from 'vue';
import { User, Link, FileText, Save, AlertCircle } from 'lucide-vue-next';
import BaseModal from './BaseModal.vue'; // Ingest core framework shell

const props = defineProps({
  isClosable: {
    type: Boolean,
    default: true
  },
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);
const activeTab = ref('personal');

const form = ref({
  name: '', email: '', phone: '', location: '',
  website: '', github: '', linkedin: '', summary_baseline: ''
});

const validationError = ref('');

watch(() => props.profileData, (newData) => {
  if (newData) {
    form.value.name = newData.name || '';
    form.value.email = newData.email || '';
    form.value.phone = newData.phone || '';
    form.value.location = newData.location || '';
    form.value.website = newData.website || '';
    form.value.github = newData.github || '';
    form.value.linkedin = newData.linkedin || '';
    form.value.summary_baseline = newData.summary_baseline || '';
  }
}, { immediate: true, deep: true });

const handleCloseClick = () => emit('close');

const validateForm = () => {
  validationError.value = '';
  if (!form.value.name.trim()) {
    validationError.value = 'Full name is required to initialize your profile context.';
    activeTab.value = 'personal';
    return false;
  }
  if (form.value.email.trim() && !form.value.email.includes('@')) {
    validationError.value = 'Please provide a valid email format identifier.';
    activeTab.value = 'personal';
    return false;
  }
  return true;
};

const handleSubmit = () => {
  if (!validateForm()) return;
  emit('save', { ...form.value });
};
</script>

<template>
  <BaseModal
    :is-open="true"
    :is-closable="isClosable"
    :title="isClosable ? 'Profile Configuration Settings' : 'Initialize CHASE Environment'"
    :subtitle="isClosable ? 'Modify your personal background details and portfolio tracking parameters.' : 'Provide your baseline information to feed your local 70B prompt models.'"
    max-width="max-w-2xl"
    @close="handleCloseClick"
  >
    <template #icon>
      <User class="w-4 h-4 text-header-ink" />
    </template>

    <template #content>
      <!-- Sub-Tab Header Navigation bar nested directly inside contents layer -->
      <div class="flex border-b border-border-line/20 bg-header-bg px-4 pt-2 shrink-0 select-none text-header-ink">
        <button @click="activeTab = 'personal'" :class="['flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide font-sans transition-all duration-200 cursor-pointer', activeTab === 'personal' ? 'border-brand-accent text-header-ink font-extrabold' : 'border-transparent opacity-60 hover:opacity-100']">
          <User class="w-3.5 h-3.5" /> Personal Details
        </button>
        <button @click="activeTab = 'links'" :class="['flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide font-sans transition-all duration-200 cursor-pointer', activeTab === 'links' ? 'border-brand-accent text-header-ink font-extrabold' : 'border-transparent opacity-60 hover:opacity-100']">
          <Link class="w-3.5 h-3.5" /> Social & Links
        </button>
        <button @click="activeTab = 'summary'" :class="['flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide font-sans transition-all duration-200 cursor-pointer', activeTab === 'summary' ? 'border-brand-accent text-header-ink font-extrabold' : 'border-transparent opacity-60 hover:opacity-100']">
          <FileText class="w-3.5 h-3.5" /> Summary Baseline
        </button>
      </div>

      <div class="p-6 space-y-4 bg-canvas-bg text-ink-primary">
        <div v-if="validationError" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800 font-sans">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span class="font-medium leading-relaxed">{{ validationError }}</span>
        </div>

        <div v-show="activeTab === 'personal'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Full Name *</label><input v-model="form.name" type="text" placeholder="e.g. John Doe" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Email Address</label><input v-model="form.email" type="email" placeholder="e.g. john@example.com" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Phone Vector</label><input v-model="form.phone" type="text" placeholder="e.g. +1 234 567 890" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Physical Location</label><input v-model="form.location" type="text" placeholder="e.g. Abu Dhabi, UAE" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
        </div>

        <div v-show="activeTab === 'links'" class="space-y-4">
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Personal Website</label><input v-model="form.website" type="url" placeholder="https://myportfolio.dev" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">GitHub Link Profile</label><input v-model="form.github" type="url" placeholder="https://github.com" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
          <div class="flex flex-col gap-1.5"><label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">LinkedIn Networking URL</label><input v-model="form.linkedin" type="url" placeholder="https://linkedin.com" class="bg-panel-bg border border-border-line/40 rounded-xl px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:border-brand-primary focus:outline-none transition shadow-inner" /></div>
        </div>

        <div v-show="activeTab === 'summary'" class="flex flex-col gap-1.5 h-full min-h-[220px]">
          <label class="text-[11px] font-bold uppercase tracking-wider text-ink-secondary font-sans">Professional Summary Framework</label>
          <div class="flex-1 flex flex-col bg-panel-bg border border-border-line/40 focus-within:border-border-line/70 rounded-2xl shadow-inner p-4 min-h-[200px]">
            <textarea v-model="form.summary_baseline" placeholder="Outline your background proficiencies..." class="w-full flex-1 bg-transparent text-ink-primary font-serif text-sm focus:outline-none resize-none leading-relaxed overflow-y-auto"></textarea>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button v-if="isClosable" @click="handleCloseClick" class="bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer">
        Cancel
      </button>
      <button @click="handleSubmit" class="flex items-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-4 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-md cursor-pointer">
        <Save class="w-3.5 h-3.5 text-header-ink" />
        Commit Profile Registry
      </button>
    </template>
  </BaseModal>
</template>
