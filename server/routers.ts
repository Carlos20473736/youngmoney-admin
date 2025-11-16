import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
    recentTransactions: protectedProcedure.query(async () => {
      const transactions = await db.getRecentTransactions(10);
      const users = await db.getAllAppUsers();
      
      return transactions.map(t => {
        const user = users.find(u => u.id === t.userId);
        return {
          ...t,
          userName: user?.name || `Usuário #${t.userId}`,
        };
      });
    }),
  }),

  // Usuários
  appUsers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAppUsers();
    }),
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchAppUsers(input.query);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getAppUserById(input.id);
        if (!user) throw new Error("User not found");
        return user;
      }),
    getTransactions: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTransactionsByUserId(input.userId);
      }),
    addPoints: protectedProcedure
      .input(z.object({
        userId: z.number(),
        points: z.number().positive(),
        description: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.addPointsToUser(input.userId, input.points, input.description);
        return { success: true };
      }),
    removePoints: protectedProcedure
      .input(z.object({
        userId: z.number(),
        points: z.number().positive(),
        description: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.removePointsFromUser(input.userId, input.points, input.description);
        return { success: true };
      }),
  }),

  // Notificações
  notifications: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllNotifications();
    }),
    create: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        title: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.userId) {
          await db.createNotification(input.userId, input.title, input.message);
        } else {
          await db.createNotificationForAll(input.title, input.message);
        }
        return { success: true };
      }),
  }),

  // Ranking
  ranking: router({
    list: protectedProcedure.query(async () => {
      return await db.getTopRanking(20);
    }),
    top: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getTopRanking(input.limit || 20);
      }),
    update: protectedProcedure.mutation(async () => {
      // TODO: Implementar atualização de rankings
      return { success: true };
    }),
  }),

  // Saques
  withdrawals: router({
    all: protectedProcedure.query(async () => {
      const withdrawals = await db.getAllWithdrawals();
      const users = await db.getAllAppUsers();
      
      return withdrawals.map(w => {
        const user = users.find(u => u.id === w.userId);
        return {
          ...w,
          userName: user?.name || `Usuário #${w.userId}`,
          userEmail: user?.email || "",
        };
      });
    }),
    list: protectedProcedure.query(async () => {
      const withdrawals = await db.getAllWithdrawals();
      const users = await db.getAllAppUsers();
      
      return withdrawals.map(w => {
        const user = users.find(u => u.id === w.userId);
        return {
          ...w,
          userName: user?.name || `Usuário #${w.userId}`,
          userEmail: user?.email || "",
        };
      });
    }),
    pending: protectedProcedure.query(async () => {
      const withdrawals = await db.getPendingWithdrawals();
      const users = await db.getAllAppUsers();
      
      return withdrawals.map(w => {
        const user = users.find(u => u.id === w.userId);
        return {
          ...w,
          userName: user?.name || `Usuário #${w.userId}`,
          userEmail: user?.email || "",
        };
      });
    }),
    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.approveWithdrawal(input.id);
        return { success: true };
      }),
    reject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.rejectWithdrawal(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
