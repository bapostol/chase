import { ref } from 'vue';
import axios from 'axios';

const profile = ref(null);
const isLoading = ref(false);
const error = ref(null);

export function useProfile() {
  // Fetch current user details from profile.json
  const fetchProfile = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Connects seamlessly via our local developer proxy mapping
      const response = await axios.get('/api/v1/profile');
      profile.value = response.data;
    } catch (err) {
      console.error('Failed to load profile context:', err);
      error.value = err.response?.data?.error || 'Failed to read profile data store.';
    } finally {
      isLoading.value = false;
    }
  };

  // Synchronize wizard updates to backend disk files
  const saveProfile = async (profileData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.put('/api/v1/profile', profileData);
      profile.value = response.data.profile;
      return true;
    } catch (err) {
      console.error('Failed to update profile context:', err);
      error.value = err.response?.data?.error || 'Failed to save profile registry updates.';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    saveProfile
  };
}
