export function sendSuccess(res, message, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    status:  "Success",
    message,
    data,
  });
}

export function sendError(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    status: "Error",
    error:  message,
  });
}