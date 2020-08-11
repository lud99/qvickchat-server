const { SessionUtils } = require("./ApiUtils");

/**
 * Finds the proper session for the request by either the sessionid cookie or authorization header
 */
module.exports.session = async (req, res, next) => {
    const session = await SessionUtils.getSession(req.cookies.sessionid || req.header("Authorization"));

    req.session = session;
    req.isAuthorized = !!session;

    next();
};

module.exports.getSession = async (sessionId) => await SessionUtils.getSession(sessionId);

module.exports.isAuthorized = async (sessionId) => {
    const session = await SessionUtils.getSession(sessionId);

    return !!session;
}

module.exports.protected = (req, res, next) => {
    if (req.isAuthorized) {
        return next();
    } else {
        res.status(401).json({
            success: false,
            message: "Invalid authorization provided"
        })
    }
}