const Joi = require('joi');

const preferenceSchema = Joi.object({
  preferred_categories: Joi.array().items(Joi.string()).min(1).required(),
  difficulty_preference: Joi.string()
    .valid('Cepat & Mudah', 'Mudah', 'Sedang', 'Sulit', 'Sangat Sulit')
    .required(),
  max_ingredients: Joi.number().integer().min(1).required(),
  max_steps: Joi.number().integer().min(1).required(),
  cooking_methods: Joi.array().items(Joi.string()).min(1).required(),
});

module.exports = {
  preferenceSchema,
};
