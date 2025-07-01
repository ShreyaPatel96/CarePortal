using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Persistence.Context;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients { get; set; }
    public DbSet<ClientDocument> ClientDocuments { get; set; }
    public DbSet<JobTime> JobTimes { get; set; }
    public DbSet<Incident> Incidents { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure BaseEntity properties for all entities
        ConfigureBaseEntity<Client>(builder);
        ConfigureBaseEntity<ClientDocument>(builder);
        ConfigureBaseEntity<JobTime>(builder);
        ConfigureBaseEntity<Incident>(builder);

        // Client configuration
        builder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            
            // Relationship with ApplicationUser (AssignedStaff)
            entity.HasOne(e => e.AssignedStaff)
                .WithMany(e => e.AssignedClients)
                .HasForeignKey(e => e.AssignedStaffId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ClientDocument configuration
        builder.Entity<ClientDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.FileName).HasMaxLength(500);
            entity.Property(e => e.FileType).HasMaxLength(50);
            entity.Property(e => e.UploadedBy).HasMaxLength(100);
            entity.Property(e => e.Deadline).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            
            // Relationship with Client
            entity.HasOne(e => e.Client)
                .WithMany(e => e.Documents)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // JobTime configuration
        builder.Entity<JobTime>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActivityType).IsRequired().HasConversion<int>();
            entity.Property(e => e.Notes).HasMaxLength(2000);
            
            // Relationship with Client
            entity.HasOne(e => e.Client)
                .WithMany(e => e.JobTimes)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Relationship with ApplicationUser (Staff)
            entity.HasOne(e => e.Staff)
                .WithMany(e => e.JobTimes)
                .HasForeignKey(e => e.StaffId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Incident configuration
        builder.Entity<Incident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Location).HasMaxLength(500);
            entity.Property(e => e.FileName).HasMaxLength(500);
            entity.Property(e => e.Status).IsRequired().HasConversion<int>();
            entity.Property(e => e.Severity).IsRequired().HasConversion<int>();
            
            // Relationship with Client
            entity.HasOne(e => e.Client)
                .WithMany()
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Relationship with ApplicationUser (Staff)
            entity.HasOne(e => e.Staff)
                .WithMany()
                .HasForeignKey(e => e.StaffId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ApplicationUser configuration
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        });

        // ApplicationRole configuration
        builder.Entity<ApplicationRole>(entity =>
        {
            entity.Property(e => e.Description).HasMaxLength(500);
        });
    }

    private static void ConfigureBaseEntity<T>(ModelBuilder builder) where T : BaseEntity
    {
        builder.Entity<T>(entity =>
        {
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.CreatedBy).HasMaxLength(450);
            entity.Property(e => e.UpdatedBy).HasMaxLength(450);
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
        });
    }
} 