import mongoose, {
    Schema,
    HydratedDocument,
    Model,
} from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
    name: string;
    email: string;
    password: string;
}

interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (
    this: HydratedDocument<IUser>
) {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string
) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser, UserModel>(
    "User",
    userSchema
);

export default User;