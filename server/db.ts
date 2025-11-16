import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminAuthUsers,
  InsertAdminAuthUser,
  users,
  pointTransactions,
  notifications,
  withdrawals,
  ranking,
  invites,
  dailyCheckin,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Funções para admin auth (Manus OAuth)
export async function upsertAdminUser(user: InsertAdminAuthUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertAdminAuthUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(adminAuthUsers).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert admin user:", error);
    throw error;
  }
}

export async function getAdminUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(adminAuthUsers).where(eq(adminAuthUsers.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== FUNÇÕES PARA DADOS REAIS DO APP =====

// Usuários
export async function getAllAppUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAppUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchAppUsers(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).where(
    sql`${users.name} LIKE ${`%${query}%`} OR ${users.email} LIKE ${`%${query}%`}`
  );
}

// Transações
export async function getTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .orderBy(desc(pointTransactions.createdAt));
}

export async function getRecentTransactions(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pointTransactions)
    .orderBy(desc(pointTransactions.createdAt))
    .limit(limit);
}

export async function addPointsToUser(userId: number, points: number, description: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Adicionar transação
  await db.insert(pointTransactions).values({
    userId,
    points,
    type: "credit",
    description,
  });
  
  // Atualizar saldo do usuário
  await db.update(users)
    .set({ points: sql`${users.points} + ${points}` })
    .where(eq(users.id, userId));
  
  // Criar notificação automática
  await db.insert(notifications).values({
    userId,
    title: "Pontos Adicionados! 🎉",
    message: `Você recebeu ${points} pontos! ${description}`,
    isRead: 0,
  });
}

export async function removePointsFromUser(userId: number, points: number, description: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Adicionar transação
  await db.insert(pointTransactions).values({
    userId,
    points,
    type: "debit",
    description,
  });
  
  // Atualizar saldo do usuário
  await db.update(users)
    .set({ points: sql`${users.points} - ${points}` })
    .where(eq(users.id, userId));
  
  // Criar notificação automática
  await db.insert(notifications).values({
    userId,
    title: "Pontos Removidos",
    message: `${points} pontos foram removidos da sua conta. ${description}`,
    isRead: 0,
  });
}

// Notificações
export async function getAllNotifications() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notifications)
    .orderBy(desc(notifications.createdAt));
}

export async function createNotification(userId: number, title: string, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notifications).values({
    userId,
    title,
    message,
    isRead: 0,
  });
}

export async function createNotificationForAll(title: string, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Pegar todos os usuários
  const allUsers = await db.select({ id: users.id }).from(users);
  
  // Criar notificação para cada um
  const notificationPromises = allUsers.map(user => 
    db.insert(notifications).values({
      userId: user.id,
      title,
      message,
      isRead: 0,
    })
  );
  
  await Promise.all(notificationPromises);
}

// Saques
export async function getAllWithdrawals() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(withdrawals)
    .orderBy(desc(withdrawals.createdAt));
}

export async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(withdrawals)
    .where(eq(withdrawals.status, "pending"))
    .orderBy(desc(withdrawals.createdAt));
}

export async function approveWithdrawal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(withdrawals)
    .set({ 
      status: "approved",
      updatedAt: new Date(),
    })
    .where(eq(withdrawals.id, id));
}

export async function rejectWithdrawal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Pegar informações do saque
  const withdrawal = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
  if (withdrawal.length === 0) throw new Error("Withdrawal not found");
  
  const w = withdrawal[0];
  
  // Rejeitar saque
  await db.update(withdrawals)
    .set({ 
      status: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(withdrawals.id, id));
  
  // Devolver pontos ao usuário
  const pointsToReturn = Math.floor(parseFloat(w.amount.toString()));
  await addPointsToUser(w.userId, pointsToReturn, `Saque rejeitado - devolução de ${pointsToReturn} pontos`);
}

// Ranking
export async function getTopRanking(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: ranking.id,
    userId: ranking.userId,
    dailyRank: ranking.dailyRank,
    totalRank: ranking.totalRank,
    lastUpdated: ranking.lastUpdated,
    userName: users.name,
    userEmail: users.email,
    userPoints: users.points,
  })
  .from(ranking)
  .leftJoin(users, eq(ranking.userId, users.id))
  .orderBy(ranking.totalRank)
  .limit(limit);
}

// Estatísticas
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalUsers: 0,
    totalPoints: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0,
  };
  
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [pointsSum] = await db.select({ sum: sql<number>`COALESCE(sum(points), 0)` }).from(users);
  const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(withdrawals).where(eq(withdrawals.status, "pending"));
  const [withdrawnSum] = await db.select({ sum: sql<number>`COALESCE(sum(amount), 0)` }).from(withdrawals).where(eq(withdrawals.status, "completed"));
  
  return {
    totalUsers: usersCount.count,
    totalPoints: pointsSum.sum,
    pendingWithdrawals: pendingCount.count,
    totalWithdrawn: Math.floor(withdrawnSum.sum),
  };
}

// Notificações
export async function getNotifications(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(notifications);
  
  if (userId) {
    query = query.where(eq(notifications.userId, userId)) as any;
  }
  
  return await query.orderBy(desc(notifications.createdAt)).limit(50);
}
