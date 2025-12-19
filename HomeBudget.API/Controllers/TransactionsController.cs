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
    public class TransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransactionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<TransactionDto>>> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] TransactionType? type = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            IQueryable<Transaction> query = _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category);

            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            if (type.HasValue)
                query = query.Where(t => t.Type == type.Value);

            var totalCount = await query.CountAsync();

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TransactionDto
                {
                    Id = t.Id,
                    Description = t.Description,
                    Amount = t.Amount,
                    Type = t.Type,
                    Date = t.Date,
                    CreatedAt = t.CreatedAt,
                    CategoryId = t.CategoryId,
                    CategoryName = t.Category.Name,
                    CategoryColor = t.Category.Color,
                    CategoryIcon = t.Category.Icon
                })
                .ToListAsync();

            Response.Headers.Append("X-Total-Count", totalCount.ToString());
            Response.Headers.Append("X-Page", page.ToString());
            Response.Headers.Append("X-Page-Size", pageSize.ToString());

            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDto>> GetTransaction(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var transaction = await _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.Id == id && t.UserId == userId)
                .Select(t => new TransactionDto
                {
                    Id = t.Id,
                    Description = t.Description,
                    Amount = t.Amount,
                    Type = t.Type,
                    Date = t.Date,
                    CreatedAt = t.CreatedAt,
                    CategoryId = t.CategoryId,
                    CategoryName = t.Category.Name,
                    CategoryColor = t.Category.Color,
                    CategoryIcon = t.Category.Icon
                })
                .FirstOrDefaultAsync();

            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpPost]
        public async Task<ActionResult<TransactionDto>> CreateTransaction([FromBody] CreateTransactionDto createTransactionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verify category exists and belongs to user or is default
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == createTransactionDto.CategoryId && 
                              (c.UserId == userId || c.IsDefault));

            if (!categoryExists)
                return BadRequest(new { message = "Categoria inválida." });

            var transaction = new Transaction
            {
                Description = createTransactionDto.Description,
                Amount = createTransactionDto.Amount,
                Type = createTransactionDto.Type,
                Date = createTransactionDto.Date,
                UserId = userId!,
                CategoryId = createTransactionDto.CategoryId
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Atualiza saldo do cofrinho principal automaticamente
            // Atualiza saldo do cofrinho principal para refletir o saldo do dashboard
            var mainPiggybank = await _context.Piggybanks.FirstOrDefaultAsync(p => p.UserId == userId && p.IsMainPiggybank);
            if (mainPiggybank != null)
            {
                // Calcula saldo igual ao dashboard: receitas - despesas
                var totalIncome = await _context.Transactions.Where(t => t.UserId == userId && t.Type == TransactionType.Income).SumAsync(t => t.Amount);
                var totalExpense = await _context.Transactions.Where(t => t.UserId == userId && t.Type == TransactionType.Expense).SumAsync(t => t.Amount);
                mainPiggybank.Amount = totalIncome - totalExpense;
                mainPiggybank.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            // Load category information for response
            await _context.Entry(transaction)
                .Reference(t => t.Category)
                .LoadAsync();

            var transactionDto = new TransactionDto
            {
                Id = transaction.Id,
                Description = transaction.Description,
                Amount = transaction.Amount,
                Type = transaction.Type,
                Date = transaction.Date,
                CreatedAt = transaction.CreatedAt,
                CategoryId = transaction.CategoryId,
                CategoryName = transaction.Category.Name,
                CategoryColor = transaction.Category.Color,
                CategoryIcon = transaction.Category.Icon
            };

            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transactionDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] UpdateTransactionDto updateTransactionDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            // Verify category exists and belongs to user or is default
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == updateTransactionDto.CategoryId && 
                              (c.UserId == userId || c.IsDefault));

            if (!categoryExists)
                return BadRequest(new { message = "Categoria inválida." });

            transaction.Description = updateTransactionDto.Description;
            transaction.Amount = updateTransactionDto.Amount;
            transaction.Type = updateTransactionDto.Type;
            transaction.Date = updateTransactionDto.Date;
            transaction.CategoryId = updateTransactionDto.CategoryId;
            transaction.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Atualiza saldo do cofrinho principal automaticamente
            var mainPiggybank = await _context.Piggybanks.FirstOrDefaultAsync(p => p.UserId == userId && p.IsMainPiggybank);
            if (mainPiggybank != null)
            {
                var totalIncome = await _context.Transactions.Where(t => t.UserId == userId && t.Type == TransactionType.Income).SumAsync(t => t.Amount);
                var totalExpense = await _context.Transactions.Where(t => t.UserId == userId && t.Type == TransactionType.Expense).SumAsync(t => t.Amount);
                mainPiggybank.Amount = totalIncome - totalExpense;
                mainPiggybank.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
                return NotFound();

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            // Atualiza saldo do cofrinho principal automaticamente
            var mainPiggybank = await _context.Piggybanks.FirstOrDefaultAsync(p => p.UserId == userId && p.IsMainPiggybank);
            if (mainPiggybank != null)
            {
                var totalIncome = await _context.Transactions.Where(t => t.UserId == userId && t.Type == TransactionType.Income).SumAsync(t => t.Amount);
                var totalExpense = await _context.Transactions.Where(t => t.UserId == userId && t.Type == TransactionType.Expense).SumAsync(t => t.Amount);
                mainPiggybank.Amount = totalIncome - totalExpense;
                mainPiggybank.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        [HttpGet("summary")]
        public async Task<ActionResult<TransactionSummaryDto>> GetSummary(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            IQueryable<Transaction> query = _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category);

            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value);

            var transactions = await query.ToListAsync();

            var summary = new TransactionSummaryDto
            {
                TotalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                TotalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)
            };

            summary.Balance = summary.TotalIncome - summary.TotalExpenses;

            summary.CategorySummaries = transactions
                .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Category.Color, t.Category.Icon })
                .Select(g => new CategorySummaryDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    CategoryColor = g.Key.Color,
                    CategoryIcon = g.Key.Icon,
                    TotalAmount = g.Sum(t => t.Amount),
                    TransactionCount = g.Count()
                })
                .OrderByDescending(c => c.TotalAmount)
                .ToList();

            return Ok(summary);
        }

        [HttpGet("monthly-report/{year}/{month}")]
        public async Task<ActionResult<MonthlyReportDto>> GetMonthlyReport(int year, int month)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
                .Include(t => t.Category)
                .ToListAsync();

            var report = new MonthlyReportDto
            {
                Year = year,
                Month = month,
                TotalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                TotalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)
            };

            report.Balance = report.TotalIncome - report.TotalExpenses;

            report.ExpensesByCategory = transactions
                .Where(t => t.Type == TransactionType.Expense)
                .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Category.Color, t.Category.Icon })
                .Select(g => new CategorySummaryDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    CategoryColor = g.Key.Color,
                    CategoryIcon = g.Key.Icon,
                    TotalAmount = g.Sum(t => t.Amount),
                    TransactionCount = g.Count()
                })
                .OrderByDescending(c => c.TotalAmount)
                .ToList();

            report.IncomeByCategory = transactions
                .Where(t => t.Type == TransactionType.Income)
                .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Category.Color, t.Category.Icon })
                .Select(g => new CategorySummaryDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    CategoryColor = g.Key.Color,
                    CategoryIcon = g.Key.Icon,
                    TotalAmount = g.Sum(t => t.Amount),
                    TransactionCount = g.Count()
                })
                .OrderByDescending(c => c.TotalAmount)
                .ToList();

            return Ok(report);
        }
    }
}