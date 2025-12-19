const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { Estimation, EstimationItem } = require("../models/Estimation");

/**
 * 🔠 Helper: Convert Number to Words (Indian Format)
 */
function convertToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'Amount too high';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + " Rupees Only";
}

/**
 * 🔧 Professional PDF Generator Function
 */
function generateEstimationPDF(estimation, items, res) {
  const doc = new PDFDocument({ size: "A4", margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=estimate_${estimation.estimateNo}.pdf`);

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // ================= OUTER BORDER =================
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();

  // ================= HEADER =================
  const logoPath = path.join(__dirname, "../assets/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, 35, { width: 60 });
  }

  doc.font("Helvetica-Bold").fontSize(16)
    .text("VARASHREE FARM & NURSERY", 110, 35, { align: "center" });

  doc.font("Helvetica").fontSize(9)
    .text(
      "Approved by Department of Horticulture, Government of Karnataka & Government of India\n" +
      "Spice Board & NHB Approved 3 Star Nursery\n" +
      "Sakrebbyle, Gajanur Post, Shimoga Tq. & Dist, Karnataka\n" +
      "Mob: 7892326717, 9449742477, 7892023515 | Email: varashreenursery10@gmail.com",
      110, 55, { align: "center" }
    );

  // ================= BOX LABEL =================
  doc.rect(20, 115, pageWidth - 40, 25).stroke();
  doc.font("Helvetica-Bold").fontSize(12).text("ESTIMATE", 0, 122, { align: "center" });

  // ================= CUSTOMER DETAILS =================
  let y = 155;
  doc.fontSize(10).font("Helvetica");
  doc.text(`Estimate No : ${estimation.estimateNo}`, 40, y);
  doc.text(`Date : ${new Date(estimation.createdAt).toLocaleDateString("en-IN")}`, 350, y);

  y += 15;
  doc.text(`Customer Name : ${estimation.customerName}`, 40, y);
  y += 15;
  doc.text(`Contact : ${estimation.customerContact || "-"}`, 40, y);
  y += 15;
  doc.text(`Address : ${estimation.customerAddress || "-"}`, 40, y);

  // ================= TABLE =================
  y += 25;
  const tableX = 40;
  const col = { no: 40, item: 80, qty: 300, rate: 360, total: 440 };
  const rowHeight = 22;

  // Header
  doc.rect(tableX, y, pageWidth - 80, rowHeight).stroke();
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("No", col.no, y + 6);
  doc.text("Particulars", col.item, y + 6);
  doc.text("Qty", col.qty, y + 6);
  doc.text("Rate", col.rate, y + 6);
  doc.text("Total", col.total, y + 6);

  // Header Vertical Lines
  [col.item, col.qty, col.rate, col.total].forEach(x => {
    doc.moveTo(x - 10, y).lineTo(x - 10, y + rowHeight).stroke();
  });

  y += rowHeight;

  // Rows
  doc.font("Helvetica").fontSize(9);
  items.forEach((it, i) => {
    doc.rect(tableX, y, pageWidth - 80, rowHeight).stroke();
    doc.text(i + 1, col.no, y + 6);
    doc.text(it.plantName, col.item, y + 6, { width: 200 });
    doc.text(it.quantity.toString(), col.qty, y + 6);
    doc.text(it.rate.toFixed(2), col.rate, y + 6);
    doc.text(it.total.toFixed(2), col.total, y + 6);

    // Vertical Lines
    [col.item, col.qty, col.rate, col.total].forEach(x => {
      doc.moveTo(x - 10, y).lineTo(x - 10, y + rowHeight).stroke();
    });
    y += rowHeight;
  });

  // ================= GRAND TOTAL =================
  y += 15;
  doc.font("Helvetica-Bold").fontSize(11);
  doc.text("Grand Total :", 340, y);
  doc.text(`Rs. ${Number(estimation.grandTotal).toFixed(2)}`, 440, y);

  // ================= FOOTER =================
  y += 40;
  doc.font("Helvetica-Oblique").fontSize(9)
    .text(`Amount in words: ${convertToWords(Math.round(estimation.grandTotal))}`, 0, y, { align: "center" });

  y += 30;
  doc.font("Helvetica").text("For VARASHREE FARM & NURSERY", 350, y);
  y += 40;
  doc.text("Authorized Signatory", 350, y);

  doc.end();
}

// =======================
// CREATE ESTIMATION
// =======================
router.post("/", async (req, res) => {
  try {
    const { estimateNo, customerName, customerContact, customerAddress, items, grandTotal } = req.body;

    const estimation = await Estimation.create({
      estimateNo,
      customerName,
      customerContact,
      customerAddress,
      totalItems: items.length,
      grandTotal,
      // subTotal is removed here based on your feedback
    });

    for (const item of items) {
      await EstimationItem.create({
        estimationId: estimation.id,
        plantName: item.plantName,
        rate: item.rate,
        quantity: item.quantity,
        total: item.total,
      });
    }

    res.json({ estimation });
  } catch (err) {
    console.error("❌ Estimation failed:", err);
    res.status(500).json({ error: "Estimation failed" });
  }
});

// =======================
// DOWNLOAD PDF
// =======================
router.get("/:id/pdf", async (req, res) => {
  try {
    const estimation = await Estimation.findByPk(req.params.id, {
      include: [{ model: EstimationItem, as: "items" }],
    });

    if (!estimation) return res.status(404).json({ error: "Estimation not found" });

    generateEstimationPDF(estimation, estimation.items, res);
  } catch (err) {
    console.error("❌ PDF Generation failed:", err);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;