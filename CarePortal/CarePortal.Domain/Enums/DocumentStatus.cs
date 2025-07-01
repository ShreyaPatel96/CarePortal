namespace CarePortal.Domain.Enums
{
    public enum DocumentStatus : int
    {
        Pending = 1,
        Uploaded = 2,
        Overdue = 3,
    }

    public static class DocumentStatusExtensions
    {
        public static string GetDisplayName(this DocumentStatus documentStatus)
        {
            return documentStatus switch
            {
                DocumentStatus.Pending => "Pending",
                DocumentStatus.Uploaded => "upload",
                DocumentStatus.Overdue => "Overdue",
                _ => documentStatus.ToString()
            };
        }
    }
}
