import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClient } from '../contexts/ClientContext';
import { useJobTime } from '../contexts/JobTimeContext';
import { useIncident } from '../contexts/IncidentContext';
import { useDocument } from '../contexts/DocumentContext';
import { useUser } from '../contexts/UserContext';
import { DashboardStats, RecentActivity } from '../services/dashboardService';
import { 
  Users, 
  UserCheck, 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp size={14} className="mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { clients, loading: clientsLoading, error: clientsError, refreshClients } = useClient();
  const { jobTimes, loading: jobTimesLoading, error: jobTimesError, refreshJobTimes } = useJobTime();
  const { incidents, loading: incidentsLoading, error: incidentsError, refreshIncidents } = useIncident();
  const { documents, loading: documentsLoading, error: documentsError, refreshDocuments } = useDocument();
  const { users, loading: usersLoading, error: usersError, refreshUsers } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Refresh all data when component mounts or when user navigates back to dashboard
  useEffect(() => {
    const refreshAllData = async () => {
      try {
        await Promise.all([
          refreshClients(),
          refreshJobTimes(),
          refreshIncidents(),
          refreshDocuments(),
          refreshUsers()
        ]);
      } catch (error) {
        console.error('❌ Dashboard - Failed to refresh data:', error);
      } 
    };

    refreshAllData();
  }, []); // Only run once when component mounts

  useEffect(() => {
    // Calculate dashboard stats from DataContext data
    const calculateStats = () => {
      // Don't calculate stats if still loading or if any required data is missing
      if (clientsLoading || jobTimesLoading || incidentsLoading || documentsLoading || usersLoading) {
        return;
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

      // Ensure all data arrays exist before using array methods
      const clientsArray = Array.isArray(clients) ? clients : [];
      const jobTimesArray = Array.isArray(jobTimes) ? jobTimes : [];
      const incidentsArray = Array.isArray(incidents) ? incidents : [];
      const documentsArray = Array.isArray(documents) ? documents : [];
      const usersArray = Array.isArray(users) ? users : [];

      // Calculate stats from available data
      const activeClients = clientsArray.filter(c => c.isActive).length;
      const totalClients = clientsArray.length;
      
      const todayJobTimes = jobTimesArray.filter(j => {
        const jobDate = new Date(j.startTime);
        return jobDate >= startOfDay;
      }).length;
      const totalJobTimes = jobTimesArray.length;
      
      const pendingDocuments = documentsArray.filter(d => d.status === 'pending').length;
      const totalDocuments = documentsArray.length;
      
      const openIncidents = incidentsArray.filter(i => i.status === 1).length; // Assuming status 1 is "Open"
      const totalIncidents = incidentsArray.length;
      
      const thisWeekJobTimes = jobTimesArray.filter(j => {
        const jobDate = new Date(j.startTime);
        return jobDate >= startOfWeek;
      });
      
      const totalHoursThisWeek = thisWeekJobTimes.reduce((total, job) => {
        if (job.duration) {
          const hours = parseFloat(job.duration.split(':')[0]) + parseFloat(job.duration.split(':')[1]) / 60;
          return total + hours;
        }
        return total;
      }, 0);
      
      const averageHoursPerDay = thisWeekJobTimes.length > 0 ? totalHoursThisWeek / 7 : 0;
      
      const activeUsers = usersArray.filter(u => u.isActive).length;
      const totalUsers = usersArray.length;

      const calculatedStats = {
        activeClients,
        totalClients,
        todayJobTimes,
        totalJobTimes,
        pendingDocuments,
        totalDocuments,
        openIncidents,
        totalIncidents,
        totalHoursThisWeek: Math.round(totalHoursThisWeek),
        averageHoursPerDay,
        activeUsers,
        totalUsers
      };
      setStats(calculatedStats);
    };

    calculateStats();
  }, [clients, jobTimes, incidents, documents, users, clientsLoading, jobTimesLoading, incidentsLoading, documentsLoading, usersLoading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create recent activities from available data
  useEffect(() => {
    const createRecentActivities = () => {
      // Don't create activities if still loading
      if (clientsLoading || jobTimesLoading || incidentsLoading || documentsLoading || usersLoading) {
        return;
      }
      const activities: RecentActivity[] = [];
      
      // Ensure arrays exist before using array methods
      const jobTimesArray = Array.isArray(jobTimes) ? jobTimes : [];
      const incidentsArray = Array.isArray(incidents) ? incidents : [];

      // Add recent job times
      const recentJobTimes = jobTimesArray
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5)
        .map(job => ({
          id: job.id.toString(),
          type: 'job_time',
          title: `Job for ${job.clientName}`,
          description: job.activityTypeDisplayName || 'No activity type',
          createdAt: job.startTime,
          createdBy: job.staffName || 'Unknown Staff',
          relatedEntityName: job.clientName
        }));
      
      // Add recent incidents
      const recentIncidents = incidentsArray
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(incident => ({
          id: incident.id.toString(),
          type: 'incident',
          title: incident.title,
          description: incident.description,
          createdAt: incident.createdAt,
          createdBy: incident.staffName || 'Unknown Staff',
          relatedEntityName: incident.clientName
        }));
      
      activities.push(...recentJobTimes, ...recentIncidents);
      activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentActivities(activities.slice(0, 10));
    };

    createRecentActivities();
  }, [jobTimes, incidents, jobTimesLoading, incidentsLoading, clientsLoading, documentsLoading, usersLoading]);

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const isLoading = clientsLoading || jobTimesLoading || incidentsLoading || documentsLoading || usersLoading;
  const hasError = clientsError || jobTimesError || incidentsError || documentsError || usersError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-4">
        <ErrorDisplay error={clientsError || jobTimesError || incidentsError || documentsError || usersError || 'Unknown error'} onClear={() => {}} />
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Unable to load dashboard data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName} {user?.lastName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your care management today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin && (
            <StatsCard
              title="Active Users"
              value={stats.activeUsers}
              icon={Users}
              color="bg-blue-500"
              trend={`${stats.totalUsers} total`}
            />
          )}
          <StatsCard
            title="Active Clients"
            value={stats.activeClients}
            icon={UserCheck}
            color="bg-green-500"
            trend={`${stats.totalClients} total`}
          />
          <StatsCard
            title="Today's Jobs"
            value={stats.todayJobTimes}
            icon={Clock}
            color="bg-purple-500"
            trend={`${stats.totalJobTimes} total`}
          />
          <StatsCard
            title="Pending Documents"
            value={stats.pendingDocuments}
            icon={FileText}
            color="bg-amber-500"
            trend={`${stats.totalDocuments} total`}
          />
          <StatsCard
            title="Open Incidents"
            value={stats.openIncidents}
            icon={AlertTriangle}
            color="bg-red-500"
            trend={`${stats.totalIncidents} total`}
          />
          <StatsCard
            title="Hours This Week"
            value={stats.totalHoursThisWeek}
            icon={Clock}
            color="bg-indigo-500"
            trend={`${stats.averageHoursPerDay.toFixed(1)} avg/day`}
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Logs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Job Logs</h2>
            <Clock size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.filter(activity => activity.type === 'job_time').length > 0 ? (
              recentActivities.filter(activity => activity.type === 'job_time').map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{log.title}</p>
                    <p className="text-sm text-gray-600">{log.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{log.createdBy}</p>
                    <CheckCircle size={16} className="text-green-500 ml-auto" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent job logs</p>
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
            <AlertTriangle size={20} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivities.filter(activity => activity.type === 'incident').length > 0 ? (
              recentActivities.filter(activity => activity.type === 'incident').map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{incident.title}</p>
                    <p className="text-sm text-gray-600">{incident.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(incident.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{incident.createdBy}</p>
                    <XCircle size={16} className="text-red-500 ml-auto" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent incidents</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('clients')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <UserCheck size={24} className="text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">Add Client</span>
          </button>
          <button 
            onClick={() => handleQuickAction('job-times')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
          >
            <Clock size={24} className="text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Job Time</span>
          </button>
          <button 
            onClick={() => handleQuickAction('documents')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <FileText size={24} className="text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Add Document</span>
          </button>
          <button 
            onClick={() => handleQuickAction('incidents')}
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          >
            <AlertTriangle size={24} className="text-red-600 mb-2" />
            <span className="text-sm font-medium text-red-700">Report Incident</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;