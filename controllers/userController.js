const bcrypt = require('bcryptjs');
const { User } = require('../models/user');

exports.registerUser = async (req, res) => {
    const { firstName, middleName, lastName, extensionName, username, password, email } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await User.create({
            firstName,
            middleName,
            lastName,
            extensionName,
            username,
            password: hashedPassword,
            email
        });

        res.status(201).send({ message: "User registered successfully", userId: newUser.id });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send({ message: "Error registering new user" });
    }
};
