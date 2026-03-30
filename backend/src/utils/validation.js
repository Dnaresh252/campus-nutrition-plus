const Joi = require("joi");

/**
 * Student registration validation
 */
const validateStudentRegistration = (data) => {
  const schema = Joi.object({
    rollNumber: Joi.string()
      .pattern(/^[A-Z0-9]{5,15}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid roll number (use uppercase letters and digits, 5-15 characters)",
        "any.required": "Roll number is required",
      }),
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
    }),
    hostel: Joi.string().required().messages({
      "any.required": "Hostel is required",
    }),
    room: Joi.string().optional().allow("", null),
  });

  return schema.validate(data);
};

/**
 * Feedback submission validation
 */
const validateFeedback = (data) => {
  const schema = Joi.object({
    mealType: Joi.string()
      .valid("BREAKFAST", "LUNCH", "SNACKS", "DINNER")
      .required(),
    ratings: Joi.object()
      .pattern(
        Joi.string(), // dish_id
        Joi.number().integer().min(1).max(5), // rating 1-5
      )
      .min(1)
      .required()
      .messages({
        "object.min": "Please rate at least one dish",
      }),
    wastage: Joi.number().integer().min(0).max(100).required(),
    comments: Joi.string().max(500).optional().allow("", null),
  });

  return schema.validate(data);
};

/**
 * Menu creation validation
 */
const validateMenu = (data) => {
  const dishSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    category: Joi.string().required(),
  });

  const schema = Joi.object({
    dayOfWeek: Joi.number().integer().min(1).max(7).required(),
    mealType: Joi.string()
      .valid("BREAKFAST", "LUNCH", "SNACKS", "DINNER")
      .required(),
    dishes: Joi.array().items(dishSchema).min(1).required().messages({
      "array.min": "Menu must have at least one dish",
    }),
  });

  return schema.validate(data);
};

/**
 * Middleware wrapper for validation
 */
const validate = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validateStudentRegistration,
  validateFeedback,
  validateMenu,
  validate,
};
