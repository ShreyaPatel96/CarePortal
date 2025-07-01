import { apiService } from './api';

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalUsers: number;
  activeUsers: number;
  totalJobTimes: number;
  todayJobTimes: number;
  totalIncidents: number;
  openIncidents: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalHoursThisWeek: number;
  averageHoursPerDay: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  relatedEntityName: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

export class DashboardService {
  // Get complete dashboard data (stats + recent activities)
  async getDashboard(): Promise<DashboardData> {
    return apiService.get<DashboardData>('/Dashboard');
  }

  // Get dashboard statistics only
  async getStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/Dashboard/stats');
  }

  // Get recent activities
  async getRecentActivities(count: number = 10): Promise<RecentActivity[]> {
    return apiService.get<RecentActivity[]>(`/Dashboard/recent-activities?count=${count}`);
  }
}

export const dashboardService = new DashboardService(); 