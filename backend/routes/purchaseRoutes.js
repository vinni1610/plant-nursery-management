const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
// Ensure this path matches your models folder
const { Order, OrderItem, Plant } = require("../models"); 

/* ======================================================
   1. GET ALL PURCHASES (With Search & Date Filters)
====================================================== */
router.get("/", async (req, res) => {
  try {
    const { plant, name, from, to } = req.query;
    const where = { status: "Paid" };

    if (name) where.customerName = { [Op.like]: `%${name}%` };

    if (from && to) {
      const start = new Date(from); start.setHours(0, 0, 0, 0);
      const end = new Date(to); end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [{ model: Plant, as: "plant" }],
          where: plant ? { plantName: { [Op.like]: `%${plant}%` } } : undefined,
          required: !!plant,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

/* ======================================================
   2. DOWNLOAD PDF (Table Format)
====================================================== */
router.get("/pdf", async (req, res) => {
  try {
    const { plant, name, from, to } = req.query; // Get filters from the request

    const where = { status: "Paid" };
    if (name) where.customerName = { [Op.like]: `%${name}%` };
    
    if (from && to) {
      const start = new Date(from); start.setHours(0, 0, 0, 0);
      const end = new Date(to); end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    // 🔥 THE FILTER LOGIC:
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          // This 'where' filters the actual records based on the plant name
          where: plant ? { plantName: { [Op.like]: `%${plant}%` } } : undefined,
          required: !!plant, // If plant is searched, only show orders containing it
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // --- PDF Generation Logic ---
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=purchase_report.pdf`);
    doc.pipe(res);

    doc.fontSize(18).fillColor('#2e7d32').text("FILTERED PURCHASE REPORT", { align: "center" });
    if (plant) doc.fontSize(10).fillColor('#666').text(`Filter: Plant matching "${plant}"`, { align: "center" });
    doc.moveDown(2);

    const tableTop = 120;
    const col1 = 30; const col2 = 100; const col3 = 250; const col4 = 350;

    // Header row
    doc.rect(col1, tableTop - 5, 535, 20).fill('#f2f2f2').stroke();
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(10);
    doc.text("Date", col1 + 5, tableTop);
    doc.text("Customer", col2, tableTop);
    doc.text("Contact", col3, tableTop);
    doc.text("Items", col4, tableTop);

    let y = tableTop + 20;
    doc.font('Helvetica').fontSize(9);

    orders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN");
      const itemsStr = o.orderItems.map(it => `${it.plantName} (x${it.quantity})`).join(", ");
      
      const itemWidth = 210;
      const rowHeight = Math.max(doc.heightOfString(itemsStr, { width: itemWidth }) + 10, 25);

      if (y + rowHeight > 750) { doc.addPage(); y = 50; }

      doc.text(dateStr, col1 + 5, y + 5);
      doc.text(o.customerName, col2, y + 5);
      doc.text(o.customerContact || "-", col3, y + 5);
      doc.text(itemsStr, col4, y + 5, { width: itemWidth });

      doc.moveTo(col1, y + rowHeight).lineTo(565, y + rowHeight).strokeColor('#ccc').stroke();
      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    console.error("❌ PDF Filter Error:", err);
    res.status(500).send("Internal Server Error");
  }
});
// IMPORTANT: Export the router so server.js can use it
module.exports = router;