using System.ComponentModel.DataAnnotations;
using HomeBudget.API.Models;

namespace HomeBudget.API.DTOs
{
    public class PiggybankDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public decimal TargetAmount { get; set; }
        public bool IsMainPiggybank { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal PercentageToTarget { get; set; }
        public decimal RemainingToTarget { get; set; }
    }

    public class CreatePiggybankDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Target amount must be greater than or equal to 0")]
        public decimal TargetAmount { get; set; } = 0;
        
        [Range(0, double.MaxValue, ErrorMessage = "Initial amount must be greater than or equal to 0")]
        public decimal InitialAmount { get; set; } = 0;
    }

    public class UpdatePiggybankDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Target amount must be greater than or equal to 0")]
        public decimal TargetAmount { get; set; } = 0;
    }

    public class PiggybankTransactionDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public PiggybankTransactionType Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public int PiggybankId { get; set; }
        public string PiggybankName { get; set; } = string.Empty;
        public int? SourcePiggybankId { get; set; }
        public string? SourcePiggybankName { get; set; }
    }

    public class CreatePiggybankTransactionDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public PiggybankTransactionType Type { get; set; }
        
        public int? SourcePiggybankId { get; set; } // Para transferências
    }

    public class TransferBetweenPiggybanksDto
    {
        [Required]
        public int SourcePiggybankId { get; set; }
        
        [Required]
        public int DestinationPiggybankId { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
    }

    // DTO para resumo de cofrinhos
    public class PiggybankSummaryDto
    {
        public decimal TotalAmount { get; set; }
        public int TotalPiggybanks { get; set; }
        public decimal MainPiggybankAmount { get; set; }
        public List<PiggybankDto> Piggybanks { get; set; } = new List<PiggybankDto>();
    }
}