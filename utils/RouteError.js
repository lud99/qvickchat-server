class RouteError extends Error {
    constructor(message, status, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where the error was thrown (only available on V8)
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, RouteError)

        this.name = 'RouteError';

        this.message = message;
        this.status = status;
    }
}

module.exports = RouteError;