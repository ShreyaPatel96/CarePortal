import { JobTime, CreateJobTimeDto, UpdateJobTimeDto } from '../../services/jobTimeService';

export interface IJobTimeContext {
  jobTimes: JobTime[];
  loading: boolean;
  error: string | null;
  
  // Job time operations
  addJobTime: (jobTime: CreateJobTimeDto) => Promise<void>;
  updateJobTime: (id: number, jobTime: UpdateJobTimeDto) => Promise<void>;
  deleteJobTime: (id: number) => Promise<void>;
  refreshJobTimes: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
} 