import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name for the school/institution"],
        maxlength: [100, "Name cannot be more than 100 characters"],
    },
    address: {
        type: String,
        required: [true, "Please provide an address"],
        maxlength: [200, "Address cannot be more than 200 characters"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email",
        ],
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
        maxlength: [20, "Phone number cannot be more than 20 characters"],
    },
    principalName: {
        type: String,
        required: [true, "Please provide the principal/head name"],
        maxlength: [100, "Name cannot be more than 100 characters"],
    },
    category: {
        type: String,
        required: [true, "Please specify a category"],
        index: true,
    },
    description: {
        type: String,
        required: false,
        maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    website: {
        type: String,
        required: false,
    },
    images: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.School || mongoose.model("School", SchoolSchema);
