const User = require("../modules/UserSchema");

const UsersApi = require("../api/users");
const Response = require("../utils/Response");

module.exports.register = async (req, res) => {
    try {
        const googleId = req.session.googleId;

        const user = await UsersApi.register({ googleId, ...req.body });
        
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
}

module.exports.getUsers = async (req, res) => {
    try {
        const count = parseInt(req.query.count);
        const include = req.query.include || "threads,posts";

        const toPopulate = include.replace(/ /g, "").replace(/,/g, " ");

        const users = await User.find().populate(toPopulate).limit(count);

        res.json({ success: true, data: users });
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
};

/*
module.exports.addDummyUsers = async (req, res) => {
    const count = req.query.count || 1;

    const promises = [];

    for (let i = 0; i < count; i++) {
        promises.push(fetch("https://david.cloudno.de/fictional-person/api/person"));
    }

    const responses = await Promise.all(promises);

    const people = await Promise.all(responses.map(response => response.json()));

    people.forEach(async ({ name, image }) => {
        await User.create({
            firstName: name.firstName,
            surname: name.surName,
            fullName: `${name.firstName} ${name.surName}`,
            image: image.url,
        })
    });

    res.end();
}*/