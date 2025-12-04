const API_BASE_URL = "https://youngmoney-api-production.up.railway.app";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erro na requisição");
      }

      return data.data as T;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request<{
      totalUsers: number;
      pointsToday: number;
      notificationsSent: number;
      pendingWithdrawals: number;
    }>("/admin/stats.php");
  }

  async getChartData(days: number = 7) {
    return this.request<Array<{
      date: string;
      users: number;
      points: number;
    }>>(`/admin/chart.php?days=${days}`);
  }

  // Users
  async getUsers(page: number = 1, limit: number = 50, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request<{
      users: Array<{
        id: number;
        name: string;
        email: string;
        points: number;
        daily_points: number;
        created_at: string;
        banned: boolean;
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/users.php?${params}`);
  }

  async getUserDetails(userId: number) {
    return this.request<{
      id: number;
      name: string;
      email: string;
      points: number;
      daily_points: number;
      created_at: string;
      banned: boolean;
      history: Array<{
        id: number;
        points: number;
        description: string;
        created_at: string;
      }>;
    }>(`/admin/users.php/${userId}`);
  }

  async addPoints(userId: number, points: number, description: string) {
    return this.request<{ success: boolean }>("/admin/users/add-points.php", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, points, description }),
    });
  }

  async removePoints(userId: number, points: number, description: string) {
    return this.request<{ success: boolean }>("/admin/users/remove-points.php", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, points, description }),
    });
  }

  async banUser(userId: number) {
    return this.request<{ success: boolean }>("/admin/users/ban.php", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async unbanUser(userId: number) {
    return this.request<{ success: boolean }>("/admin/users/unban.php", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async deleteAllUsers() {
    return this.request<{ success: boolean; deleted_count: number }>("/admin/users/delete_all.php", {
      method: "POST",
    });
  }

  // Notifications
  async sendNotification(userId: number | null, title: string, message: string, points?: number) {
    return this.request<{ success: boolean }>("/admin/notifications/send.php", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId, // null = enviar para todos
        title,
        message,
        ...(points && { points }), // Adiciona points se fornecido
      }),
    });
  }

  async getNotifications(page: number = 1, limit: number = 50) {
    return this.request<{
      notifications: Array<{
        id: number;
        user_id: number | null;
        user_name: string | null;
        title: string;
        message: string;
        created_at: string;
      }>;
      total: number;
    }>(`/admin/notifications.php?page=${page}&limit=${limit}`);
  }

  // Ranking
  async getRanking(period: "daily" | "weekly" | "monthly" = "daily") {
    return this.request<Array<{
      position: number;
      user_id: number;
      name: string;
      points: number;
    }>>(`/admin/ranking.php?period=${period}`);
  }

  async resetRanking() {
    return this.request<{ success: boolean }>("/admin/ranking/reset.php", {
      method: "POST",
    });
  }

  // Withdrawals
  async getWithdrawals(status?: "pending" | "approved" | "rejected") {
    const params = status ? `?status=${status}` : "";
    return this.request<Array<{
      id: number;
      user_id: number;
      user_name: string;
      amount: number;
      pix_key: string;
      status: string;
      created_at: string;
      processed_at: string | null;
    }>>(`/admin/withdrawals.php${params}`);
  }

  async approveWithdrawal(withdrawalId: number) {
    return this.request<{ success: boolean }>("/admin/withdrawals/approve.php", {
      method: "POST",
      body: JSON.stringify({ withdrawal_id: withdrawalId }),
    });
  }

  async rejectWithdrawal(withdrawalId: number, reason: string) {
    return this.request<{ success: boolean }>("/admin/withdrawals/reject.php", {
      method: "POST",
      body: JSON.stringify({ withdrawal_id: withdrawalId, reason }),
    });
  }

  // Settings
  async getSettings() {
    return this.request<{
      prize_values: Record<string, number>;
      withdrawal_limits: {
        min: number;
        max: number;
      };
      quick_withdrawal_values: number[];
      reset_time: string;
    }>("/admin/settings.php");
  }

  async updateSettings(settings: any) {
    return this.request<{ success: boolean }>("/admin/settings.php", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }

  async getQuickWithdrawalValues() {
    return this.request<Array<{ id: number; value: number; order: number }>>(
      "/admin/quick_withdrawal_values.php"
    );
  }

  async updateQuickWithdrawalValues(values: number[]) {
    return this.request<{ success: boolean }>("/admin/quick_withdrawal_values.php", {
      method: "POST",
      body: JSON.stringify({ values }),
    });
  }

  // Roulette
  async getRouletteSettings() {
    return this.request<Record<string, { value: number; description: string }>>(
      "/admin/roulette/settings.php"
    );
  }

  async updateRouletteSettings(prizes: Record<string, number>, maxDailySpins?: number) {
    const payload: any = { prizes };
    if (maxDailySpins !== undefined) {
      payload.max_daily_spins = maxDailySpins;
    }
    
    return this.request<{ updated_count: number; message: string }>(
      "/admin/roulette/settings.php",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }
}

export const api = new ApiService();
