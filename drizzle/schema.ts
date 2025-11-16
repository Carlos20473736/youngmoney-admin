import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, tinyint, datetime } from "drizzle-orm/mysql-core";

/**
 * Schema mapeando as tabelas REAIS do banco YoungMoney no Aiven
 * IMPORTANTE: Banco usa snake_case, então especificamos explicitamente os nomes das colunas
 */

// Tabela de usuários do sistema admin (Manus OAuth)
export const adminAuthUsers = mysqlTable("admin_auth_users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Tabela REAL de usuários do app YoungMoney (snake_case no banco)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }),
  password: varchar("password", { length: 255 }),
  email: varchar("email", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }),
  deviceId: varchar("device_id", { length: 255 }),
  token: varchar("token", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }),
  profilePicture: varchar("profile_picture", { length: 255 }),
  points: int("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  inviteCode: varchar("invite_code", { length: 20 }),
  masterSeed: text("master_seed"),
  sessionSalt: varchar("session_salt", { length: 255 }),
  saltUpdatedAt: datetime("salt_updated_at"),
});

// Tabela REAL de transações de pontos (snake_case no banco)
export const pointTransactions = mysqlTable("point_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  points: int("points").notNull(),
  type: mysqlEnum("type", ["credit", "debit"]).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela REAL de notificações (snake_case no banco)
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull().default("YoungMoney"),
  message: text("message").notNull(),
  isRead: tinyint("is_read").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela REAL de saques (snake_case no banco)
export const withdrawals = mysqlTable("withdrawals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  pixType: varchar("pix_type", { length: 20 }).notNull(),
  pixKey: varchar("pix_key", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Tabela REAL de ranking (snake_case no banco)
export const ranking = mysqlTable("ranking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  dailyRank: int("daily_rank"),
  totalRank: int("total_rank"),
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow(),
});

// Tabela REAL de convites (snake_case no banco)
export const invites = mysqlTable("invites", {
  id: int("id").autoincrement().primaryKey(),
  inviterId: int("inviter_id").notNull(),
  invitedId: int("invited_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela REAL de check-in diário (snake_case no banco)
export const dailyCheckin = mysqlTable("daily_checkin", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  checkinDate: timestamp("checkin_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminAuthUser = typeof adminAuthUsers.$inferSelect;
export type InsertAdminAuthUser = typeof adminAuthUsers.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type Ranking = typeof ranking.$inferSelect;
