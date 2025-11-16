import { Express } from "express";
import { getAppUserById } from "../db";

/**
 * Registra todos os endpoints necessários para o app mobile
 */
export function registerMobileApiRoutes(app: Express) {
  
  // Helper para verificar autenticação
  const requireAuth = (req: any, res: any): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return null;
    }
    return authHeader.substring(7);
  };

  // User Profile
  app.get("/user/profile.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      // TODO: Decode token to get userId
      // For now, return mock data
      const userId = 27; // Mock user ID
      const user = await getAppUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points || 0,
          totalEarned: user.totalEarned || 0,
          totalWithdrawn: user.totalWithdrawn || 0,
          inviteCode: user.inviteCode || "",
          createdAt: user.createdAt,
        }
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // User Balance
  app.get("/user/balance.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      const userId = 27; // Mock user ID
      const user = await getAppUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      res.json({
        success: true,
        data: {
          balance: user.points || 0,
          totalEarned: user.totalEarned || 0,
        }
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Ranking List
  app.get("/ranking/list.php", async (req, res) => {
    try {
      const { getTopRanking } = await import("../db");
      const ranking = await getTopRanking(20);

      res.json({
        success: true,
        data: {
          ranking: ranking.map((r, index) => ({
            position: index + 1,
            userId: r.userId,
            name: r.userName,
            points: r.userPoints,
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching ranking:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // User Position in Ranking
  app.get("/ranking/user_position.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      // Mock response
      res.json({
        success: true,
        data: {
          position: 1,
          totalUsers: 16,
        }
      });
    } catch (error) {
      console.error("Error fetching user position:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Notifications List
  app.get("/notifications/list.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      const { getNotifications } = await import("../db");
      const notifications = await getNotifications();

      res.json({
        success: true,
        data: {
          notifications: notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt).getTime(),
            read: n.read || false,
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Points History
  app.get("/history/points.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      const userId = 27; // Mock user ID
      const { getRecentTransactions } = await import("../db");
      const transactions = await getRecentTransactions(userId, 50);

      res.json({
        success: true,
        data: {
          transactions: transactions.map(t => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            type: parseFloat(t.amount.toString()) > 0 ? "earn" : "spend",
            timestamp: new Date(t.createdAt).getTime(),
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Withdrawal History
  app.get("/withdraw/history.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      const userId = 27; // Mock user ID
      const { getWithdrawalsByUser } = await import("../db");
      const withdrawals = await getWithdrawalsByUser(userId);

      res.json({
        success: true,
        data: {
          withdrawals: withdrawals.map(w => ({
            id: w.id,
            amount: w.amount,
            pixKey: w.pixKey,
            pixType: w.pixType,
            status: w.status,
            createdAt: new Date(w.createdAt).getTime(),
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Settings Get
  app.get("/settings/get.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      // Mock settings
      res.json({
        success: true,
        data: {
          notifications_enabled: true,
          sound_enabled: true,
          vibration_enabled: true,
          theme: "dark",
        }
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // My Invite Code
  app.get("/invite/my_code.php", async (req, res) => {
    try {
      const token = requireAuth(req, res);
      if (!token) return;

      const userId = 27; // Mock user ID
      const user = await getAppUserById(userId);

      res.json({
        success: true,
        data: {
          inviteCode: user?.inviteCode || "YM" + userId.toString().padStart(6, "0"),
          inviteCount: 0,
        }
      });
    } catch (error) {
      console.error("Error fetching invite code:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });
}
