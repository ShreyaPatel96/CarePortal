namespace CarePortal.Domain.Enums;

public interface DisplayableEnum
{
    string GetDisplayName();
}

public enum ActivityType : int
{
    HospitalVisit = 1,
    GardenWalk = 2,
    MedicationAssistance = 3,
    MealPreparation = 4,
    PersonalCare = 5,
    Companionship = 6,
    Transportation = 7,
    Physiotherapy = 8,
    DoctorAppointment = 9,
    GroceryShopping = 10,
    Housekeeping = 11,
    Other = 12,
}

public static class ActivityTypeExtensions
{
    public static string GetDisplayName(this ActivityType activityType)
    {
        return activityType switch
        {
            ActivityType.HospitalVisit => "Hospital Visit",
            ActivityType.GardenWalk => "Garden Walk",
            ActivityType.MedicationAssistance => "Medication Assistance",
            ActivityType.MealPreparation => "Meal Preparation",
            ActivityType.PersonalCare => "Personal Care",
            ActivityType.Companionship => "Companionship",
            ActivityType.Transportation => "Transportation",
            ActivityType.Physiotherapy => "Physiotherapy",
            ActivityType.DoctorAppointment => "Doctor Appointment",
            ActivityType.GroceryShopping => "Grocery Shopping",
            ActivityType.Housekeeping => "Housekeeping",
            ActivityType.Other => "Other",
            _ => activityType.ToString()
        };
    }
}