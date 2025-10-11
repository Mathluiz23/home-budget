using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.API.DTOs;
using HomeBudget.API.Services;
using System.Security.Claims;

namespace HomeBudget.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            _logger.LogInformation("Register attempt for email: {Email}", registerDto?.Email);
            
            if (registerDto == null)
            {
                _logger.LogWarning("Register DTO is null");
                return BadRequest(new { message = "Dados de registro não fornecidos." });
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState is invalid: {Errors}", 
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(registerDto);
            if (result == null)
            {
                _logger.LogWarning("Registration failed for email: {Email}", registerDto.Email);
                return BadRequest(new { message = "Falha ao registrar usuário. Verifique se o email não está em uso e se a senha atende aos requisitos de segurança." });
            }

            _logger.LogInformation("Registration successful for email: {Email}", registerDto.Email);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
                return BadRequest(new { message = "Email ou senha inválidos." });

            return Ok(result);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return BadRequest(new { message = "Token inválido." });

            var result = await _authService.GetUserProfileAsync(userId);
            if (result == null)
                return NotFound(new { message = "Usuário não encontrado." });

            return Ok(result);
        }
    }
}