// const Joi = require("joi");

// // Example: Validation for creating a doctor
// const validateDoctor = (data) => {
//   const schema = Joi.object({
//     doctorName: Joi.string().required(),
//     career: Joi.string().required(),
//     exp: Joi.string().required(),
//     speciality: Joi.string().required(),
//     rating: Joi.number().min(0).max(5).required(),
//     hourRate: Joi.number().required(),
//     isFavourite: Joi.boolean(),
//     details: Joi.object({
//       running: Joi.number(),
//       ongoing: Joi.number(),
//       patient: Joi.number(),
//       services: Joi.array().items(Joi.string()),
//       location: Joi.string(),
//     }),
//     timeSlots: Joi.array().items(
//       Joi.object({
//         day: Joi.string(),
//         afternoon: Joi.array().items(Joi.string()),
//         evening: Joi.array().items(Joi.string()),
//       })
//     ),
//   });

//   return schema.validate(data);
// };

// module.exports = { validateDoctor };
