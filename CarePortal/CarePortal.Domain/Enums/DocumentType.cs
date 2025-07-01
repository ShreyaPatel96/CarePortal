namespace CarePortal.Domain.Enums
{
    public enum DocumentType : int
    {
        PDF = 1,
        DOC = 2,
        DOCX = 3,
        Image = 4
    }

    public static class DocumentTypeExtensions
    {
        public static string GetDisplayName(this DocumentType documentType)
        {
            return documentType switch
            {
                DocumentType.PDF => "PDF",
                DocumentType.DOC => "DOC",
                DocumentType.DOCX => "DOCX",
                DocumentType.Image => "Image",
                _ => documentType.ToString()
            };
        }
    }
}
