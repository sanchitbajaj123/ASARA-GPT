const { model, Schema } = require("mongoose");
const { isEmail } = require("validator");
const { checkPassword, encryptPassword } = require("../bcrypt");

const userSchema = new Schema({
    username: { type: String, trim: true},
    email: {
        type: String, lowercase: true, trim: true, unique: true,
        validate: {
            validator(email) {
                return isEmail(email);
            }
        }
    },
    password: {
        type: String, trim: true,
        validate: {
            validator(password) {
                if (password.includes(" ") || password.includes("\n") || password.includes("\t")) {
                    throw new Error(`Password includes space/tab/newLine char`);
                }
                if (password.toLowerCase().includes("password")) {
                    throw new Error(`Password must not contain password`);
                }
                return true;
            }
        }
    },
    confirmpassword: {
        type: String, trim: true, 
        validate: {
            validator(password) {
                if (password.includes(" ") || password.includes("\n") || password.includes("\t")) {
                    throw new Error(`Password includes space/tab/newLine char`);
                }
                if (password.toLowerCase().includes("password")) {
                    throw new Error(`Password must not contain password`);
                }
                return true;
            }
        }
    },
    mentalHealthInfo: {
        anxietyPast: { 
            binary: { type: Number, min: 0, max: 1 },
            score: { type: Number, min: 0, max: 10 }
        },
        stressPast: { 
            binary: { type: Number, min: 0, max: 1 },
            score: { type: Number, min: 0, max: 10 }
        },
        isHappy: { type: Number, min: 0, max: 1 },
        depressionExperience: { type: Number, min: 0, max: 1 },
        lonelinessFrequency: { type: Number, min: 0, max: 10 },
        energyLevel: { type: Number, min: 0, max: 10 },
        physicalHealthImpact: { type: Number, min: 0, max: 1 },
        soughtProfessionalHelp: { type: Number, min: 0, max: 1 },
        concentrationDifficulty: { type: Number, min: 0, max: 1 }
    }
},
{ timestamps: true }
);

userSchema.pre("save", async function (next) {
    const user = this;
    if (user.modifiedPaths().includes("password")) {
        user.password = await encryptPassword(user.password);
        user.confirmpassword = await encryptPassword(user.confirmpassword);
    }
    next();
});

userSchema.statics.findByEmailAndPasswordForAuth = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error(`Invalid credentials`);
        }
        const encryptedPassword = user.password;
        const isMatch = await checkPassword(password, encryptedPassword);
        if (!isMatch) {
            throw new Error(`Invalid credentials`);
        }
        console.log("Login Successful");
        return user;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

userSchema.methods.toJSON = function () {
    let user = this.toObject();
    delete user.password;
    delete user.confirmpassword;
    return user;
};

const User = model("User", userSchema);

module.exports = User;