const errorMessage = (message) => ({ success: false, error: message });

const sendError = (res, error, statusCode = error.status || 500) => (
    res.status(statusCode).json(errorMessage(error.message || error))
);

const sendErrorMessage = (res, message, statusCode = 500) => (
    res.status(statusCode).json(errorMessage(message))
);

module.exports.errorMessage = errorMessage;
module.exports.sendError = sendError;
module.exports.sendErrorMessage = sendErrorMessage;