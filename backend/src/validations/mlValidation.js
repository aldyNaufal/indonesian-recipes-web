const Joi = require('joi');

const recommendSchema = Joi.object({
  ingredients: Joi.alternatives()
    .try(Joi.array().items(Joi.string().min(1)).min(1), Joi.string().min(1))
    .required()
    .messages({
      'any.required': 'Ingredients wajib diisi',
      'string.empty': 'Ingredients tidak boleh kosong',
      'array.min': 'Minimal satu ingredient',
    }),

  complexity_filter: Joi.string()
    .valid('Cepat & Mudah', 'Sedang', 'Sulit')
    .optional(),

  min_rating: Joi.number().min(1).max(5).optional(),

  top_n: Joi.number().integer().min(1).optional(),
});

const similarSchema = Joi.object({
  recipe_title: Joi.string().min(1).required().messages({
    'any.required': 'Recipe title wajib diisi',
    'string.empty': 'Recipe title tidak boleh kosong',
    'string.min': 'Recipe title minimal 1 karakter',
  }),
  top_n: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Top_n harus berupa angka',
      'number.min': 'Top_n harus lebih besar atau sama dengan 1',
      'number.max': 'Top_n tidak boleh lebih dari 100',
    }),
});

module.exports = {
  recommendSchema,
  similarSchema,
};
