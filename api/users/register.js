const User = require("../../modules/UserSchema");
const { UserUtils } = require("../../utils/ApiUtils")

const RouteError = require("../../utils/RouteError");

module.exports = async ({ googleId, username, image, description }) => {
    try {
        var user = await User.findOne({ googleId });

        if (!user)
            throw new RouteError("Please sign in to your google account once before registering", 403);

        //if (user.hasCompletedSignUp)
          //  throw new RouteError("This user has already been registered", 403);

        if (!username) throw new RouteError("Please specify a username", 400);

        user.username = username;
        user.image = image;
        user.description = description;

        user.hasCompletedSignUp = true;

        user = await user.save();
        
        return UserUtils.removeSensitiveData(user);
    } catch (error) {
        // Duplicate key error
        if (error.keyValue && error.keyValue.username && error.code === 11000)
            throw new RouteError("Another user with this username already exists. Please choose another username", 400);

        // Throw the error 'upwards' so that where this was called from can handle it
        throw error;
    }
}