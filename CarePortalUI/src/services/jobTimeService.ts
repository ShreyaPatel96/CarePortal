import { apiService } from './api';

export interface JobTime {
  id: number;
  clientId: number;
  clientName: string;
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
  activityType: number;
  activityTypeDisplayName: string;
  notes: string;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  duration: string;
  isCompleted: boolean;
}

export interface CreateJobTimeDto {
  clientId: number;
  staffId: string;
  startTime: string;
  endTime?: string;
  activityType: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateJobTimeDto {
  startTime?: string;
  endTime?: string;
  activityType?: number;
  notes?: string;
  isActive?: boolean;
}

export interface JobTimeListDto {
  jobTimes: JobTime[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface JobTimeStatsDto {
  totalJobTimes: number;
  completedJobTimes: number;
  pendingJobTimes: number;
  totalHours: number;
  averageHoursPerJob: number;
  activityTypeBreakdown: Record<string, number>;
  staffHoursBreakdown: Record<string, number>;
}

class JobTimeService {
  async getAll(pageNumber = 1, pageSize = 10, clientId?: number): Promise<JobTimeListDto> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (clientId) {
      params.append('clientId', clientId.toString());
    }
    
    return await apiService.get<JobTimeListDto>(`/JobTime?${params.toString()}`);
  }

  async getById(id: number): Promise<JobTime> {
    return await apiService.get<JobTime>(`/JobTime/${id}`);
  }

  async create(jobTime: CreateJobTimeDto): Promise<JobTime> {
    return await apiService.post<JobTime>('/JobTime', jobTime);
  }

  async update(id: number, jobTime: UpdateJobTimeDto): Promise<JobTime> {
    return await apiService.put<JobTime>(`/JobTime/${id}`, jobTime);
  }

  async delete(id: number): Promise<boolean> {
    return await apiService.delete<boolean>(`/JobTime/${id}`);
  }

  async completeJob(id: number, endTime: string): Promise<boolean> {
    return await apiService.put<boolean>(`/JobTime/${id}/complete`, { endTime });
  }

  async getByClient(clientId: number): Promise<JobTime[]> {
    return await apiService.get<JobTime[]>(`/JobTime/client/${clientId}`);
  }

  async getByStaff(staffId: string): Promise<JobTime[]> {
    return await apiService.get<JobTime[]>(`/JobTime/staff/${staffId}`);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<JobTime[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return await apiService.get<JobTime[]>(`/JobTime/date-range?${params.toString()}`);
  }

  async getStats(): Promise<JobTimeStatsDto> {
    return await apiService.get<JobTimeStatsDto>('/JobTime/stats');
  }

  async getStatsByStaff(staffId: string): Promise<JobTimeStatsDto> {
    return await apiService.get<JobTimeStatsDto>(`/JobTime/stats/staff/${staffId}`);
  }

  async getStatsByClient(clientId: number): Promise<JobTimeStatsDto> {
    return await apiService.get<JobTimeStatsDto>(`/JobTime/stats/client/${clientId}`);
  }
}

export const jobTimeService = new JobTimeService(); 