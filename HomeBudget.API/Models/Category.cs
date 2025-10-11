using System.ComponentModel.DataAnnotations;

namespace HomeBudget.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(7)]
        public string Color { get; set; } = "#3B82F6"; // Default blue color
        
        public string Icon { get; set; } = "category"; // Default icon
        
        public bool IsDefault { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign key
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        
        // Navigation properties
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    }
}