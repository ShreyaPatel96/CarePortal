import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { jobTimeService, JobTime, CreateJobTimeDto, UpdateJobTimeDto } from '../services/jobTimeService';
import { ErrorHandler } from '../utils/errorHandler';
import { IJobTimeContext } from './interfaces/IJobTimeContext';

interface JobTimeProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const JobTimeContext = createContext<IJobTimeContext | undefined>(undefined);

export const useJobTime = () => {
  const context = useContext(JobTimeContext);
  if (context === undefined) {
    throw new Error('useJobTime must be used within a JobTimeProvider');
  }
  return context;
};

// Helper function to handle API errors
const handleApiError = (error: any, operation: string): string => {
  return ErrorHandler.extractErrorMessage(error, operation);
};

export const JobTimeProvider: React.FC<JobTimeProviderProps> = ({ children, isAuthenticated }) => {
  const [jobTimes, setJobTimes] = useState<JobTime[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    loading: false,
    operation: false
  });

  const jobTimesLoadingRef = useRef(false);

  // Load initial data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshJobTimes();
    } else {
      setJobTimes([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Job time operations with optimistic updates
  const refreshJobTimes = useCallback(async () => {
    if (jobTimesLoadingRef.current) {
      return;
    }
    
    jobTimesLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await jobTimeService.getAll(1, 100);
      setJobTimes(response.jobTimes);
    } catch (err) {
      const errorMessage = handleApiError(err, 'job times');
      console.error('❌ JobTimeContext - Failed to load job times:', err);
      setError(errorMessage);
    } finally {
      jobTimesLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const addJobTime = async (jobTime: CreateJobTimeDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      const tempJobTime: JobTime = {
        id: Date.now(), // Temporary ID
        clientId: jobTime.clientId,
        staffId: jobTime.staffId,
        startTime: jobTime.startTime,
        endTime: jobTime.endTime || '',
        activityType: jobTime.activityType,
        activityTypeDisplayName: 'Loading...',
        notes: jobTime.notes || '',
        isActive: jobTime.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientName: 'Loading...',
        staffName: 'Loading...',
        duration: '0',
        isCompleted: false,
      };
      
      setJobTimes(prev => [tempJobTime, ...prev]);
      
      const newJobTime = await jobTimeService.create(jobTime);
      
      setJobTimes(prev => prev.map(jt => jt.id === tempJobTime.id ? newJobTime : jt));
    } catch (err) {
      setJobTimes(prev => prev.filter(jt => jt.id !== Date.now()));
      
      const errorMessage = handleApiError(err, 'add job time');
      setError(errorMessage);
      console.error('❌ JobTimeContext - Failed to add job time:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const updateJobTime = async (id: number, jobTime: UpdateJobTimeDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      setJobTimes(prev => prev.map(jt => 
        jt.id === id 
          ? { ...jt, ...jobTime, updatedAt: new Date().toISOString() }
          : jt
      ));
      
      await jobTimeService.update(id, jobTime);
    } catch (err) {
      // Revert optimistic update on error
      await refreshJobTimes();
      
      const errorMessage = handleApiError(err, 'update job time');
      setError(errorMessage);
      console.error('❌ JobTimeContext - Failed to update job time:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const deleteJobTime = async (id: number) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    const jobTimeToDelete = jobTimes.find(jt => jt.id === id);
    
    try {
      setJobTimes(prev => prev.filter(jt => jt.id !== id));
      
      await jobTimeService.delete(id);
    } catch (err) {
      if (jobTimeToDelete) {
        setJobTimes(prev => [...prev, jobTimeToDelete]);
      }
      
      const errorMessage = handleApiError(err, 'delete job time');
      setError(errorMessage);
      console.error('❌ JobTimeContext - Failed to delete job time:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: IJobTimeContext = {
    jobTimes,
    loading: loadingStates.loading || loadingStates.operation,
    error,
    addJobTime,
    updateJobTime,
    deleteJobTime,
    refreshJobTimes,
    clearError,
  };

  return (
    <JobTimeContext.Provider value={value}>
      {children}
    </JobTimeContext.Provider>
  );
}; 