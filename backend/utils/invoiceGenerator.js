const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoice(order) {
  const doc = new PDFDocument({ margin: 40 });
  const filePath = path.join(__dirname, `../invoices/invoice_${order.orderNo}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("VARASHREE FARM & NURSERY", { align: "center" });
  
  doc
    .fontSize(10)
    .text(
      "Department of Horticulture Govt. of Karnataka & Govt. of India Approved\n" +
      "Spice Board & NHB Approved 3 Star Nursery\n" +
      "Sakebyle, Gajanur Post, Shimoga Tq. & Dist, Karnataka\n" +
      "Mob: 7892326717, 9449742477, 7892023515\n" +
      "Email: varashreenursery10@gmail.com | www.varashreenursery.com",
      { align: "center" }
    );

  doc.moveDown();

  // Invoice Info
  doc.fontSize(12).text(`CASH INVOICE`, { align: "center" });
  doc.moveDown(0.5);
  doc.text(`Invoice No: ${order.orderNo}`);
  doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`);
  doc.text(`Customer: ${order.customerName}`);
  doc.text(`Address: ${order.customerContact}`);
  doc.moveDown();

  // Table Header
  doc.font("Helvetica-Bold");
  doc.text("No", 50, doc.y, { width: 40 });
  doc.text("Particulars", 90, doc.y, { width: 200 });
  doc.text("Nos", 290, doc.y, { width: 50 });
  doc.text("Rate", 340, doc.y, { width: 80 });
  doc.text("Total", 420, doc.y, { width: 100, align: "right" });
  doc.moveDown(0.5);
  doc.font("Helvetica");
  doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke();

  // Items
  order.items.forEach((item, i) => {
    doc.text(i + 1, 50, doc.y + 5, { width: 40 });
    doc.text(item.plantName, 90, doc.y, { width: 200 });
    doc.text(item.quantity, 290, doc.y, { width: 50 });
    doc.text(item.rate.toFixed(2), 340, doc.y, { width: 80 });
    doc.text(item.total.toFixed(2), 420, doc.y, { width: 100, align: "right" });
    doc.moveDown();
  });

  doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke();
  doc.moveDown();

  // Totals
  doc.text(`Subtotal: ₹${order.subTotal.toFixed(2)}`, { align: "right" });
  doc.text(`Tax: ₹${order.tax.toFixed(2)}`, { align: "right" });
  doc.font("Helvetica-Bold").text(`Grand Total: ₹${order.grandTotal.toFixed(2)}`, { align: "right" });
  doc.moveDown();

  // Footer
  doc.font("Helvetica-Oblique").fontSize(9).text("In words: ____________________________");
  doc.moveDown(1);
  doc.text("Note: Plants once sold cannot be replaced or exchanged.", { align: "center" });

  doc.end();

  return filePath;
}

module.exports = generateInvoice;
