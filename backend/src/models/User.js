import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    },
    role: {
      type: String,
      enum: [
        "Admin",
        "Sales",
        "Designer",
        "Project Manager",
        "Factory Manager",
        "Installation Team",
        "Accountant",
        "Super Admin"
      ],
      default: "Admin",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if it has been modified (or is new)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Helper method to compare passwords (supports bcrypt hashes with plain text migration safeguard)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  
  const rawInput = String(candidatePassword);
  const trimmedInput = rawInput.trim();

  // If stored password is plain text (not a bcrypt hash)
  if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$") && !this.password.startsWith("$2y$")) {
    if (this.password === rawInput || this.password === trimmedInput) {
      // Re-hash to bcrypt and persist
      this.password = trimmedInput;
      await this.save();
      return true;
    }
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(rawInput, this.password);
    if (isMatch) return true;
    if (rawInput !== trimmedInput) {
      return await bcrypt.compare(trimmedInput, this.password);
    }
    return false;
  } catch (err) {
    console.error("User comparePassword error:", err);
    return false;
  }
};

export default mongoose.model("User", userSchema);