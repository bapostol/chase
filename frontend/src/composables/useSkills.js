import { ref } from 'vue';
import axios from 'axios';

const activePromptContent = ref('');

const promptVariations = ref({
  system_recruiter: ['default'],
  cv_tailor: ['default'],
  gap_analyzer: ['default']
});
const isSkillsLoading = ref(false);
const skillsError = ref(null);

export function useSkills() {
  // Discover dynamic file variants from disk storage locations
  const fetchInventory = async () => {
    isSkillsLoading.value = true;
    skillsError.value = null;
    try {
      const response = await axios.get('/api/v1/skills/inventory');
      promptVariations.value = response.data;
    } catch (err) {
      console.error('Failed to load prompts index dictionary:', err);
      skillsError.value = err.response?.data?.error || 'Failed to sync prompts list.';
    } finally {
      isSkillsLoading.value = false;
    }
  };

  const fetchPrompt = async (category, slug) => {
    isSkillsLoading.value = true;
    skillsError.value = null;
    try {
      const response = await axios.get(`/api/v1/skill/${category}/${slug}`);
      activePromptContent.value = response.data.content;
      return response.data;
    } catch (err) {
      console.error('Failed to query prompt text asset:', err);
      skillsError.value = err.response?.data?.error || 'Failed to load markdown prompt file.';
      return null;
    } finally {
      isSkillsLoading.value = false;
    }
  };

  const savePrompt = async (category, slug, textContent) => {
    isSkillsLoading.value = true;
    skillsError.value = null;
    try {
      await axios.post(`/api/v1/skill/${category}/${slug}`, { content: textContent });
      await fetchInventory();
      return true;
    } catch (err) {
      console.error('Failed to save prompt configuration changes:', err);
      skillsError.value = err.response?.data?.error || 'Failed to write markdown asset changes.';
      return false;
    } finally {
      isSkillsLoading.value = false;
    }
  };

  return {
    activePromptContent,
    promptVariations, // Expose reactive dictionary array mapping
    isSkillsLoading,
    skillsError,
    fetchInventory, // Expose index loader trigger
    fetchPrompt,
    savePrompt
  };
}
