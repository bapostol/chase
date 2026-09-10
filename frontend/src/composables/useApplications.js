import { ref } from 'vue';
import axios from 'axios';

const applications = ref([]);
const isLoading = ref(false);
const error = ref(null);

export function useApplications() {
  // Load either active workspace elements or archived pools dynamically
  const fetchApplications = async (showArchived = false) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`/api/v1/applications?archived=${showArchived}`);
      applications.value = response.data;
    } catch (err) {
      console.error('Failed to fetch applications array:', err);
      error.value = err.response?.data?.error || 'Failed to read application ledger.';
    } finally {
      isLoading.value = false;
    }
  };

  // Atomic creation of job tracking rows and filesystem folders
  const createApplication = async (applicationBundle) => {
    isLoading.value = true;
    error.value = null;
    try {
      await axios.post('/api/v1/applications', applicationBundle);
      await fetchApplications(false); // Re-hydrate local lists cleanly
      return true;
    } catch (err) {
      console.error('Failed to write new application lead:', err);
      error.value = err.response?.data?.error || 'Failed to build application workspace.';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Optimistic UI Patch modifier for Kanban drag-drops and archiving actions
  const patchApplication = async (id, partialFields) => {
    // 1. Optimistic Mutation: Find and apply changes locally for zero latency feedback
    const originalApps = [...applications.value];
    const targetIndex = applications.value.findIndex(app => app.id === id);
    
    if (targetIndex !== -1) {
      applications.value[targetIndex] = {
        ...applications.value[targetIndex],
        ...partialFields
      };
      
      // If we are soft-deleting/archiving, drop it from the current active listing view instantly
      if (partialFields.is_archived !== undefined) {
        applications.value = applications.value.filter(app => app.id !== id);
      }
    }

    // 2. Synchronize payload quietly with Knex/SQLite backends
    try {
      await axios.patch(`/api/v1/applications/${id}`, partialFields);
    } catch (err) {
      console.error('API synchronization failed, rolling back local state registry:', err);
      applications.value = originalApps; // Defensive Rollback on network collapse
      error.value = err.response?.data?.error || 'Failed to update application properties.';
    }
  };

  // Permanent data purge loop execution channel
  const purgeApplication = async (id) => {
    try {
      await axios.delete(`/api/v1/applications/${id}`);
      applications.value = applications.value.filter(app => app.id !== id);
    } catch (err) {
      console.error('Failed to execute hard permanent wipe pass:', err);
      error.value = err.response?.data?.error || 'Failed to complete data deletion sequence.';
    }
  };

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    createApplication,
    patchApplication,
    purgeApplication
  };
}
