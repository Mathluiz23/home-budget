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
    public class BudgetsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BudgetsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<BudgetDto>>> GetBudgets(
            [FromQuery] bool activeOnly = false)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            IQueryable<Budget> query = _context.Budgets
                .Where(b => b.UserId == userId)
                .Include(b => b.Category);

            if (activeOnly)
                query = query.Where(b => b.IsActive);

            var budgets = await query.ToListAsync();

            var budgetDtos = new List<BudgetDto>();

            foreach (var budget in budgets)
            {
                var spentAmount = await _context.Transactions
                    .Where(t => t.UserId == userId && 
                               t.CategoryId == budget.CategoryId &&
                               t.Type == TransactionType.Expense &&
                               t.Date >= budget.StartDate && 
                               t.Date <= budget.EndDate)
                    .SumAsync(t => t.Amount);

                budgetDtos.Add(new BudgetDto
                {
                    Id = budget.Id,
                    Name = budget.Name,
                    Amount = budget.Amount,
                    StartDate = budget.StartDate,
                    EndDate = budget.EndDate,
                    IsActive = budget.IsActive,
                    CreatedAt = budget.CreatedAt,
                    CategoryId = budget.CategoryId,
                    CategoryName = budget.Category.Name,
                    CategoryColor = budget.Category.Color,
                    CategoryIcon = budget.Category.Icon,
                    SpentAmount = spentAmount,
                    RemainingAmount = budget.Amount - spentAmount,
                    PercentageUsed = budget.Amount > 0 ? (spentAmount / budget.Amount) * 100 : 0
                });
            }

            return Ok(budgetDtos.OrderByDescending(b => b.CreatedAt));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BudgetDto>> GetBudget(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var budget = await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null)
                return NotFound();

            var spentAmount = await _context.Transactions
                .Where(t => t.UserId == userId && 
                           t.CategoryId == budget.CategoryId &&
                           t.Type == TransactionType.Expense &&
                           t.Date >= budget.StartDate && 
                           t.Date <= budget.EndDate)
                .SumAsync(t => t.Amount);

            var budgetDto = new BudgetDto
            {
                Id = budget.Id,
                Name = budget.Name,
                Amount = budget.Amount,
                StartDate = budget.StartDate,
                EndDate = budget.EndDate,
                IsActive = budget.IsActive,
                CreatedAt = budget.CreatedAt,
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                CategoryColor = budget.Category.Color,
                CategoryIcon = budget.Category.Icon,
                SpentAmount = spentAmount,
                RemainingAmount = budget.Amount - spentAmount,
                PercentageUsed = budget.Amount > 0 ? (spentAmount / budget.Amount) * 100 : 0
            };

            return Ok(budgetDto);
        }

        [HttpPost]
        public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetDto createBudgetDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Verify category exists and belongs to user or is default
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == createBudgetDto.CategoryId && 
                              (c.UserId == userId || c.IsDefault));

            if (!categoryExists)
                return BadRequest(new { message = "Categoria inválida." });

            // Check for overlapping budgets for the same category
            var overlappingBudget = await _context.Budgets
                .AnyAsync(b => b.UserId == userId && 
                              b.CategoryId == createBudgetDto.CategoryId &&
                              b.IsActive &&
                              ((createBudgetDto.StartDate >= b.StartDate && createBudgetDto.StartDate <= b.EndDate) ||
                               (createBudgetDto.EndDate >= b.StartDate && createBudgetDto.EndDate <= b.EndDate) ||
                               (createBudgetDto.StartDate <= b.StartDate && createBudgetDto.EndDate >= b.EndDate)));

            if (overlappingBudget)
                return BadRequest(new { message = "Já existe um orçamento ativo para esta categoria no período especificado." });

            var budget = new Budget
            {
                Name = createBudgetDto.Name,
                Amount = createBudgetDto.Amount,
                StartDate = createBudgetDto.StartDate,
                EndDate = createBudgetDto.EndDate,
                UserId = userId!,
                CategoryId = createBudgetDto.CategoryId,
                IsActive = true
            };

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            // Load category information for response
            await _context.Entry(budget)
                .Reference(b => b.Category)
                .LoadAsync();

            var budgetDto = new BudgetDto
            {
                Id = budget.Id,
                Name = budget.Name,
                Amount = budget.Amount,
                StartDate = budget.StartDate,
                EndDate = budget.EndDate,
                IsActive = budget.IsActive,
                CreatedAt = budget.CreatedAt,
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                CategoryColor = budget.Category.Color,
                CategoryIcon = budget.Category.Icon,
                SpentAmount = 0,
                RemainingAmount = budget.Amount,
                PercentageUsed = 0
            };

            return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budgetDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetDto updateBudgetDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null)
                return NotFound();

            // Verify category exists and belongs to user or is default
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == updateBudgetDto.CategoryId && 
                              (c.UserId == userId || c.IsDefault));

            if (!categoryExists)
                return BadRequest(new { message = "Categoria inválida." });

            // Check for overlapping budgets for the same category (excluding current budget)
            var overlappingBudget = await _context.Budgets
                .AnyAsync(b => b.UserId == userId && 
                              b.Id != id &&
                              b.CategoryId == updateBudgetDto.CategoryId &&
                              b.IsActive &&
                              ((updateBudgetDto.StartDate >= b.StartDate && updateBudgetDto.StartDate <= b.EndDate) ||
                               (updateBudgetDto.EndDate >= b.StartDate && updateBudgetDto.EndDate <= b.EndDate) ||
                               (updateBudgetDto.StartDate <= b.StartDate && updateBudgetDto.EndDate >= b.EndDate)));

            if (overlappingBudget)
                return BadRequest(new { message = "Já existe um orçamento ativo para esta categoria no período especificado." });

            budget.Name = updateBudgetDto.Name;
            budget.Amount = updateBudgetDto.Amount;
            budget.StartDate = updateBudgetDto.StartDate;
            budget.EndDate = updateBudgetDto.EndDate;
            budget.CategoryId = updateBudgetDto.CategoryId;
            budget.IsActive = updateBudgetDto.IsActive;
            budget.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null)
                return NotFound();

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("alerts")]
        public async Task<ActionResult<List<BudgetAlertDto>>> GetBudgetAlerts()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var today = DateTime.UtcNow.Date;

            var activeBudgets = await _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == userId && 
                           b.IsActive && 
                           b.StartDate <= today && 
                           b.EndDate >= today)
                .ToListAsync();

            var alerts = new List<BudgetAlertDto>();

            foreach (var budget in activeBudgets)
            {
                var spentAmount = await _context.Transactions
                    .Where(t => t.UserId == userId && 
                               t.CategoryId == budget.CategoryId &&
                               t.Type == TransactionType.Expense &&
                               t.Date >= budget.StartDate && 
                               t.Date <= budget.EndDate)
                    .SumAsync(t => t.Amount);

                var percentageUsed = budget.Amount > 0 ? (spentAmount / budget.Amount) * 100 : 0;

                if (percentageUsed >= 80)
                {
                    alerts.Add(new BudgetAlertDto
                    {
                        BudgetId = budget.Id,
                        BudgetName = budget.Name,
                        CategoryName = budget.Category.Name,
                        Amount = budget.Amount,
                        SpentAmount = spentAmount,
                        PercentageUsed = percentageUsed,
                        AlertType = percentageUsed >= 100 ? "Exceeded" : "Warning"
                    });
                }
            }

            return Ok(alerts.OrderByDescending(a => a.PercentageUsed));
        }
    }
}