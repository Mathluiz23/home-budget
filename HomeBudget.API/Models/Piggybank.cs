using System.ComponentModel.DataAnnotations;

namespace HomeBudget.API.Models
{
    public class Piggybank
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be greater than or equal to 0")]
        public decimal Amount { get; set; } = 0;
        
        public decimal TargetAmount { get; set; } = 0;
        
        public bool IsMainPiggybank { get; set; } = false; // Cofrinho principal que recebe saldos mensais
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        
        // Calculated properties
        public decimal PercentageToTarget => TargetAmount > 0 ? (Amount / TargetAmount) * 100 : 0;
        public decimal RemainingToTarget => TargetAmount > Amount ? TargetAmount - Amount : 0;
        
        // Navigation properties
        public ICollection<PiggybankTransaction> PiggybankTransactions { get; set; } = new List<PiggybankTransaction>();
    }
    
    public class PiggybankTransaction
    {
        public int Id { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        public PiggybankTransactionType Type { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        [Required]
        public int PiggybankId { get; set; }
        public Piggybank Piggybank { get; set; } = null!;
        
        public int? SourcePiggybankId { get; set; } // Para transferências entre cofrinhos
        public Piggybank? SourcePiggybank { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
    }
    
    public enum PiggybankTransactionType
    {
        Deposit = 1,      // Depósito
        Withdrawal = 2,   // Saque
        Transfer = 3,     // Transferência entre cofrinhos
        MonthlyBalance = 4 // Saldo mensal automático
    }
}