using CarePortal.Application.DTOs;

namespace CarePortal.Application.Interfaces;

public interface IJobTimeService
{
    Task<JobTimeDto?> GetByIdAsync(int id);
    Task<JobTimeListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? staffId = null, int? clientId = null);
    Task<JobTimeDto> CreateAsync(CreateJobTimeDto createJobTimeDto, string? currentUserId = null);
    Task<JobTimeDto> UpdateAsync(int id, UpdateJobTimeDto updateJobTimeDto, string? currentUserId = null);
    Task<bool> DeleteAsync(int id);
    Task<bool> CompleteJobAsync(int id, DateTime endTime, string? currentUserId = null);
    Task<List<JobTimeDto>> GetByClientAsync(int clientId);
    Task<List<JobTimeDto>> GetByStaffAsync(string staffId);
    Task<List<JobTimeDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<JobTimeStatsDto> GetStatsAsync();
    Task<JobTimeStatsDto> GetStatsByStaffAsync(string staffId);
    Task<JobTimeStatsDto> GetStatsByClientAsync(int clientId);
} 