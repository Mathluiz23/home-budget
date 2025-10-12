using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using HomeBudget.API.Models;

namespace HomeBudget.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<RecurringTransaction> RecurringTransactions { get; set; }
        public DbSet<Piggybank> Piggybanks { get; set; }
        public DbSet<PiggybankTransaction> PiggybankTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Budget>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<RecurringTransaction>()
                .Property(rt => rt.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Piggybank>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Piggybank>()
                .Property(p => p.TargetAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PiggybankTransaction>()
                .Property(pt => pt.Amount)
                .HasPrecision(18, 2);

            // Configure relationships
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.User)
                .WithMany(u => u.Transactions)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Category>()
                .HasOne(c => c.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Budget>()
                .HasOne(b => b.User)
                .WithMany(u => u.Budgets)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Budget>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Budgets)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RecurringTransaction>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RecurringTransactions)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RecurringTransaction>()
                .HasOne(rt => rt.Category)
                .WithMany()
                .HasForeignKey(rt => rt.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Piggybank relationships
            modelBuilder.Entity<Piggybank>()
                .HasOne(p => p.User)
                .WithMany(u => u.Piggybanks)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PiggybankTransaction>()
                .HasOne(pt => pt.Piggybank)
                .WithMany(p => p.PiggybankTransactions)
                .HasForeignKey(pt => pt.PiggybankId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PiggybankTransaction>()
                .HasOne(pt => pt.SourcePiggybank)
                .WithMany()
                .HasForeignKey(pt => pt.SourcePiggybankId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PiggybankTransaction>()
                .HasOne(pt => pt.User)
                .WithMany()
                .HasForeignKey(pt => pt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed default categories
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Alimentação", Description = "Compras de supermercado, restaurantes", Color = "#10B981", Icon = "utensils", IsDefault = true },
                new Category { Id = 2, Name = "Transporte", Description = "Gasolina, transporte público, manutenção", Color = "#3B82F6", Icon = "car", IsDefault = true },
                new Category { Id = 3, Name = "Moradia", Description = "Aluguel, contas de casa, manutenção", Color = "#8B5CF6", Icon = "home", IsDefault = true },
                new Category { Id = 4, Name = "Saúde", Description = "Medicamentos, consultas médicas", Color = "#EF4444", Icon = "heart", IsDefault = true },
                new Category { Id = 5, Name = "Educação", Description = "Cursos, livros, material escolar", Color = "#F59E0B", Icon = "book", IsDefault = true },
                new Category { Id = 6, Name = "Lazer", Description = "Entretenimento, viagens, hobbies", Color = "#EC4899", Icon = "gamepad", IsDefault = true },
                new Category { Id = 7, Name = "Outros", Description = "Despesas diversas", Color = "#6B7280", Icon = "more", IsDefault = true },
                new Category { Id = 8, Name = "Salário", Description = "Salário mensal", Color = "#059669", Icon = "dollar-sign", IsDefault = true },
                new Category { Id = 9, Name = "Renda Extra", Description = "Freelances, vendas, outros", Color = "#0D9488", Icon = "plus-circle", IsDefault = true }
            );
        }
    }
}