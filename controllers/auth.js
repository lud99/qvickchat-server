const { OAuth2Client } = require('google-auth-library');

const User = require("../modules/UserSchema");

const { SessionUtils } = require("../utils/ApiUtils");

const clientOrigin = process.env.NODE_ENV === "development" ? process.env.DEV_URL : process.env.PROD_URL;

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    process.env.NODE_ENV === "development" ? process.env.GOOGLE_DEV_REDIRECT_URL : process.env.GOOGLE_PROD_REDIRECT_URL
);

const getProfile = (idToken) => {
    const profileBase64 = idToken.split(".")[1];

    const profile = Buffer.from(profileBase64, "base64").toString("ascii"); // Base64 decode the profile

    return JSON.parse(profile);
}

const verify = async (token) => {
    const ticket = await oAuth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_OAUTH_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return userid;
}

/** 
 * Handles both redirecting to the google sign-in page, but also the callbacks for when the google sign-in is completed
 * 
 * @route GET /auth/google
 * @access Public 
*/

exports.google = async (req, res) => {
    try {
        const code = req.query.code;
        const redirectUrl = req.query.redirectUrl || req.query.state;

        // Not coming from the sign-in page, redirect to there instead 
        if (!code) {
            var authorizeUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            });

            authorizeUrl += `&state=${redirectUrl}`; // Add the url to redirect back to after the sign in

            return res.redirect(authorizeUrl);
        }

        /// Google sign-in completed

        // Now that we have the code, use that to acquire tokens.
        const { tokens } = await oAuth2Client.getToken(code);

        const profile = getProfile(tokens.id_token);

        const userId = await verify(tokens.id_token);

        // Create the session
        const { sessionId } = await SessionUtils.createSession(userId);

        const cookie = process.env.NODE_ENV === "development" ? 
            ({ maxAge: parseInt(process.env.SESSION_AGE_MS) }) :
            ({ maxAge: parseInt(process.env.SESSION_AGE_MS), sameSite: "none", secure: true });

        // Send the session id to the client
        res.cookie("sessionid", sessionId, cookie);
        res.set("Authorization", sessionId);

        /// Sign up

        var user = await User.findOne({ googleId: userId });

        // Create a user if the google account hasn't been registered before
        if (!user) {
            user = await User.create({
                firstName: profile.given_name,
                surname: profile.family_name,
                fullName: profile.name,
                image: profile.picture,
                email: profile.email,
                googleId: userId
            })
        }

        res.redirect(redirectUrl);
    } catch (error) {
        console.error(error);

        res.status(403).redirect(clientOrigin);
    }
};