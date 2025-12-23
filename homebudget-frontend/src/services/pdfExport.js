import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const CATEGORY_COLORS = [
  [33, 150, 243],
  [0, 188, 212],
  [245, 158, 11],
  [229, 62, 62],
  [118, 74, 188],
  [14, 165, 233],
  [56, 178, 172],
  [16, 185, 129],
  [126, 34, 206],
  [236, 72, 153],
];

// Serviço de exportação de PDF com formatação personalizada
class PDFExportService {
  // Formata valores em moeda brasileira
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  // Formata datas
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  // Adiciona cabeçalho ao PDF
  addHeader(doc, user, title) {
    const pageWidth = doc.internal.pageSize.width;
    
    // Cor primária (azul)
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Título em branco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HomeBudget', 20, 18);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 20, 30);
    
    // Nome do usuário no canto direito
    if (user) {
      doc.setFontSize(10);
      const userName = user.email || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuário';
      const userWidth = doc.getTextWidth(userName);
      doc.text(userName, pageWidth - userWidth - 20, 25);
    }
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0);
  }

  // Adiciona rodapé ao PDF
  addFooter(doc, pageNumber, totalPages) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    
    // Data de geração
    const generatedDate = new Date().toLocaleString('pt-BR');
    doc.text(`Gerado em: ${generatedDate}`, 20, pageHeight - 10);
    
    // Número da página
    doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 50, pageHeight - 10);
  }

  // Adiciona seção de resumo financeiro
  addFinancialSummary(doc, summary, startY) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text('Resumo Financeiro', 20, startY);
    
    // Caixas de resumo
    const pageWidth = doc.internal.pageSize.width;
    const boxY = startY + 10;
    const boxWidth = 58;
    const boxHeight = 32;
    const spacing = 8;
    const totalWidth = (boxWidth * 3) + (spacing * 2);
    const startX = (pageWidth - totalWidth) / 2;
    
    // Receitas (verde)
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(startX, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Receitas', startX + 5, boxY + 10);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(summary.totalIncome), startX + 5, boxY + 23);
    
    // Despesas (vermelho)
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(startX + boxWidth + spacing, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Despesas', startX + boxWidth + spacing + 5, boxY + 10);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(summary.totalExpenses), startX + boxWidth + spacing + 5, boxY + 23);
    
    // Saldo (azul ou vermelho dependendo do valor)
    const balanceColor = summary.balance >= 0 ? [16, 185, 129] : [239, 68, 68];
    doc.setFillColor(...balanceColor);
    doc.roundedRect(startX + (boxWidth + spacing) * 2, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Saldo', startX + (boxWidth + spacing) * 2 + 5, boxY + 10);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatCurrency(summary.balance), startX + (boxWidth + spacing) * 2 + 5, boxY + 23);
    
    doc.setTextColor(0, 0, 0);
    
    return boxY + boxHeight + 15;
  }

  // Adiciona tabela de transações
  addTransactionsTable(doc, transactions, startY) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text('Transações Detalhadas', 20, startY);
    
    // Prepara dados da tabela
    const tableData = transactions.map(t => [
      this.formatDate(t.date),
      t.description,
      t.categoryName,
      t.type === 1 ? 'Receita' : 'Despesa',
      this.formatCurrency(t.amount),
    ]);
    
    // Configuração da tabela
    autoTable(doc, {
      startY: startY + 5,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        // Colore a coluna de tipo
        if (data.column.index === 3 && data.section === 'body') {
          const transaction = transactions[data.row.index];
          if (transaction.type === 1) {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
        // Colore a coluna de valor
        if (data.column.index === 4 && data.section === 'body') {
          const transaction = transactions[data.row.index];
          if (transaction.type === 1) {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
      margin: { left: 20, right: 20 },
    });
    
    return doc.lastAutoTable.finalY + 10;
  }

  // Adiciona resumo por categoria
  addCategorySummary(doc, categorySummaries, startY) {
    if (!categorySummaries || categorySummaries.length === 0) return startY;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text('Resumo por Categoria', 20, startY);
    
    const tableData = categorySummaries.map(c => [
      c.categoryName,
      c.transactionCount,
      this.formatCurrency(c.totalAmount),
    ]);
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Categoria', 'Transações', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 20, right: 20 },
    });
    
    return doc.lastAutoTable.finalY + 10;
  }

  // Desenha gráfico de barras com gastos por categoria
  addCategorySpendingChart(doc, categorySummaries, startY) {
    const expenses = (categorySummaries || [])
      .map(c => ({
        name: c.categoryName,
        value: c.expenseTotal || 0,
      }))
      .filter(item => item.value > 0);

    if (expenses.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(120, 120, 120);
      doc.text('Nenhum gasto por categoria para exibir.', 20, startY + 10);
      doc.setTextColor(0, 0, 0);
      return startY + 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text('Gastos por Categoria', 20, startY);

    const chartStartY = startY + 12;
    const barHeight = 8;
    const barSpacing = 6;
    const chartWidth = doc.internal.pageSize.width - 90;
    const maxAmount = Math.max(...expenses.map(e => e.value));
    let currentY = chartStartY;

    expenses.forEach((item, index) => {
      const barLength = maxAmount === 0 ? 0 : (item.value / maxAmount) * chartWidth;
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      doc.setFillColor(...color);
      doc.roundedRect(50, currentY, Math.max(barLength, 3), barHeight, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(item.name, 20, currentY + barHeight - 1);
      doc.text(this.formatCurrency(item.value), 55 + Math.max(barLength, 3), currentY + barHeight - 1);
      currentY += barHeight + barSpacing;
    });

    doc.setTextColor(0, 0, 0);
    return currentY + 5;
  }

  // Captura e adiciona gráfico como imagem
  async addChartImage(doc, chartElementId, startY, title) {
    const chartElement = document.getElementById(chartElementId);
    if (!chartElement) return startY;
    
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adiciona título do gráfico
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text(title, 20, startY);
      
      doc.addImage(imgData, 'PNG', 20, startY + 5, imgWidth, imgHeight);
      
      return startY + imgHeight + 15;
    } catch (error) {
      console.error('Erro ao capturar gráfico:', error);
      return startY;
    }
  }

  // Exporta relatório completo de transações
  async exportTransactionsReport(data, user) {
    try {
      console.log('PDFExportService: Iniciando exportação...');
      console.log('PDFExportService: Dados recebidos:', data);
      console.log('PDFExportService: Usuário:', user);
      
      const doc = new jsPDF();
      let currentY = 50;
      
      // Cabeçalho
      console.log('PDFExportService: Adicionando cabeçalho...');
      this.addHeader(doc, user, 'Relatório de Transações');
      
      // Período do relatório
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const period = data.period || `${this.formatDate(new Date())}`;
      doc.text(`Período: ${period}`, 20, currentY);
      currentY += 10;
      
      // Resumo financeiro
      if (data.summary) {
        console.log('PDFExportService: Adicionando resumo financeiro...');
        currentY = this.addFinancialSummary(doc, data.summary, currentY);
      }
      
      // Verifica se precisa adicionar nova página
      if (currentY > 200) {
        doc.addPage();
        currentY = 30;
      }
      
      // Tabela de transações
      if (data.transactions && data.transactions.length > 0) {
        console.log('PDFExportService: Adicionando tabela de transações...');
        currentY = this.addTransactionsTable(doc, data.transactions, currentY);
      }
      
      // Adiciona nova página para categorias
      doc.addPage();
      currentY = 30;
      
      // Resumo por categoria
      if (data.categorySummaries && data.categorySummaries.length > 0) {
        console.log('PDFExportService: Adicionando resumo por categoria...');
        currentY = this.addCategorySummary(doc, data.categorySummaries, currentY);
      }
      
      // Adiciona rodapé em todas as páginas
      console.log('PDFExportService: Adicionando rodapés...');
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        this.addFooter(doc, i, totalPages);
      }
      
      // Salva o PDF
      const fileName = `relatorio-transacoes-${new Date().getTime()}.pdf`;
      console.log('PDFExportService: Salvando PDF:', fileName);
      doc.save(fileName);
      console.log('PDFExportService: PDF salvo com sucesso!');
    } catch (error) {
      console.error('PDFExportService: Erro ao gerar PDF:', error);
      throw error;
    }
  }

  // Exporta relatório com gráficos
  async exportReportWithCharts(data, user, chartIds = []) {
    const doc = new jsPDF();
    let currentY = 50;
    
    // Cabeçalho
    this.addHeader(doc, user, 'Relatório Completo');
    
    // Período
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const period = data.period || `${this.formatDate(new Date())}`;
    doc.text(`Período: ${period}`, 20, currentY);
    currentY += 10;
    
    // Resumo financeiro
    if (data.summary) {
      currentY = this.addFinancialSummary(doc, data.summary, currentY);
    }
    
    // Resumo por categoria + gráfico de gastos
    if (data.categorySummaries && data.categorySummaries.length > 0) {
      if (currentY > 200) {
        doc.addPage();
        currentY = 30;
      }
      currentY = this.addCategorySummary(doc, data.categorySummaries, currentY);
      if (currentY > doc.internal.pageSize.height - 80) {
        doc.addPage();
        currentY = 30;
      }
      currentY = this.addCategorySpendingChart(doc, data.categorySummaries, currentY + 5);
    }
    
    // Adiciona gráficos capturados do front
    for (const chartConfig of chartIds) {
      doc.addPage();
      currentY = 30;
      currentY = await this.addChartImage(doc, chartConfig.id, currentY, chartConfig.title);
    }
    
    // Tabela de transações em nova página
    if (data.transactions && data.transactions.length > 0) {
      doc.addPage();
      currentY = 30;
      this.addTransactionsTable(doc, data.transactions, currentY);
    }
    
    // Adiciona rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      this.addFooter(doc, i, totalPages);
    }
    
    // Salva
    const fileName = `relatorio-completo-${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }
}

export default new PDFExportService();
