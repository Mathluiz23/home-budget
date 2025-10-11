using System.ComponentModel.DataAnnotations;

namespace HomeBudget.API.Models
{
    public enum TransactionType
    {
        Income = 1,
        Expense = 2
    }

    public class Transaction
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public TransactionType Type { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        
        [Required]
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}