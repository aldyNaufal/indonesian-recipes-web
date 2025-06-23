// utils/preferencesMapper.js

// Mapper untuk mengkonversi preferences dari frontend ke format yang dibutuhkan ML model
export const mapPreferencesToMLFormat = (preferences) => {
  if (!preferences) return getDefaultMLPreferences();

  return {
    preferred_categories: preferences.preferred_categories || preferences.preferredCategories || [],
    skill_level: preferences.skill_level || preferences.skillLevel || 'beginner',
    cooking_methods: preferences.cooking_methods || preferences.cookingMethods || [],
    avoid_ingredients: preferences.avoid_ingrdients || preferences.avoidIngredients || [], // Note: keeping backend typo for compatibility
    preferred_taste: preferences.preferred_test || preferences.preferredTaste || [], // Note: keeping backend typo for compatibility
    preferred_time: preferences.preferred_time || preferences.preferredTime || 'medium'
  };
};

// Mapper untuk mengkonversi dari ML format ke frontend format
export const mapMLFormatToPreferences = (mlPreferences) => {
  if (!mlPreferences) return getDefaultPreferences();

  return {
    preferredCategories: mlPreferences.preferred_categories || [],
    skillLevel: mlPreferences.skill_level || 'beginner',
    cookingMethods: mlPreferences.cooking_methods || [],
    avoidIngredients: mlPreferences.avoid_ingredients || [],
    preferredTaste: mlPreferences.preferred_taste || [],
    preferredTime: mlPreferences.preferred_time || 'medium'
  };
};

// Default preferences structure for frontend
export const getDefaultPreferences = () => {
  return {
    preferredCategories: [],
    skillLevel: 'beginner',
    cookingMethods: [],
    avoidIngredients: [],
    preferredTaste: [],
    preferredTime: 'medium'
  };
};

// Default preferences structure for ML API
export const getDefaultMLPreferences = () => {
  return {
    preferred_categories: [],
    skill_level: 'beginner',
    cooking_methods: [],
    avoid_ingredients: [], // Note: keeping typo for backend compatibility
    preferred_taste: [], // Note: keeping typo for backend compatibility
    preferred_time: 'medium'
  };
};

// Validation functions
export const validatePreferences = (preferences) => {
  const errors = [];

  if (!preferences) {
    errors.push('Preferences object is required');
    return errors;
  }

  // Validate skill level
  const validSkillLevels = ['beginner', 'intermediate', 'advanced'];
  if (preferences.skillLevel && !validSkillLevels.includes(preferences.skillLevel)) {
    errors.push('Invalid skill level');
  }

  // Validate preferred time
  const validTimes = ['quick', 'medium', 'long'];
  if (preferences.preferredTime && !validTimes.includes(preferences.preferredTime)) {
    errors.push('Invalid preferred time');
  }

  // Validate arrays
  if (preferences.preferredCategories && !Array.isArray(preferences.preferredCategories)) {
    errors.push('Preferred categories must be an array');
  }

  if (preferences.cookingMethods && !Array.isArray(preferences.cookingMethods)) {
    errors.push('Cooking methods must be an array');
  }

  if (preferences.avoidIngredients && !Array.isArray(preferences.avoidIngredients)) {
    errors.push('Avoid ingredients must be an array');
  }

  if (preferences.preferredTaste && !Array.isArray(preferences.preferredTaste)) {
    errors.push('Preferred taste must be an array');
  }

  return errors;
};

// Helper function to check if preferences are complete
export const isPreferencesComplete = (preferences) => {
  if (!preferences) return false;

  const requiredFields = ['skillLevel', 'preferredTime'];
  const arrayFields = ['preferredCategories', 'cookingMethods'];

  // Check required fields
  for (const field of requiredFields) {
    if (!preferences[field]) return false;
  }

  // Check that at least one array field has values
  const hasArrayValues = arrayFields.some(field => 
    preferences[field] && Array.isArray(preferences[field]) && preferences[field].length > 0
  );

  return hasArrayValues;
};

// Helper function to get preferences summary
export const getPreferencesSummary = (preferences) => {
  if (!preferences) return 'No preferences set';

  const summary = [];

  if (preferences.skillLevel) {
    summary.push(`Skill: ${preferences.skillLevel}`);
  }

  if (preferences.preferredTime) {
    summary.push(`Time: ${preferences.preferredTime}`);
  }

  if (preferences.preferredCategories && preferences.preferredCategories.length > 0) {
    summary.push(`Categories: ${preferences.preferredCategories.length}`);
  }

  if (preferences.cookingMethods && preferences.cookingMethods.length > 0) {
    summary.push(`Methods: ${preferences.cookingMethods.length}`);
  }

  if (preferences.avoidIngredients && preferences.avoidIngredients.length > 0) {
    summary.push(`Avoid: ${preferences.avoidIngredients.length} ingredients`);
  }

  return summary.join(', ') || 'Basic preferences set';
};