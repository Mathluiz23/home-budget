"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=homebudget;User=root;Password=150606;"
}

CREATE TABLE IF NOT EXISTS Piggybanks (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT,
    Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    TargetAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    IsMainPiggybank INTEGER NOT NULL DEFAULT 0,
    UserId TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PiggybankTransactions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    PiggybankId INTEGER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Type INTEGER NOT NULL,
    Description TEXT,
    SourcePiggybankId INTEGER,
    UserId TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    FOREIGN KEY (PiggybankId) REFERENCES Piggybanks(Id) ON DELETE CASCADE,
    FOREIGN KEY (SourcePiggybankId) REFERENCES Piggybanks(Id) ON DELETE RESTRICT,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

-- Criar o cofrinho principal padrão para usuários existentes se necessário
-- INSERT INTO Piggybanks (Name, Description, Amount, TargetAmount, IsMainPiggybank, UserId, CreatedAt, UpdatedAt)
-- SELECT 'Cofrinho Principal', 'Cofrinho principal para economias', 0.00, 0.00, 1, Id, datetime('now'), datetime('now')
-- FROM AspNetUsers 
-- WHERE Id NOT IN (SELECT DISTINCT UserId FROM Piggybanks WHERE IsMainPiggybank = 1);