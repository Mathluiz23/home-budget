using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeBudget.API.Data;
using HomeBudget.API.DTOs;
using HomeBudget.API.Models;
using System.Security.Claims;

namespace HomeBudget.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PiggybanksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PiggybanksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<PiggybankDto>>> GetPiggybanks()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybanks = await _context.Piggybanks
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.IsMainPiggybank)
                .ThenByDescending(p => p.CreatedAt)
                .ToListAsync();

            var piggybankDtos = piggybanks.Select(p => new PiggybankDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Amount = p.Amount,
                TargetAmount = p.TargetAmount,
                IsMainPiggybank = p.IsMainPiggybank,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                PercentageToTarget = p.PercentageToTarget,
                RemainingToTarget = p.RemainingToTarget
            }).ToList();

            return Ok(piggybankDtos);
        }

        [HttpGet("summary")]
        public async Task<ActionResult<PiggybankSummaryDto>> GetPiggybanksSummary()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybanks = await _context.Piggybanks
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.IsMainPiggybank)
                .ThenByDescending(p => p.CreatedAt)
                .ToListAsync();

            var piggybankDtos = piggybanks.Select(p => new PiggybankDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Amount = p.Amount,
                TargetAmount = p.TargetAmount,
                IsMainPiggybank = p.IsMainPiggybank,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                PercentageToTarget = p.PercentageToTarget,
                RemainingToTarget = p.RemainingToTarget
            }).ToList();

            var summary = new PiggybankSummaryDto
            {
                TotalAmount = piggybanks.Sum(p => p.Amount),
                TotalPiggybanks = piggybanks.Count,
                MainPiggybankAmount = piggybanks.FirstOrDefault(p => p.IsMainPiggybank)?.Amount ?? 0,
                Piggybanks = piggybankDtos
            };

            return Ok(summary);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PiggybankDto>> GetPiggybank(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == id)
                .FirstOrDefaultAsync();

            if (piggybank == null)
                return NotFound();

            var piggybankDto = new PiggybankDto
            {
                Id = piggybank.Id,
                Name = piggybank.Name,
                Description = piggybank.Description,
                Amount = piggybank.Amount,
                TargetAmount = piggybank.TargetAmount,
                IsMainPiggybank = piggybank.IsMainPiggybank,
                CreatedAt = piggybank.CreatedAt,
                UpdatedAt = piggybank.UpdatedAt,
                PercentageToTarget = piggybank.PercentageToTarget,
                RemainingToTarget = piggybank.RemainingToTarget
            };

            return Ok(piggybankDto);
        }

        [HttpPost]
        public async Task<ActionResult<PiggybankDto>> CreatePiggybank(CreatePiggybankDto createDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verificar se já existe um cofrinho principal
            var hasMainPiggybank = await _context.Piggybanks
                .AnyAsync(p => p.UserId == userId && p.IsMainPiggybank);

            var piggybank = new Piggybank
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Amount = createDto.InitialAmount,
                TargetAmount = createDto.TargetAmount,
                IsMainPiggybank = !hasMainPiggybank, // Primeiro cofrinho é automaticamente o principal
                UserId = userId!,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Piggybanks.Add(piggybank);

            // Se há valor inicial, criar uma transação de depósito
            if (createDto.InitialAmount > 0)
            {
                var initialTransaction = new PiggybankTransaction
                {
                    Amount = createDto.InitialAmount,
                    Description = "Depósito inicial",
                    Type = PiggybankTransactionType.Deposit,
                    PiggybankId = piggybank.Id,
                    UserId = userId!,
                    CreatedAt = DateTime.UtcNow
                };

                _context.PiggybankTransactions.Add(initialTransaction);
            }

            await _context.SaveChangesAsync();

            var piggybankDto = new PiggybankDto
            {
                Id = piggybank.Id,
                Name = piggybank.Name,
                Description = piggybank.Description,
                Amount = piggybank.Amount,
                TargetAmount = piggybank.TargetAmount,
                IsMainPiggybank = piggybank.IsMainPiggybank,
                CreatedAt = piggybank.CreatedAt,
                UpdatedAt = piggybank.UpdatedAt,
                PercentageToTarget = piggybank.PercentageToTarget,
                RemainingToTarget = piggybank.RemainingToTarget
            };

            return CreatedAtAction(nameof(GetPiggybank), new { id = piggybank.Id }, piggybankDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePiggybank(int id, UpdatePiggybankDto updateDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == id)
                .FirstOrDefaultAsync();

            if (piggybank == null)
                return NotFound();

            piggybank.Name = updateDto.Name;
            piggybank.Description = updateDto.Description;
            piggybank.TargetAmount = updateDto.TargetAmount;
            piggybank.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePiggybank(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == id)
                .FirstOrDefaultAsync();

            if (piggybank == null)
                return NotFound();

            // Permitir excluir qualquer cofrinho que não seja o principal
            // Se for o principal, só permitir se não houver outros cofrinhos
            if (piggybank.IsMainPiggybank)
            {
                var otherPiggybanks = await _context.Piggybanks
                    .CountAsync(p => p.UserId == userId && !p.IsMainPiggybank);
                
                if (otherPiggybanks > 0)
                    return BadRequest("Não é possível excluir o cofrinho principal enquanto existem outros cofrinhos. Exclua os outros cofrinhos primeiro.");
            }

            // Se o cofrinho tem saldo, transferir para o cofrinho principal
            if (piggybank.Amount > 0 && !piggybank.IsMainPiggybank)
            {
                var mainPiggybank = await _context.Piggybanks
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.IsMainPiggybank);

                if (mainPiggybank != null)
                {
                    // Transferir saldo para o cofrinho principal
                    mainPiggybank.Amount += piggybank.Amount;
                    mainPiggybank.UpdatedAt = DateTime.UtcNow;

                    // Criar transação de transferência
                    var transferTransaction = new PiggybankTransaction
                    {
                        Amount = piggybank.Amount,
                        Description = $"Transferência automática na exclusão do cofrinho '{piggybank.Name}'",
                        Type = PiggybankTransactionType.Transfer,
                        PiggybankId = mainPiggybank.Id,
                        SourcePiggybankId = piggybank.Id,
                        UserId = userId!,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.PiggybankTransactions.Add(transferTransaction);
                }
            }

            // Remover todas as transações relacionadas
            var transactions = await _context.PiggybankTransactions
                .Where(pt => pt.PiggybankId == id || pt.SourcePiggybankId == id)
                .ToListAsync();
            
            _context.PiggybankTransactions.RemoveRange(transactions);

            // Remover o cofrinho
            _context.Piggybanks.Remove(piggybank);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cofrinho excluído com sucesso. Saldo transferido para o cofrinho principal." });
        }

        [HttpPost("{id}/transactions")]
        public async Task<ActionResult<PiggybankTransactionDto>> CreateTransaction(int id, CreatePiggybankTransactionDto createDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == id)
                .FirstOrDefaultAsync();

            if (piggybank == null)
                return NotFound();

            // Validar se há saldo suficiente para saques
            if (createDto.Type == PiggybankTransactionType.Withdrawal && piggybank.Amount < createDto.Amount)
                return BadRequest("Saldo insuficiente no cofrinho.");

            var transaction = new PiggybankTransaction
            {
                Amount = createDto.Amount,
                Description = createDto.Description,
                Type = createDto.Type,
                PiggybankId = id,
                SourcePiggybankId = createDto.SourcePiggybankId,
                UserId = userId!,
                CreatedAt = DateTime.UtcNow
            };

            _context.PiggybankTransactions.Add(transaction);

            // Atualizar o valor do cofrinho
            if (createDto.Type == PiggybankTransactionType.Deposit || createDto.Type == PiggybankTransactionType.MonthlyBalance)
            {
                piggybank.Amount += createDto.Amount;
            }
            else if (createDto.Type == PiggybankTransactionType.Withdrawal)
            {
                piggybank.Amount -= createDto.Amount;
            }

            piggybank.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Recarregar para obter dados relacionados
            await _context.Entry(transaction)
                .Reference(t => t.Piggybank)
                .LoadAsync();

            if (transaction.SourcePiggybankId.HasValue)
            {
                await _context.Entry(transaction)
                    .Reference(t => t.SourcePiggybank)
                    .LoadAsync();
            }

            var transactionDto = new PiggybankTransactionDto
            {
                Id = transaction.Id,
                Amount = transaction.Amount,
                Description = transaction.Description,
                Type = transaction.Type,
                CreatedAt = transaction.CreatedAt,
                PiggybankId = transaction.PiggybankId,
                PiggybankName = transaction.Piggybank.Name,
                SourcePiggybankId = transaction.SourcePiggybankId,
                SourcePiggybankName = transaction.SourcePiggybank?.Name
            };

            return Ok(transactionDto);
        }

        [HttpPost("transfer")]
        public async Task<ActionResult> TransferBetweenPiggybanks(TransferBetweenPiggybanksDto transferDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var sourcePiggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == transferDto.SourcePiggybankId)
                .FirstOrDefaultAsync();

            var destinationPiggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == transferDto.DestinationPiggybankId)
                .FirstOrDefaultAsync();

            if (sourcePiggybank == null || destinationPiggybank == null)
                return NotFound("Cofrinho não encontrado.");

            if (sourcePiggybank.Amount < transferDto.Amount)
                return BadRequest("Saldo insuficiente no cofrinho de origem.");

            // Criar transação de saída
            var withdrawalTransaction = new PiggybankTransaction
            {
                Amount = transferDto.Amount,
                Description = $"Transferência para {destinationPiggybank.Name} - {transferDto.Description}",
                Type = PiggybankTransactionType.Transfer,
                PiggybankId = transferDto.SourcePiggybankId,
                UserId = userId!,
                CreatedAt = DateTime.UtcNow
            };

            // Criar transação de entrada
            var depositTransaction = new PiggybankTransaction
            {
                Amount = transferDto.Amount,
                Description = $"Transferência de {sourcePiggybank.Name} - {transferDto.Description}",
                Type = PiggybankTransactionType.Transfer,
                PiggybankId = transferDto.DestinationPiggybankId,
                SourcePiggybankId = transferDto.SourcePiggybankId,
                UserId = userId!,
                CreatedAt = DateTime.UtcNow
            };

            _context.PiggybankTransactions.AddRange(withdrawalTransaction, depositTransaction);

            // Atualizar saldos
            sourcePiggybank.Amount -= transferDto.Amount;
            sourcePiggybank.UpdatedAt = DateTime.UtcNow;

            destinationPiggybank.Amount += transferDto.Amount;
            destinationPiggybank.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transferência realizada com sucesso." });
        }

        [HttpGet("{id}/transactions")]
        public async Task<ActionResult<List<PiggybankTransactionDto>>> GetPiggybankTransactions(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var piggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.Id == id)
                .FirstOrDefaultAsync();

            if (piggybank == null)
                return NotFound();

            var transactions = await _context.PiggybankTransactions
                .Include(pt => pt.Piggybank)
                .Include(pt => pt.SourcePiggybank)
                .Where(pt => pt.PiggybankId == id)
                .OrderByDescending(pt => pt.CreatedAt)
                .ToListAsync();

            var transactionDtos = transactions.Select(t => new PiggybankTransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                Type = t.Type,
                CreatedAt = t.CreatedAt,
                PiggybankId = t.PiggybankId,
                PiggybankName = t.Piggybank.Name,
                SourcePiggybankId = t.SourcePiggybankId,
                SourcePiggybankName = t.SourcePiggybank?.Name
            }).ToList();

            return Ok(transactionDtos);
        }

        [HttpPost("calculate-monthly-balance")]
        public async Task<ActionResult> CalculateAndAddMonthlyBalance()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Debug: verificar userId
            Console.WriteLine($"DEBUG: UserId = {userId}");

            // Obter ou criar o cofrinho principal
            var mainPiggybank = await _context.Piggybanks
                .Where(p => p.UserId == userId && p.IsMainPiggybank)
                .FirstOrDefaultAsync();

            if (mainPiggybank == null)
            {
                mainPiggybank = new Piggybank
                {
                    Name = "Cofrinho Principal",
                    Description = "Cofrinho que acumula automaticamente o saldo de cada mês",
                    Amount = 0,
                    TargetAmount = 0,
                    IsMainPiggybank = true,
                    UserId = userId!,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Piggybanks.Add(mainPiggybank);
                await _context.SaveChangesAsync();
                Console.WriteLine("DEBUG: Cofrinho principal criado");
            }

            // Calcular saldo acumulado de todos os meses com saldo positivo
            var allTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.Date)
                .ToListAsync();

            Console.WriteLine($"DEBUG: Total de transações encontradas: {allTransactions.Count}");

            if (allTransactions.Count == 0)
            {
                return Ok(new { 
                    message = "Nenhuma transação encontrada.",
                    totalSavings = 0,
                    debug = "Sem transações no banco"
                });
            }

            var firstTransaction = allTransactions.First();
            Console.WriteLine($"DEBUG: Primeira transação em: {firstTransaction.Date}");

            decimal totalSavings = 0;
            var currentDate = new DateTime(firstTransaction.Date.Year, firstTransaction.Date.Month, 1);
            var today = DateTime.Now;
            var currentMonth = new DateTime(today.Year, today.Month, 1);

            Console.WriteLine($"DEBUG: Analisando de {currentDate:yyyy-MM} até {currentMonth:yyyy-MM}");

            // Resetar o cofrinho principal para recalcular do zero
            var existingBalanceTransactions = await _context.PiggybankTransactions
                .Where(pt => pt.PiggybankId == mainPiggybank.Id && pt.Type == PiggybankTransactionType.MonthlyBalance)
                .ToListAsync();

            _context.PiggybankTransactions.RemoveRange(existingBalanceTransactions);
            mainPiggybank.Amount = 0;

            var monthsProcessed = 0;

            // Iterar por todos os meses incluindo o mês atual
            while (currentDate <= currentMonth)
            {
                var endOfMonth = currentDate.AddMonths(1).AddDays(-1);

                var monthlyTransactions = allTransactions
                    .Where(t => t.Date >= currentDate && t.Date <= endOfMonth)
                    .ToList();

                var monthlyIncome = monthlyTransactions
                    .Where(t => t.Type == TransactionType.Income)
                    .Sum(t => t.Amount);

                var monthlyExpenses = monthlyTransactions
                    .Where(t => t.Type == TransactionType.Expense)
                    .Sum(t => t.Amount);

                var monthlyBalance = monthlyIncome - monthlyExpenses;

                Console.WriteLine($"DEBUG: Mês {currentDate:yyyy-MM} - Receitas: {monthlyIncome}, Despesas: {monthlyExpenses}, Saldo: {monthlyBalance}");

                monthsProcessed++;

                // Se há saldo positivo, adicionar ao cofrinho principal
                if (monthlyBalance > 0)
                {
                    var transaction = new PiggybankTransaction
                    {
                        Amount = monthlyBalance,
                        Description = $"Saldo do mês {currentDate:MM/yyyy}",
                        Type = PiggybankTransactionType.MonthlyBalance,
                        PiggybankId = mainPiggybank.Id,
                        UserId = userId!,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.PiggybankTransactions.Add(transaction);
                    totalSavings += monthlyBalance;
                    Console.WriteLine($"DEBUG: Adicionado {monthlyBalance} do mês {currentDate:yyyy-MM}");
                }

                currentDate = currentDate.AddMonths(1);
            }

            // Atualizar o valor do cofrinho principal
            mainPiggybank.Amount = totalSavings;
            mainPiggybank.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            Console.WriteLine($"DEBUG: Total economizado: {totalSavings}, Meses processados: {monthsProcessed}");

            return Ok(new { 
                message = "Saldo acumulado calculado e adicionado com sucesso.", 
                totalSavings = totalSavings,
                monthsProcessed = monthsProcessed,
                debug = $"Processados {monthsProcessed} meses, total: {totalSavings}"
            });
        }
    }
}