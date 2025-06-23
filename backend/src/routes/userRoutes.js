const userHandler = require('../handlers/userHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');
const Joi = require('joi');

const userRoutes = [
  {
    method: 'GET',
    path: '/api/profile',
    handler: userHandler.getProfile,
    options: {
      auth: false, // Tambahkan ini
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'PUT',
    path: '/api/profile',
    handler: userHandler.updateProfile,
    options: { 
      auth: false, // Tambahkan ini
      pre: [{ method: authMiddleware }],
      // Tambahkan validasi payload
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).optional(),
          email: Joi.string().email().optional().allow(''),
          phone: Joi.string().optional().allow(''),
          gender: Joi.string().valid('male', 'female', 'other').optional().allow(''),
          birthDate: Joi.string().isoDate().optional().allow(''),
          location: Joi.string().optional().allow(''),
          photo: Joi.string().optional().allow('')
        }).min(1) // Minimal 1 field harus ada
      },
      payload: {
        maxBytes: 10485760 // 10MB untuk handle base64 images
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/profile/password',
    options: { pre: [authMiddleware] },
    handler: userHandler.updatePassword,
  },


  {
    method: 'POST',
    path: '/api/forgot-password',
    handler: userHandler.forgotPassword,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          newPassword: Joi.string().min(8).required()
        })
      }
    }
  },
  
  // Route untuk change password (dengan autentikasi)
  {
    method: 'POST',
    path: '/api/change-password',
    handler: userHandler.changePassword,
    options: {
      auth: false, // ← Ubah ke false
      pre: [
        { method: authMiddleware } // ← Tambahkan pre-handler
      ],
      validate: {
        payload: Joi.object({
          newPassword: Joi.string().min(8).required()
        })
      }
    }
  }
];

module.exports = userRoutes;