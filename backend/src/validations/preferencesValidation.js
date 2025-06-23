const Joi = require('joi');

const preferenceSchema = Joi.object({
  preferred_categories: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'Kategori yang disukai harus memiliki minimal 1 item',
      'any.required': 'Kategori yang disukai wajib diisi'
    }),
    
  cooking_methods: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'Metode memasak harus memiliki minimal 1 item',
      'any.required': 'Metode memasak wajib diisi'
    }),
    
  avoid_ingredients: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .default([]),
    
  preferred_taste: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .default([]),
    
  preferred_time: Joi.string()
    .valid('Pagi', 'Siang', 'Sore', 'Malam')
    .optional()
    .default('Siang'),
    
  skill_level: Joi.string()
    .valid('Cepat & Mudah', 'Butuh Usaha', 'Level Dewa Masak')
    .optional()
    .default('Cepat & Mudah'),
});

// Schema untuk update (semua field optional)
const updatePreferenceSchema = Joi.object({
  preferred_categories: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .optional(),
    
  cooking_methods: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .optional(),
    
  avoid_ingredients: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional(),
    
  preferred_taste: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional(),
    
 preferred_time: Joi.string()
    .valid('Pagi', 'Siang', 'Sore', 'Malam')
    .optional()
    .default('Siang'),
    
  skill_level: Joi.string()
    .valid('Cepat & Mudah', 'Butuh Usaha', 'Level Dewa Masak')
    .optional()
    .default('Cepat & Mudah'),
}).min(1); // Minimal 1 field harus diisi untuk update

module.exports = {
  preferenceSchema,
  updatePreferenceSchema,
};