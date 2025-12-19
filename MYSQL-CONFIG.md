# ✅ Configuração MySQL - HomeBudget

## Suas Credenciais MySQL

```
Usuário: root
Senha: 150606
Banco de Dados: homebudget
Host: localhost
Porta: 3306 (padrão)
```

## 📁 Arquivo de Configuração

**Localização:** `HomeBudget.API/appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=homebudget;User=root;Password=150606;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## ✅ Status Atual

- ✅ MySQL configurado com suas credenciais
- ✅ Banco de dados `homebudget` criado
- ✅ Tabelas criadas automaticamente pelo Entity Framework
- ✅ Backend rodando em http://localhost:5021
- ✅ Frontend rodando em http://localhost:3000

## 📋 Tabelas Criadas

O backend criou as seguintes tabelas automaticamente:
- `AspNetUsers` - Usuários
- `AspNetRoles` - Perfis de usuário
- `Categories` - Categorias de transações
- `Transactions` - Transações (receitas e despesas)
- `Budgets` - Orçamentos mensais
- `Piggybanks` - Cofrinhos
- `PiggybankTransactions` - Transações dos cofrinhos
- `RecurringTransactions` - Transações recorrentes
- Outras tabelas auxiliares do Identity

## 🔧 Comandos Úteis MySQL

### Acessar o MySQL
```bash
mysql -u root -p150606
```

### Ver bancos de dados
```sql
SHOW DATABASES;
```

### Usar o banco homebudget
```sql
USE homebudget;
```

### Ver todas as tabelas
```sql
SHOW TABLES;
```

### Ver usuários cadastrados
```sql
SELECT Id, Email, UserName FROM AspNetUsers;
```

### Ver transações
```sql
SELECT * FROM Transactions ORDER BY Date DESC LIMIT 10;
```

### Ver cofrinhos
```sql
SELECT * FROM Piggybanks;
```

### Ver categorias
```sql
SELECT * FROM Categories;
```

## 🔒 Segurança

⚠️ **IMPORTANTE:**
- O arquivo `appsettings.Development.json` NÃO deve ser commitado no Git
- Ele já está no `.gitignore`
- Para produção, use variáveis de ambiente no Railway/Vercel

## 🚀 Próximos Passos

1. ✅ MySQL configurado
2. ✅ Backend rodando
3. ✅ Frontend rodando
4. 🎯 Acesse http://localhost:3000
5. 📝 Registre um novo usuário
6. 🎉 Comece a usar o sistema!

## 📦 Para Deploy em Produção

Quando fizer deploy no Railway:
- O Railway fornecerá um MySQL automaticamente
- A connection string será diferente
- Use variáveis de ambiente:
  ```
  ConnectionStrings__DefaultConnection=<MYSQL_URL_DO_RAILWAY>
  ```

---

Está tudo configurado e funcionando! 🎉
