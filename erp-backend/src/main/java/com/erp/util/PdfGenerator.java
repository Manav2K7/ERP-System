package com.erp.util;

import com.erp.dto.response.InvoiceItemResponse;
import com.erp.dto.response.InvoiceResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class PdfGenerator {
    
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    public byte[] generateInvoicePdf(InvoiceResponse invoice) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();
            
            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
            Paragraph title = new Paragraph("INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Add invoice details
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            
            // Invoice info table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(10);
            infoTable.setSpacingAfter(20);
            
            addInfoRow(infoTable, "Invoice No:", String.valueOf(invoice.getId()), headerFont, normalFont);
            addInfoRow(infoTable, "Date:", invoice.getInvoiceDate().format(DATE_FORMAT), headerFont, normalFont);
            addInfoRow(infoTable, "Status:", invoice.getStatus().name(), headerFont, normalFont);
            
            document.add(infoTable);
            
            // Customer info
            Paragraph customerHeader = new Paragraph("Bill To:", headerFont);
            customerHeader.setSpacingAfter(5);
            document.add(customerHeader);
            
            PdfPTable customerTable = new PdfPTable(2);
            customerTable.setWidthPercentage(50);
            customerTable.setSpacingAfter(15);
            
            addInfoRow(customerTable, "Name:", invoice.getCustomerName(), headerFont, normalFont);
            addInfoRow(customerTable, "Email:", invoice.getCustomerEmail(), headerFont, normalFont);
            if (invoice.getCustomerGstin() != null) {
                addInfoRow(customerTable, "GSTIN:", invoice.getCustomerGstin(), headerFont, normalFont);
            }
            
            document.add(customerTable);
            
            // Items table
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
            Font tableFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setSpacingBefore(10);
            itemsTable.setSpacingAfter(10);
            
            // Set column widths
            float[] columnWidths = {40f, 200f, 50f, 60f, 70f};
            itemsTable.setWidths(columnWidths);
            
            // Table headers
            addTableHeader(itemsTable, "S.No", tableHeaderFont);
            addTableHeader(itemsTable, "Product", tableHeaderFont);
            addTableHeader(itemsTable, "Qty", tableHeaderFont);
            addTableHeader(itemsTable, "Unit Price", tableHeaderFont);
            addTableHeader(itemsTable, "Total", tableHeaderFont);
            
            // Table rows
            List<InvoiceItemResponse> items = invoice.getItems();
            for (int i = 0; i < items.size(); i++) {
                InvoiceItemResponse item = items.get(i);
                addTableCell(itemsTable, String.valueOf(i + 1), tableFont);
                addTableCell(itemsTable, item.getProductName(), tableFont);
                addTableCell(itemsTable, String.valueOf(item.getQuantity()), tableFont);
                addTableCell(itemsTable, String.format("₹%.2f", item.getUnitPrice()), tableFont);
                addTableCell(itemsTable, String.format("₹%.2f", item.getLineTotal()), tableFont);
            }
            
            document.add(itemsTable);
            
            // Totals
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(50);
            totalsTable.setHorizontalAlignment(Element.RIGHT);
            totalsTable.setSpacingBefore(10);
            
            addInfoRow(totalsTable, "Subtotal:", String.format("₹%.2f", invoice.getSubtotal()), headerFont, normalFont);
            addInfoRow(totalsTable, "Tax (GST):", String.format("₹%.2f", invoice.getTaxAmount()), headerFont, normalFont);
            addInfoRow(totalsTable, "Total Payable:", String.format("₹%.2f", invoice.getTotalPayable()), headerFont, normalFont);
            
            document.add(totalsTable);
            
            // Footer
            document.add(new Paragraph("\n\n"));
            Paragraph footer = new Paragraph("Thank you for your business!", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);
            
            document.close();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
        
        return outputStream.toByteArray();
    }
    
    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(valueCell);
    }
    
    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(66, 133, 244));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }
    
    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }
}
