import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin extends Document {
    username: string;
    passwordHash: string;
    role: "super_admin" | "editor";
    createdAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, "Password hash is required"],
        },
        role: {
            type: String,
            enum: ["super_admin", "editor"],
            default: "super_admin",
        },
    },
    { timestamps: true }
);

// Prevent model recompilation error in development
const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
