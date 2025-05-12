const responseHandler = (
  res,
  {
    success = true,
    message = "",
    data = {},
    statusCode = 200,
    meta = {},
    error = null,
    customFields = {},
    headers = {},
    cookies = {},
  } = {}
) => {
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  Object.entries(cookies).forEach(([key, value]) => {
    res.cookie(key, value);
  });

  const response = {
    status: success ? "success" : "error",
    message,
    ...(!success && error ? { error } : {}),
    ...(!success && !error ? { error: message } : {}),
    ...(success ? { data } : {}),
    ...(Object.keys(meta).length ? { meta } : {}),
    ...customFields,
  };

  return res.status(statusCode).json(response);
};



const successResponse = (res, message, data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  responseHandler,
};
