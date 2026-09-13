<script setup>
import { onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  isClosable: {
    type: Boolean,
    default: true
  },
  maxWidth: {
    type: String,
    default: 'max-w-2xl'
  }
});

const emit = defineEmits(['close']);

const handleClose = () => {
  if (props.isClosable) emit('close');
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen && props.isClosable) {
    handleClose();
  }
};

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    
    <!-- Darkened Modal Backdrop Overlay Barrier -->
    <div 
      class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      @click="handleClose"
    ></div>

    <!-- Centered Modal Panel Body Box Layout -->
    <div :class="['bg-canvas-bg border border-border-line/40 w-full rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 text-ink-primary', maxWidth, title.includes('Prompt') ? 'h-[85vh]' : 'max-h-[90vh]']">
      
      <!-- Panel Header Bar Layout: bg-header-bg with light text-header-ink -->
      <div class="px-6 py-4 bg-header-bg border-b border-border-line/20 flex items-center justify-between shrink-0 select-none text-header-ink">
        <div class="flex flex-col">
          <h2 class="text-base font-bold tracking-tight flex items-center gap-2">
            <slot name="icon" />
            {{ title }}
          </h2>
          <p v-if="subtitle" class="text-xs opacity-70 mt-0.5 font-sans">
            {{ subtitle }}
          </p>
        </div>
        
        <button 
          v-if="isClosable"
          @click="handleClose"
          class="opacity-70 hover:opacity-100 p-1.5 rounded-lg hover:bg-header-toggle/50 transition cursor-pointer text-header-ink"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Main Slot Contents Body -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <slot name="content" />
      </div>

      <!-- Action Panel Footer Control Bar Layout: bg-header-toggle -->
      <div v-if="$slots.footer" class="px-6 py-4 bg-header-toggle border-t border-border-line/20 flex items-center justify-end gap-3 shrink-0">
        <slot name="footer" />
      </div>

    </div>
  </div>
</template>
