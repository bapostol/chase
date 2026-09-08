<script setup>
import { ref } from 'vue';
import DashboardView from './views/DashboardView.vue';
import ArchiveView from './views/ArchiveView.vue';
import AppHeader from './components/ui/AppHeader.vue';
import ProfileModal from './components/ui/ProfileModal.vue';

// View states tracking: 'dashboard' | 'archive'
const currentView = ref('dashboard');

// Modal visibility flags
const isProfileModalOpen = ref(false);

// Mock profile tracking flags. These will connect directly to your express API states later
const isProfileComplete = ref(false); // Emulates a brand new user out of the box

// On system boot, if profile.json is blank, force-open the modal gate defensively
if (!isProfileComplete.value) {
  isProfileModalOpen.value = true;
}

const handleProfileSave = (updatedProfile) => {
  isProfileComplete.value = true;
  isProfileModalOpen.value = false;
  console.log('User profile securely synchronized to disk:', updatedProfile);
};
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    
    <!-- Primary Shell Navigation Layout header -->
    <AppHeader 
      :active-view="currentView"
      @navigate="(view) => currentView = view"
      @open-profile="isProfileModalOpen = true"
    />

    <!-- Core Pipeline Workspace Swapping Area -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <DashboardView v-if="currentView === 'dashboard'" />
      <ArchiveView v-else-if="currentView === 'archive'" />
    </main>

    <!-- Unified Profile Modal Component Layer -->
    <!-- Enforces non-dismissible backdrop constraints if profile configuration is empty -->
    <ProfileModal 
      v-if="isProfileModalOpen"
      :is-closable="isProfileComplete"
      @close="isProfileModalOpen = false"
      @save="handleProfileSave"
    />

  </div>
</template>
