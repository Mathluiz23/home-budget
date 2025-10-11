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
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var categories = await _context.Categories
                .Where(c => c.UserId == userId || c.IsDefault)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    Icon = c.Icon,
                    IsDefault = c.IsDefault,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(categories);
        }

        // Método público para buscar categorias padrão (usado em formulários)
        [HttpGet("default")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CategoryDto>>> GetDefaultCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsDefault)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    Icon = c.Icon,
                    IsDefault = c.IsDefault,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var category = await _context.Categories
                .Where(c => c.Id == id && (c.UserId == userId || c.IsDefault))
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Color = c.Color,
                    Icon = c.Icon,
                    IsDefault = c.IsDefault,
                    CreatedAt = c.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto createCategoryDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var category = new Category
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                Color = createCategoryDto.Color,
                Icon = createCategoryDto.Icon,
                UserId = userId,
                IsDefault = false
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Color = category.Color,
                Icon = category.Icon,
                IsDefault = category.IsDefault,
                CreatedAt = category.CreatedAt
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto updateCategoryDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return NotFound();

            if (category.IsDefault)
                return BadRequest(new { message = "Não é possível editar categorias padrão." });

            category.Name = updateCategoryDto.Name;
            category.Description = updateCategoryDto.Description;
            category.Color = updateCategoryDto.Color;
            category.Icon = updateCategoryDto.Icon;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return NotFound();

            if (category.IsDefault)
                return BadRequest(new { message = "Não é possível excluir categorias padrão." });

            var hasTransactions = await _context.Transactions
                .AnyAsync(t => t.CategoryId == id && t.UserId == userId);

            if (hasTransactions)
                return BadRequest(new { message = "Não é possível excluir categoria que possui transações." });

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}