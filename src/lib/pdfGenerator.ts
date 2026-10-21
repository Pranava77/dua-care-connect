import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedAt: string;
  generatedBy: string;
  data: any[];
  columns: Array<{
    header: string;
    dataKey: string;
    width?: number;
  }>;
  summary?: {
    label: string;
    value: string | number;
  }[];
}

export class PDFReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  generateReport(reportData: ReportData): void {
    const { title, subtitle, generatedAt, generatedBy, data, columns, summary } = reportData;

    // Add header
    this.addHeader(title, subtitle, generatedAt, generatedBy);

    // Add summary if provided
    if (summary && summary.length > 0) {
      this.addSummary(summary);
    }

    // Add data table
    this.addDataTable(data, columns);

    // Add footer
    this.addFooter();

    // Save the PDF
    this.doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  private addHeader(title: string, subtitle?: string, generatedAt?: string, generatedBy?: string): void {
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, 30);

    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, 20, 40);
    }

    // Generated info
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated: ${generatedAt || new Date().toLocaleDateString()}`, 20, 50);
    if (generatedBy) {
      this.doc.text(`By: ${generatedBy}`, 20, 55);
    }

    // Add line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, 60, 190, 60);
  }

  private addSummary(summary: Array<{ label: string; value: string | number }>): void {
    let yPosition = 70;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    summary.forEach((item, index) => {
      this.doc.text(`${item.label}:`, 20, yPosition);
      this.doc.text(String(item.value), 80, yPosition);
      yPosition += 8;
    });

    yPosition += 10;
  }

  private addDataTable(data: any[], columns: Array<{ header: string; dataKey: string; width?: number }>): void {
    if (data.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('No data available', 20, 80);
      return;
    }

    const tableData = data.map(row => 
      columns.map(col => row[col.dataKey] || '')
    );

    const tableColumns = columns.map(col => ({
      title: col.header,
      dataKey: col.dataKey,
      width: col.width || 'auto'
    }));

    this.doc.autoTable({
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 80,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 20, right: 20 },
    });
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Add page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.width / 2,
        this.doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      // Add company info
      this.doc.text(
        'SilverSync - Generated Report',
        20,
        this.doc.internal.pageSize.height - 10
      );
    }
  }
}

// Utility functions for different report types
export const generateResidentReport = async (residents: any[], generatedBy: string) => {
  const generator = new PDFReportGenerator();
  
  const reportData: ReportData = {
    title: 'Resident Management Report',
    subtitle: 'Complete list of all residents',
    generatedAt: new Date().toLocaleDateString(),
    generatedBy,
    data: residents,
    columns: [
      { header: 'Name', dataKey: 'name', width: 50 },
      { header: 'Room Number', dataKey: 'room_number', width: 30 },
      { header: 'Date of Birth', dataKey: 'date_of_birth', width: 40 },
      { header: 'Emergency Contact', dataKey: 'emergency_contact', width: 60 },
    ],
    summary: [
      { label: 'Total Residents', value: residents.length },
      { label: 'Report Date', value: new Date().toLocaleDateString() },
    ]
  };

  generator.generateReport(reportData);
};

export const generateFinancialReport = async (invoices: any[], generatedBy: string) => {
  const generator = new PDFReportGenerator();
  
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
  
  const reportData: ReportData = {
    title: 'Financial Report',
    subtitle: 'Invoice and payment summary',
    generatedAt: new Date().toLocaleDateString(),
    generatedBy,
    data: invoices,
    columns: [
      { header: 'Invoice #', dataKey: 'invoice_number', width: 30 },
      { header: 'Resident', dataKey: 'resident_name', width: 50 },
      { header: 'Amount', dataKey: 'amount', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 },
      { header: 'Due Date', dataKey: 'due_date', width: 30 },
    ],
    summary: [
      { label: 'Total Amount', value: `£${totalAmount.toLocaleString()}` },
      { label: 'Paid Invoices', value: paidInvoices.length },
      { label: 'Pending Invoices', value: pendingInvoices.length },
      { label: 'Total Invoices', value: invoices.length },
    ]
  };

  generator.generateReport(reportData);
};

export const generateMedicalReport = async (medicalRecords: any[], prescriptions: any[], generatedBy: string) => {
  const generator = new PDFReportGenerator();
  
  const reportData: ReportData = {
    title: 'Medical Records Report',
    subtitle: 'Medical records and prescriptions summary',
    generatedAt: new Date().toLocaleDateString(),
    generatedBy,
    data: medicalRecords,
    columns: [
      { header: 'Resident', dataKey: 'residents.name', width: 40 },
      { header: 'Diagnosis', dataKey: 'diagnosis', width: 50 },
      { header: 'Treatment', dataKey: 'treatment', width: 60 },
      { header: 'Doctor', dataKey: 'doctor', width: 30 },
      { header: 'Last Check', dataKey: 'last_check_date', width: 30 },
    ],
    summary: [
      { label: 'Total Medical Records', value: medicalRecords.length },
      { label: 'Total Prescriptions', value: prescriptions.length },
      { label: 'Report Date', value: new Date().toLocaleDateString() },
    ]
  };

  generator.generateReport(reportData);
};

/** Exports an AI-drafted Markdown report as a simple paginated PDF (headings, bullets, tables as text). */
export const generateMarkdownReport = (title: string, markdown: string, generatedBy: string) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = doc.internal.pageSize.getWidth() - 40;
  let y = 30;

  const write = (text: string, size: number, style: 'normal' | 'bold' = 'normal', indent = 0) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    for (const line of doc.splitTextToSize(text, width - indent)) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20 + indent, y);
      y += size * 0.5;
    }
  };

  write(title, 18, 'bold');
  doc.setTextColor(100);
  write(`Generated ${new Date().toLocaleString()} by ${generatedBy} — AI draft, review before sharing`, 9);
  doc.setTextColor(0);
  y += 4;

  const plain = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`([^`]*)`/g, '$1').replace(/\[(.*?)\]\(.*?\)/g, '$1');
  for (const raw of markdown.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) { y += 2; continue; }
    if (/^\|?\s*:?-{3,}/.test(line)) continue; // table separator rows
    const heading = /^(#{1,6})\s+(.*)/.exec(line);
    if (heading) {
      y += 2;
      write(plain(heading[2]), heading[1].length <= 2 ? 14 : 12, 'bold');
    } else if (/^\s*[-*]\s+/.test(line)) {
      write(`• ${plain(line.replace(/^\s*[-*]\s+/, ''))}`, 10, 'normal', 4);
    } else if (line.startsWith('|')) {
      write(plain(line.split('|').map((c) => c.trim()).filter(Boolean).join('   ·   ')), 9);
    } else {
      write(plain(line), 10);
    }
  }
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};
