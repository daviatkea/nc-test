function sendError(res, status, code, message, details = []) {
  const normalizedDetails = Array.isArray(details) ? details : [];

  return res.status(status).json({
    error: {
      code,
      message,
      details: normalizedDetails,
    },
  });
}

module.exports = sendError;
