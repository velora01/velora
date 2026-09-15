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
  
  // If stored password is plain text (not a bcrypt hash)
  if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$") && !this.password.startsWith("$2y$")) {
    if (this.password === candidatePassword) {
      // Re-hash to bcrypt and persist
      this.password = candidatePassword;
      await this.save();
      return true;
    }
    return false;
  }
  
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);