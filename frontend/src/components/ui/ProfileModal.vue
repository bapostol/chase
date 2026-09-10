<script setup>
import { ref, watch } from 'vue';
import { User, Link, FileText, Save, X, AlertCircle } from 'lucide-vue-next';

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
  name: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
  summary_baseline: ''
});

const validationError = ref('');

watch(() => props.profileData, (newData) => {
  if (newData) {
    form.value = {
      name: newData.name || '',
      email: newData.email || '',
      phone: newData.phone || '',
      location: newData.location || '',
      website: newData.website || '',
      github: newData.github || '',
      linkedin: newData.linkedin || '',
      summary_baseline: newData.summary_baseline || ''
    };
  }
}, { immediate: true });

// Helper events to bypass inline dollar signs in markdown
const handleCloseClick = () => {
    emit('close');
};

const handleBackdropClick = () => {
    if (props.isClosable) {
        emit('close');
    }
};

// Client Side Schema Evaluation Gate Guard
const validateForm = () => {
    validationError.value = '';

    if (!form.value.name.trim()) {
        validationError.value = 'Full name is required to initialize your profile context.';
        activeTab.value = 'personal';
        return false;
    }

    // Simple string pattern tests to catch typos before hitting backend Zod boundaries
    if (form.value.email.trim() && !form.value.email.includes('@')) {
        validationError.value = 'Please provide a valid email format identifier.';
        activeTab.value = 'personal';
        return false;
    }

    const urlFields = ['website', 'github', 'linkedin'];

    for (const field of urlFields) {
        const val = form.value[field].trim();
        if (val) {
            const lowercaseVal = val.toLowerCase();
            if (!lowercaseVal.startsWith('http://') && !lowercaseVal.startsWith('https://')) {
                validationError.value = `Your ${field} link must begin with http:// or https://.`;
                activeTab.value = 'links';
                return false;
            }

            // Basic sanity check to ensure a domain exists after the protocol prefix
            if (val.replace('http://', '').replace('https://', '').trim().length < 3) {
                validationError.value = `Please provide a complete URL structure for your ${field} address.`;
                activeTab.value = 'links';
                return false;
            }
        }
    }


    return true;
};

const handleSubmit = () => {
    if (!validateForm()) return;

    // Format data payload strings cleanly to prepare for the API delivery pipeline
    const payload = {
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        phone: form.value.phone.trim(),
        location: form.value.location.trim(),
        website: form.value.website.trim(),
        github: form.value.github.trim(),
        linkedin: form.value.linkedin.trim(),
        summary_baseline: form.value.summary_baseline.trim()
    };

    emit('save', payload);
};
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">

        <!-- Darkened Modal Backdrop Overlay Barrier -->
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" @click="handleBackdropClick">
        </div>

        <!-- Central Interactive Config Panel Body Box -->
        <div
            class="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden transform transition-all">

            <!-- Panel Header Bar Layout -->
            <div class="px-6 py-4 bg-slate-800 border-b border-slate-700/60 flex items-center justify-between">
                <div class="flex flex-col">
                    <h2 class="text-base font-bold text-white tracking-tight">
                        <template v-if="isClosable">Profile Configuration Settings</template>
                        <template v-else>Initialize CHASE Environment</template>
                    </h2>
                    <p class="text-xs text-slate-400 mt-0.5">
                        <template v-if="isClosable">Modify your personal details.</template>
                        <template v-else>Provide your baseline information to initialize your profile.</template>
                    </p>
                </div>

                <!-- Render Dismiss trigger button only if out of initial onboarding block bounds -->
                <button v-if="isClosable" @click="handleCloseClick"
                    class="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700/50 transition">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <!-- Tab Selection Bar Module Grid Matrix -->
            <div class="flex border-b border-slate-700/40 bg-slate-900/20 px-4 pt-2">
                <button @click="activeTab = 'personal'"
                    :class="['flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide transition-all duration-200', activeTab === 'personal' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200']">
                    <User class="w-3.5 h-3.5" />
                    Personal Details
                </button>
                <button @click="activeTab = 'links'"
                    :class="['flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide transition-all duration-200', activeTab === 'links' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200']">
                    <Link class="w-3.5 h-3.5" />
                    Social & Links
                </button>
                <button @click="activeTab = 'summary'"
                    :class="['flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide transition-all duration-200', activeTab === 'summary' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200']">
                    <FileText class="w-3.5 h-3.5" />
                    Summary Baseline
                </button>
            </div>

            <!-- Dynamic Form Content Section Viewport -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">

                <!-- Live Client Warning Error Alert Message Bar Box -->
                <div v-if="validationError"
                    class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-400">
                    <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                    <span class="font-medium leading-relaxed">{{ validationError }}</span>
                </div>

                <!-- Tab Panel A: Personal Identification Inputs -->
                <div v-show="activeTab === 'personal'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 after:content-['*'] after:ml-0.5 after:text-red-500">Full Name</label>
                        <input v-model="form.name" type="text" placeholder="e.g. John Doe"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email
                            Address</label>
                        <input v-model="form.email" type="email" placeholder="e.g. john@example.com"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone
                            Number</label>
                        <input v-model="form.phone" type="text" placeholder="e.g. +1 234 567 890"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Physical
                            Location</label>
                        <input v-model="form.location" type="text" placeholder="e.g. Abu Dhabi, UAE"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                </div>

                <!-- Tab Panel B: Social Network Routing Matrix Addresses -->
                <div v-show="activeTab === 'links'" class="space-y-4">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Personal Website /
                            Portfolio</label>
                        <input v-model="form.website" type="url" placeholder="https://myportfolio.dev"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">GitHub Link
                            Profile</label>
                        <input v-model="form.github" type="url" placeholder="https://github.com"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">LinkedIn Networking
                            URL</label>
                        <input v-model="form.linkedin" type="url" placeholder="https://linkedin.com"
                            class="bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner" />
                    </div>
                </div>
                <!-- Tab Panel C: Heavy Text Summary Baseline Definition block -->
                <div v-show="activeTab === 'summary'" class="flex flex-col gap-1.5 h-full min-h-[220px]">
                    <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Professional Summary
                        Framework</label>
                    <textarea v-model="form.summary_baseline"
                        placeholder="Outline your baseline technical background, expertise tracks, primary system frameworks, and target execution fields. This block acts as a core reference anchor when your local 70B model builds custom resume variations..."
                        class="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none resize-none min-h-[180px] transition shadow-inner leading-relaxed"></textarea>
                </div>
            </div>

            <!-- Action Panel Footer Control Bar Layout -->
            <div
                class="px-6 py-4 bg-slate-900/40 border-t border-slate-700/60 flex items-center justify-end gap-3 shrink-0">
                <button v-if="isClosable" @click="handleCloseClick"
                    class="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition">
                    Cancel
                </button>
                <button @click="handleSubmit"
                    class="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition shadow-md">
                    <Save class="w-3.5 h-3.5" />
                    Commit Profile Registry
                </button>
            </div>

        </div>
    </div>
</template>
