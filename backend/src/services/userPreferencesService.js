const UserPreferences = require('../models/UserPreferences');

const saveUserPreferences = async (user_id, preferences) => {
  const {
    preferred_categories,
    difficulty_preference,
    max_ingredients,
    max_steps,
    cooking_methods,
  } = preferences;

  let userPreferences = await UserPreferences.findOne({ user_id });

  if (userPreferences) {
    userPreferences.preferred_categories = preferred_categories;
    userPreferences.difficulty_preference = difficulty_preference;
    userPreferences.max_ingredients = max_ingredients;
    userPreferences.max_steps = max_steps;
    userPreferences.cooking_methods = cooking_methods;
    await userPreferences.save();
  } else {
    userPreferences = new UserPreferences({
      user_id,
      preferred_categories,
      difficulty_preference,
      max_ingredients,
      max_steps,
      cooking_methods,
    });
    await userPreferences.save();
  }

  return userPreferences;
};

const getUserPreferences = async (user_id) => {
  return await UserPreferences.findOne({ user_id });
};

module.exports = {
  saveUserPreferences,
  getUserPreferences,
};
