const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('ev_token', token);
    } else {
      sessionStorage.removeItem('ev_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = sessionStorage.getItem('ev_token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP ${res.status}`);
      }

      return data as T;
    } catch (err: any) {
      if (err.message && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  private async uploadRequest<T>(path: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // Auth
  async register(data: { first_name: string; last_name: string; email: string; username: string; mobile: string; password: string; referral_code?: string }) {
    const res = await this.request<{ user: any; token: string; error?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(username: string, password: string) {
    const res = await this.request<{ user: any; token: string; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async adminLogin(username: string, password: string) {
    const res = await this.request<{ user: any; admin: any; token: string; error?: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request<{ user: any; error?: string }>('/auth/me');
  }

  async changePassword(current_password: string, new_password: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  // User
  async getDashboard() {
    return this.request<any>('/user/dashboard');
  }

  async getProfile() {
    return this.request<{ user: any }>('/user/profile');
  }

  async updateProfile(data: any) {
    return this.request<{ user: any }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(page = 1, limit = 20) {
    return this.request<any>(`/user/transactions?page=${page}&limit=${limit}`);
  }

  async getReferrals() {
    return this.request<any>('/user/referrals');
  }

  async getReferralLink() {
    return this.request<any>('/user/referral-link');
  }

  // Tasks
  async getTasks() {
    return this.request<any>('/tasks');
  }

  async submitTask(taskId: string, data: { answer?: string; proof_image?: string }) {
    return this.request<any>(`/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTaskSubmissions() {
    return this.request<any>('/user/task-submissions');
  }

  // Activation
  async getPaymentMethods() {
    return this.request<any>('/payment-methods');
  }

  async requestActivation(data: any) {
    return this.request<any>('/activation/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyActivationRequests() {
    return this.request<any>('/activation/my-requests');
  }

  // Withdraw
  async requestWithdraw(data: any) {
    return this.request<any>('/withdraw/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyWithdrawRequests() {
    return this.request<any>('/withdraw/my-requests');
  }

  // Rewards / Daily Codes
  async getRewardCampaigns() {
    return this.request<any>('/daily-codes');
  }

  async claimDailyCode(code: string) {
    return this.request<any>('/daily-codes/claim', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getMyDailyCodeClaims() {
    return this.request<any>('/user/daily-code-claims');
  }

  async claimReward(campaignId: string) {
    return this.request<any>('/daily-codes/claim', {
      method: 'POST',
      body: JSON.stringify({ code: campaignId }),
    });
  }

  // Support
  async createTicket(data: any) {
    return this.request<any>('/support/ticket', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTickets() {
    return this.request<any>('/support/tickets');
  }

  async getTicket(id: string) {
    return this.request<any>(`/support/tickets/${id}`);
  }

  // Settings
  async getSettings() {
    return this.request<any>('/settings');
  }

  // Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.uploadRequest<{ url: string }>('/upload', formData);
  }

  // Admin
  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminUsers(params = '') {
    return this.request<any>(`/admin/users${params ? '?' + params : ''}`);
  }

  async getAdminUser(id: string) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async updateAdminUser(id: string, data: any) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async blockUser(id: string) {
    return this.request(`/admin/users/${id}/block`, { method: 'POST' });
  }

  async unblockUser(id: string) {
    return this.request(`/admin/users/${id}/unblock`, { method: 'POST' });
  }

  async adjustBalance(id: string, data: any) {
    return this.request(`/admin/users/${id}/balance-adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminActivationRequests(params = '') {
    return this.request<any>(`/admin/activation-requests${params ? '?' + params : ''}`);
  }

  async approveActivation(id: string) {
    return this.request(`/admin/activation-requests/${id}/approve`, { method: 'POST' });
  }

  async rejectActivation(id: string, reason: string) {
    return this.request(`/admin/activation-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminWithdrawRequests(params = '') {
    return this.request<any>(`/admin/withdraw-requests${params ? '?' + params : ''}`);
  }

  async approveWithdraw(id: string) {
    return this.request(`/admin/withdraw-requests/${id}/approve`, { method: 'POST' });
  }

  async rejectWithdraw(id: string, reason: string) {
    return this.request(`/admin/withdraw-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async markPaidWithdraw(id: string) {
    return this.request(`/admin/withdraw-requests/${id}/mark-paid`, { method: 'POST' });
  }

  async getAdminTasks() {
    return this.request<any>('/admin/tasks');
  }

  async createAdminTask(data: any) {
    return this.request<any>('/admin/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminTask(id: string, data: any) {
    return this.request<any>(`/admin/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminTask(id: string) {
    return this.request(`/admin/tasks/${id}`, { method: 'DELETE' });
  }

  async getAdminTaskSubmissions(params = '') {
    return this.request<any>(`/admin/task-submissions${params ? '?' + params : ''}`);
  }

  async approveTaskSubmission(id: string) {
    return this.request(`/admin/task-submissions/${id}/approve`, { method: 'POST' });
  }

  async rejectTaskSubmission(id: string, reason: string) {
    return this.request(`/admin/task-submissions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminSettings() {
    return this.request<any>('/admin/settings');
  }

  async updateAdminSettings(data: Record<string, string>) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminPaymentMethods() {
    return this.request<any>('/admin/payment-methods');
  }

  async createAdminPaymentMethod(data: any) {
    return this.request<any>('/admin/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminPaymentMethod(id: string, data: any) {
    return this.request<any>(`/admin/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminPaymentMethod(id: string) {
    return this.request(`/admin/payment-methods/${id}`, { method: 'DELETE' });
  }

  // Admin Daily Codes
  async getAdminDailyCodes() {
    return this.request<any>('/admin/daily-codes');
  }

  async createAdminDailyCode(data: any) {
    return this.request<any>('/admin/daily-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminDailyCode(id: string, data: any) {
    return this.request<any>(`/admin/daily-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminDailyCode(id: string) {
    return this.request(`/admin/daily-codes/${id}`, { method: 'DELETE' });
  }

  // Admin Reward Campaigns (legacy - kept for compatibility)
  async getAdminRewardCampaigns() {
    return this.getAdminDailyCodes();
  }

  async createAdminRewardCampaign(data: any) {
    return this.createAdminDailyCode(data);
  }

  async updateAdminRewardCampaign(id: string, data: any) {
    return this.updateAdminDailyCode(id, data);
  }

  async deleteAdminRewardCampaign(id: string) {
    return this.deleteAdminDailyCode(id);
  }

  async getAdminSupportTickets(params = '') {
    return this.request<any>(`/admin/support-tickets${params ? '?' + params : ''}`);
  }

  async replyAdminTicket(id: string, message: string) {
    return this.request(`/admin/support-tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getAdminTransactions(params = '') {
    return this.request<any>(`/admin/transactions${params ? '?' + params : ''}`);
  }

  async getAdminAuditLogs(page = 1) {
    return this.request<any>(`/admin/audit-logs?page=${page}`);
  }

  async changeAdminCredentials(data: { current_password: string; new_username?: string; new_password?: string }) {
    return this.request<any>('/admin/change-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminReferrals(params = '') {
    return this.request<any>(`/admin/referrals${params ? '?' + params : ''}`);
  }

  // Referral Reward Tiers (public)
  async getReferralRewardTiers() {
    return this.request<any>('/referral-reward-tiers');
  }

  // Referral Reward Tiers (admin)
  async getAdminReferralTiers() {
    return this.request<any>('/admin/referral-reward-tiers');
  }

  async createReferralTier(data: { level: number; reward_amount: number }) {
    return this.request<any>('/admin/referral-reward-tiers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReferralTier(level: number, data: { reward_amount: number }) {
    return this.request<any>(`/admin/referral-reward-tiers/${level}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteReferralTier(level: number) {
    return this.request(`/admin/referral-reward-tiers/${level}`, { method: 'DELETE' });
  }

  // Referral Commission Levels (admin)
  async getAdminCommissionLevels() {
    return this.request<any>('/admin/referral-commission-levels');
  }

  async createCommissionLevel(data: { level: number; commission_amount: number }) {
    return this.request<any>('/admin/referral-commission-levels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCommissionLevel(level: number) {
    return this.request(`/admin/referral-commission-levels/${level}`, { method: 'DELETE' });
  }

  // Bonus Campaigns (user)
  async getBonusCampaigns() {
    return this.request<any>('/bonus-campaigns');
  }

  async claimBonusCampaign(campaign_id: string) {
    return this.request<any>('/bonus-campaigns/claim', {
      method: 'POST',
      body: JSON.stringify({ campaign_id }),
    });
  }

  // Bonus Campaigns (admin)
  async getAdminBonusCampaigns() {
    return this.request<any>('/admin/bonus-campaigns');
  }

  async createAdminBonusCampaign(data: any) {
    return this.request<any>('/admin/bonus-campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminBonusCampaign(id: string, data: any) {
    return this.request<any>(`/admin/bonus-campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminBonusCampaign(id: string) {
    return this.request(`/admin/bonus-campaigns/${id}`, { method: 'DELETE' });
  }

  // Admin User Bonus Campaigns
  async getAdminUserBonusCampaigns(userId: string) {
    return this.request<any>(`/admin/users/${userId}/bonus-campaigns`);
  }

  async addAdminUserBonusCampaign(userId: string, data: { campaign_id: string; time_limit_hours?: number }) {
    return this.request<any>(`/admin/users/${userId}/bonus-campaigns`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUserBonusCampaign(userId: string, campaignId: string, data: { status?: string; time_limit_hours?: number }) {
    return this.request<any>(`/admin/users/${userId}/bonus-campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeAdminUserBonusCampaign(userId: string, campaignId: string) {
    return this.request(`/admin/users/${userId}/bonus-campaigns/${campaignId}`, { method: 'DELETE' });
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiService();
