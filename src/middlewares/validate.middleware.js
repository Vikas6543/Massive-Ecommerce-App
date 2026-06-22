import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false, // show all errors at once
    stripUnknown: true, // remove unknown fields
  });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw new ApiError(400, message);
  }

  next();
};

export default validate;
