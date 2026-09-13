<script setup>
import { ref } from 'vue';
import { Briefcase, Archive, User, Activity, Terminal, Palette } from 'lucide-vue-next';
import { useTheme } from '../../composables/useTheme.js';

defineProps({
  activeView: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['navigate', 'openProfile', 'openPrompts']);

// 1. Ingest our persistent theme state engine methods
const { activeTheme, setTheme } = useTheme();

// Toggle tracking flag for the local theme selector selection dropdown list panel
const isDropdownOpen = ref(false);

const THEMES = [
  { id: 'classic', name: 'Classic Slate' },
  { id: 'espresso', name: 'Espresso & Cream' },
  { id: 'woodland', name: 'Woodland Olive' },
  { id: 'moss', name: 'Abyssal Moss' }
];

const handleThemeSelection = (themeId) => {
  setTheme(themeId);
  isDropdownOpen.value = false;
};

const handleNavigateClick = (viewTarget) => {
  emit('navigate', viewTarget);
};

const handleProfileClick = () => {
  emit('openProfile');
};

const handlePromptsClick = () => {
  emit('openPrompts');
};
</script>


<template>
  <!-- SWAPPED TO bg-header-bg AND text-header-ink SEMANTIC VARIABLE CLASSES -->
  <header class="bg-header-bg border-b border-border-line/30 px-6 py-4 flex items-center justify-between shadow-md shrink-0 select-none text-header-ink relative">
    
    
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold tracking-wider text-white shadow-inner">
        C
      </div>
      <div class="flex flex-col">
        <h1 class="text-sm font-bold tracking-tight leading-none">CHASE</h1>
        <span class="text-[10px] opacity-70 font-medium tracking-wide mt-0.5 font-sans">Career Hunt Assistant</span>
      </div>
    </div>

    <!-- Center Section: Master Navigation Links Toggle (bg-header-toggle) -->
    <nav class="flex items-center bg-header-toggle p-1 rounded-xl border border-border-line/20 shadow-inner">
      
      <button 
        @click="handleNavigateClick('dashboard')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all duration-200 cursor-pointer text-header-ink',
          activeView === 'dashboard' 
            ? 'bg-header-bg shadow-sm border border-border-line/20 font-bold' 
            : 'opacity-70 hover:opacity-100'
        ]"
      >
        <Briefcase class="w-3.5 h-3.5" />
        Pipeline Board
      </button>

      <button 
        @click="handleNavigateClick('archive')"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all duration-200 cursor-pointer text-header-ink',
          activeView === 'archive' 
            ? 'bg-header-bg shadow-sm border border-border-line/20 font-bold' 
            : 'opacity-70 hover:opacity-100'
        ]"
      >
        <Archive class="w-3.5 h-3.5" />
        Archive Yard
      </button>

    </nav>

    <!-- Right Section: System Connectivity Monitors, Theme Selector, & Config Actions -->
    <div class="flex items-center gap-2.5 relative">
      
      <!-- Hardcoded Network Telemetry Tag (bg-header-toggle) -->
      <div class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-header-toggle border border-border-line/20 text-[11px] font-bold font-sans select-none shadow-inner">
        <Activity class="w-3 h-3 text-brand-accent animate-pulse" />
        chase_core: v1.0
      </div>

      <!-- ACTIVE THEME SELECTOR INTERACTIVE DROPDOWN -->
      <div class="relative">
        <button 
          @click="isDropdownOpen = !isDropdownOpen"
          class="flex items-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-3 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer"
        >
          <Palette class="w-3.5 h-3.5" />
          Theme
        </button>

        <!-- Dropdown Selector List (Populates floating container above layout coordinates) -->
        <div 
          v-if="isDropdownOpen" 
          class="absolute right-0 mt-2 w-48 bg-header-bg border border-border-line/40 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 font-sans"
        >
          <button
            v-for="theme in THEMES"
            :key="theme.id"
            @click="handleThemeSelection(theme.id)"
            :class="[
              'w-full text-left px-4 py-2.5 hover:bg-header-button/60 font-semibold flex items-center justify-between transition cursor-pointer',
              activeTheme === theme.id ? 'text-brand-accent font-extrabold' : 'text-header-ink/80'
            ]"
          >
            {{ theme.name }}
            <span v-if="activeTheme === theme.id" class="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
          </button>
        </div>
      </div>

      <!-- Prompt Orchard Button (bg-header-button) -->
      <button 
        @click="handlePromptsClick"
        class="flex items-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-3.5 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer"
      >
        <Terminal class="w-3.5 h-3.5" />
        Prompt Orchard
      </button>

      <!-- Settings Profile Modal Button (bg-header-button) -->
      <button 
        @click="handleProfileClick"
        class="flex items-center gap-1.5 bg-header-button hover:opacity-90 border border-border-line/20 text-header-ink px-3.5 py-2 rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-sm cursor-pointer"
      >
        <User class="w-3.5 h-3.5" />
        Profile Config
      </button>

    </div>
  </header>
</template>
