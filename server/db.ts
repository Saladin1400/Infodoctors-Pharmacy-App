import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Connection with fallback setting
const MONGODB_URI = process.env.MONGODB_URI;

let isDbConnected = false;

export async function connectDB() {
  if (!MONGODB_URI) {
    console.log("ℹ️ In-memory high performance database initialized (MONGODB_URI not provided).");
    isDbConnected = false;
    return;
  }
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    console.log("🟢 Successfully connected to MongoDB via Mongoose.");
    isDbConnected = true;
  } catch (err: any) {
    console.log("ℹ️ MongoDB connection not available; using in-memory simulated database.");
    isDbConnected = false;
  }
}

// ==========================================
// 1. User Mongoose Schema
// ==========================================
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["patient", "pharmacist", "admin"],
  },
  fullName: {
    type: String,
    required: true,
  },
  nationalId: {
    type: String,
    sparse: true,
  },
  licenseNumber: {
    type: String,
    sparse: true,
  },
  securityQuestion: {
    type: String,
    required: true,
  },
  securityAnswerHash: {
    type: String,
    required: true,
  },
  isFrozen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook for password hashing (Promise-based async/await, no next-parameter collision)
UserSchema.pre("save", async function () {
  const user = this as any;
  if (user.isModified("passwordHash")) {
    if (!user.passwordHash.startsWith("$2a$") && !user.passwordHash.startsWith("$2b$")) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
    }
  }
  if (user.isModified("securityAnswerHash")) {
    if (!user.securityAnswerHash.startsWith("$2a$") && !user.securityAnswerHash.startsWith("$2b$")) {
      user.securityAnswerHash = await bcrypt.hash(user.securityAnswerHash.trim(), 10);
    }
  }
});

// Method to verify password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Method to verify security answer
UserSchema.methods.compareSecurityAnswer = async function (answer: string): Promise<boolean> {
  return bcrypt.compare(answer.trim(), this.securityAnswerHash);
};

export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);


// ==========================================
// 2. Session Mongoose Schema (for session management)
// ==========================================
const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  ipAddress: String,
  userAgent: String,
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const SessionModel = mongoose.models.Session || mongoose.model("Session", SessionSchema);

// ==========================================
// Chat Message Mongoose Schema
// ==========================================
const ChatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
});

export const ChatMessageModel = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

// ==========================================
// In-Memory Simulated Database Fallback
// ==========================================
interface InMemUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "patient" | "pharmacist" | "admin";
  fullName: string;
  nationalId?: string;
  licenseNumber?: string;
  securityQuestion: string;
  securityAnswerHash: string;
  createdAt: string;
  isFrozen?: boolean;
}

interface InMemSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

interface InMemChatMessage {
  roomId: string;
  sender: "patient" | "pharmacist";
  senderName: string;
  text: string;
  timestamp: string;
}

// Bootstrap initial standard accounts
const INITIAL_IN_MEM_USERS: InMemUser[] = [
  {
    id: "6657c9ef9f3a6a1234567891",
    email: "ahmed.aly@mail.eg",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "patient",
    fullName: "أحمد محمد علي",
    nationalId: "29010151234567",
    securityQuestion: "ما هو اسم مدينتك المفضلة؟",
    securityAnswerHash: bcrypt.hashSync("القاهرة", 10),
    createdAt: new Date().toISOString()
  },
  {
    id: "6657c9ef9f3a6a1234567892",
    email: "sarah.m@mail.eg",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "patient",
    fullName: "سارة ممدوح إسماعيل",
    nationalId: "29505202712345",
    securityQuestion: "ما اسم مدرستك الأولى؟",
    securityAnswerHash: bcrypt.hashSync("الزهراء", 10),
    createdAt: new Date().toISOString()
  },
  {
    id: "6657c9ef9f3a6a1234567893",
    email: "pharmacist@clinical.eg",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "pharmacist",
    fullName: "د. أميرة أحمد",
    licenseNumber: "LIC-12345",
    securityQuestion: "ما هو اسم حيوانك الأليف الأول؟",
    securityAnswerHash: bcrypt.hashSync("فلافي", 10),
    createdAt: new Date().toISOString()
  },
  {
    id: "6657c9ef9f3a6a1234567894",
    email: "admin@hospital.eg",
    passwordHash: bcrypt.hashSync("123456", 10),
    role: "admin",
    fullName: "أدمن النظام المركزي",
    securityQuestion: "ما لون سيارتك الأولى؟",
    securityAnswerHash: bcrypt.hashSync("أحمر", 10),
    createdAt: new Date().toISOString()
  }
];

let inMemUsers: InMemUser[] = [...INITIAL_IN_MEM_USERS];
let inMemSessions: InMemSession[] = [];
let inMemChatMessages: InMemChatMessage[] = [];

// Unified High-Level Auth Controller
export const DB = {
  isMongooseActive() {
    return isDbConnected && mongoose.connection.readyState === 1;
  },

  async findUserById(id: string) {
    if (this.isMongooseActive()) {
      try {
        const u = await (UserModel as any).findById(id);
        if (u) return u;
      } catch (e) {
        console.error("Mongoose findUserById error:", e);
      }
    }
    const found = inMemUsers.find(u => u.id === id);
    if (!found) return null;
    return {
      id: found.id,
      _id: found.id,
      email: found.email,
      passwordHash: found.passwordHash,
      role: found.role,
      fullName: found.fullName,
      nationalId: found.nationalId,
      licenseNumber: found.licenseNumber,
      securityQuestion: found.securityQuestion,
      securityAnswerHash: found.securityAnswerHash,
      createdAt: found.createdAt,
      isFrozen: !!found.isFrozen,
      async comparePassword(p: string) { return bcrypt.compareSync(p, found.passwordHash); },
      async compareSecurityAnswer(a: string) { return bcrypt.compareSync(a.trim(), found.securityAnswerHash); }
    };
  },

  async findUserByEmail(email: string) {
    if (this.isMongooseActive()) {
      try {
        const u = await (UserModel as any).findOne({ email: email.toLowerCase() });
        if (u) return u;
      } catch (e) {
        console.error("Mongoose findUserByEmail error:", e);
      }
    }
    const found = inMemUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    return {
      id: found.id,
      _id: found.id,
      email: found.email,
      passwordHash: found.passwordHash,
      role: found.role,
      fullName: found.fullName,
      nationalId: found.nationalId,
      licenseNumber: found.licenseNumber,
      securityQuestion: found.securityQuestion,
      securityAnswerHash: found.securityAnswerHash,
      createdAt: found.createdAt,
      isFrozen: !!found.isFrozen,
      async comparePassword(p: string) { return bcrypt.compareSync(p, found.passwordHash); },
      async compareSecurityAnswer(a: string) { return bcrypt.compareSync(a.trim(), found.securityAnswerHash); }
    };
  },

  async createUser(data: {
    email: string;
    password: string;
    role: "patient" | "pharmacist" | "admin";
    fullName: string;
    nationalId?: string;
    licenseNumber?: string;
    securityQuestion: string;
    securityAnswer: string;
  }) {
    const emailLower = data.email.toLowerCase();
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const securityAnswerHash = bcrypt.hashSync(data.securityAnswer.trim(), 10);

    if (this.isMongooseActive()) {
      try {
        const mongoUser = new (UserModel as any)({
          email: emailLower,
          passwordHash,
          role: data.role,
          fullName: data.fullName,
          nationalId: data.nationalId,
          licenseNumber: data.licenseNumber,
          securityQuestion: data.securityQuestion,
          securityAnswerHash
        });
        await mongoUser.save();
        return mongoUser;
      } catch (e) {
        console.error("Mongoose createUser error:", e);
      }
    }

    // In Memory Store Implementation
    const newId = new mongoose.Types.ObjectId().toString();
    const newUser: InMemUser = {
      id: newId,
      email: emailLower,
      passwordHash,
      role: data.role,
      fullName: data.fullName,
      nationalId: data.nationalId,
      licenseNumber: data.licenseNumber,
      securityQuestion: data.securityQuestion,
      securityAnswerHash,
      createdAt: new Date().toISOString()
    };
    inMemUsers.push(newUser);
    return {
      id: newUser.id,
      _id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      nationalId: newUser.nationalId,
      licenseNumber: newUser.licenseNumber,
      securityQuestion: newUser.securityQuestion,
      createdAt: newUser.createdAt,
      async comparePassword(p: string) { return bcrypt.compareSync(p, newUser.passwordHash); },
      async compareSecurityAnswer(a: string) { return bcrypt.compareSync(a.trim(), newUser.securityAnswerHash); }
    };
  },

  async updateUserPassword(email: string, newHash: string) {
    if (this.isMongooseActive()) {
      try {
        await (UserModel as any).updateOne({ email: email.toLowerCase() }, { passwordHash: newHash });
        return true;
      } catch (e) {
        console.error("Mongoose updateUserPassword error:", e);
      }
    }
    const idx = inMemUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      inMemUsers[idx].passwordHash = newHash;
      return true;
    }
    return false;
  },

  async createSession(userId: string, token: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (this.isMongooseActive()) {
      try {
        const mongoSession = new (SessionModel as any)({
          userId,
          token,
          ipAddress,
          userAgent,
          expiresAt
        });
        await mongoSession.save();
        return mongoSession;
      } catch (e) {
        console.error("Mongoose createSession error:", e);
      }
    }

    const newSession: InMemSession = {
      id: new mongoose.Types.ObjectId().toString(),
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
    inMemSessions.push(newSession);
    return newSession;
  },

  async findSession(token: string) {
    if (this.isMongooseActive()) {
      try {
        return await (SessionModel as any).findOne({ token });
      } catch (e) {
        console.error("Mongoose findSession error:", e);
      }
    }
    const found = inMemSessions.find(s => s.token === token);
    if (!found) return null;
    
    // Check expiration
    if (new Date(found.expiresAt) < new Date()) {
      inMemSessions = inMemSessions.filter(s => s.token !== token);
      return null;
    }
    return found;
  },

  async deleteSession(token: string) {
    if (this.isMongooseActive()) {
      try {
        await (SessionModel as any).deleteOne({ token });
        return true;
      } catch (e) {
        console.error("Mongoose deleteSession error:", e);
      }
    }
    const lenBefore = inMemSessions.length;
    inMemSessions = inMemSessions.filter(s => s.token !== token);
    return inMemSessions.length < lenBefore;
  },

  async getChatHistory(roomId: string) {
    if (this.isMongooseActive()) {
      try {
        return await (ChatMessageModel as any).find({ roomId }).sort({ timestamp: 1 }).lean();
      } catch (e) {
        console.error("Mongoose getChatHistory error:", e);
      }
    }
    return inMemChatMessages.filter(msg => msg.roomId === roomId);
  },

  async saveChatMessage(msg: {
    roomId: string;
    sender: "patient" | "pharmacist";
    senderName: string;
    text: string;
    timestamp: string;
  }) {
    if (this.isMongooseActive()) {
      try {
        const message = new ChatMessageModel(msg);
        await message.save();
        return message;
      } catch (e) {
        console.error("Mongoose saveChatMessage error:", e);
      }
    }
    inMemChatMessages.push(msg);
    return msg;
  },

  async getAllUsers() {
    if (this.isMongooseActive()) {
      try {
        const users = await (UserModel as any).find({}).lean();
        return users.map((u: any) => ({
          id: u._id.toString(),
          email: u.email,
          role: u.role,
          fullName: u.fullName,
          nationalId: u.nationalId,
          licenseNumber: u.licenseNumber,
          createdAt: u.createdAt,
          isFrozen: !!u.isFrozen
        }));
      } catch (e) {
        console.error("Mongoose getAllUsers error:", e);
      }
    }
    return inMemUsers.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      fullName: u.fullName,
      nationalId: u.nationalId,
      licenseNumber: u.licenseNumber,
      createdAt: u.createdAt,
      isFrozen: !!u.isFrozen
    }));
  },

  async updateUserStatus(id: string, isFrozen: boolean) {
    if (this.isMongooseActive()) {
      try {
        await (UserModel as any).updateOne({ _id: id }, { isFrozen });
        return true;
      } catch (e) {
        console.error("Mongoose updateUserStatus error:", e);
      }
    }
    const user = inMemUsers.find(u => u.id === id);
    if (user) {
      user.isFrozen = isFrozen;
      return true;
    }
    return false;
  },

  async deleteUser(id: string) {
    if (this.isMongooseActive()) {
      try {
        await (UserModel as any).deleteOne({ _id: id });
        await (SessionModel as any).deleteMany({ userId: id });
        return true;
      } catch (e) {
        console.error("Mongoose deleteUser error:", e);
      }
    }
    const lenBefore = inMemUsers.length;
    inMemUsers = inMemUsers.filter(u => u.id !== id);
    inMemSessions = inMemSessions.filter(s => s.userId !== id);
    return inMemUsers.length < lenBefore;
  },

  async resetUserAccount(id: string) {
    const defaultPasswordHash = bcrypt.hashSync("123456", 10);
    if (this.isMongooseActive()) {
      try {
        await (UserModel as any).updateOne({ _id: id }, { passwordHash: defaultPasswordHash, isFrozen: false });
        await (SessionModel as any).deleteMany({ userId: id });
        return true;
      } catch (e) {
        console.error("Mongoose resetUserAccount error:", e);
      }
    }
    const user = inMemUsers.find(u => u.id === id);
    if (user) {
      user.passwordHash = defaultPasswordHash;
      user.isFrozen = false;
      inMemSessions = inMemSessions.filter(s => s.userId !== id);
      return true;
    }
    return false;
  }
};
