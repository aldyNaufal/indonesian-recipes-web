import { apiGet, apiPost } from '../utils/httpClient';

class PreferencesService {
  async savePreferences(preferences, token) {
    try {
      return await apiPost('/api/preferences', preferences, token);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  async getPreferences(token) {
    try {
      return await apiGet('/api/preferences', token);
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  async checkPreferencesExists(token) {
    try {
      const preferences = await this.getPreferences(token);
      return !preferences.error;
    } catch (error) {
      return false;
    }
  }
}

export default new PreferencesService();