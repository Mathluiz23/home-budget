using System.ComponentModel.DataAnnotations;

namespace HomeBudget.API.Models
{
    public class Budget
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        
        [Required]
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        
        // Calculated properties
        public decimal SpentAmount => Transactions?.Sum(t => t.Amount) ?? 0;
        public decimal RemainingAmount => Amount - SpentAmount;
        public decimal PercentageUsed => Amount > 0 ? (SpentAmount / Amount) * 100 : 0;
        
        // Navigation properties
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}