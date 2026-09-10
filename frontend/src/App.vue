<script setup>
import { ref, onMounted } from 'vue';
import DashboardView from './views/DashboardView.vue';
import ArchiveView from './views/ArchiveView.vue';
import AppHeader from './components/ui/AppHeader.vue';
import ProfileModal from './components/ui/ProfileModal.vue';
import PromptModal from './components/skills/PromptModal.vue';

// Ingest clean, live state hooks
import { useProfile } from './composables/useProfile.js';

const currentView = ref('dashboard');
const isProfileModalOpen = ref(false);
const isPromptsModalOpen = ref(false);

const { profile, fetchProfile, saveProfile } = useProfile();

// Trigger an automatic network call on browser load to discover workspace files states
onMounted(() => {
  fetchProfile();
});

const handleProfileSave = async (payload) => {
  const success = await saveProfile(payload);
  if (success) {
    isProfileModalOpen.value = false; 
    console.log('User profile setup verified and locked in.');
  }
};
</script>

<template>
  <div v-if="profile" class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    
    <AppHeader 
      :active-view="currentView"
      @navigate="(view) => currentView = view"
      @open-profile="isProfileModalOpen = true"
      @open-prompts="isPromptsModalOpen = true"
    />

    <main class="flex-1 flex flex-col overflow-hidden">
      <DashboardView v-if="currentView === 'dashboard'" />
      <ArchiveView v-else-if="currentView === 'archive'" />
    </main>

    <!-- Modal locks viewport context if profile data reads incomplete -->
    <ProfileModal 
      v-if="isProfileModalOpen || !profile.is_profile_complete"
      :is-closable="profile.is_profile_complete"
      :profile-data="profile"
      @close="isProfileModalOpen = false"
      @save="handleProfileSave"
    />

    <PromptModal 
      :is-open="isPromptsModalOpen"
      @close="isPromptsModalOpen = false"
    />

  </div>
  
  <!-- Fast Loading Placeholder screen while Axios hits the Express proxy layers -->
  <div v-else class="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-xs select-none">
    Initializing CHASE Core Subsystems...
  </div>
</template>
