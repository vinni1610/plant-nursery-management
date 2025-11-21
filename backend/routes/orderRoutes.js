const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { Order, OrderItem } = require("../models/Order");
const Plant = require("../models/Plant");

// 🔧 Generate PDF invoice
function generateInvoice(order, items) {
  const invoicesDir = path.join(__dirname, "../invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const filePath = path.join(invoicesDir, `invoice_${order.orderNo}.pdf`);
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  // ===== HEADER =====
  doc.font("Helvetica-Bold").fontSize(18).text("VARASHREE FARM & NURSERY", { align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Approved by Department of Horticulture, Government of Karnataka & Government of India", { align: "center" })
    .text("Spice Board & NHB Approved 3 Star Nursery\nSakebyle, Gajanur Post, Shimoga Tq. & Dist, Karnataka", { align: "center" })
    .text("Mob: 7892326717, 9449742477, 7892023515 | Email: varashreenursery10@gmail.com", { align: "center" })
    .moveDown(0.5);
  doc.font("Helvetica-Bold").text("CASH INVOICE", { align: "center" });
  doc.moveDown();

  // ===== CUSTOMER INFO =====
  doc.font("Helvetica").fontSize(12)
    .text(`Invoice No: ${order.orderNo}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    .text(`Customer Name: ${order.customerName}`)
    .text(`Contact: ${order.customerContact}`)
    .text(`Address: ${order.customerAddress || '—'}`)

    .moveDown(0.5);

  // ===== TABLE HEADER =====
  const tableTop = doc.y + 10;
  doc.font("Helvetica-Bold");
  doc.text("No", 50, tableTop);
  doc.text("Particulars", 100, tableTop);
  doc.text("Nos", 300, tableTop);
  doc.text("Rate", 370, tableTop);
  doc.text("Total", 450, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();

  // ===== TABLE CONTENT =====
  let y = tableTop + 25;
  doc.font("Helvetica");
  items.forEach((item, i) => {
    doc.text(i + 1, 50, y);
    doc.text(item.plantName, 100, y);
    doc.text(item.quantity.toString(), 300, y);
    doc.text(`₹${item.rate.toFixed(2)}`, 370, y);
    doc.text(`₹${item.total.toFixed(2)}`, 450, y);
    y += 20;
  });

  // ===== TOTALS =====
  doc.moveTo(50, y).lineTo(520, y).stroke();
  y += 10;
  doc.font("Helvetica-Bold");
  doc.text(`Subtotal: ₹${order.subTotal.toFixed(2)}`, 370, y);
  y += 15;
  
  doc.text(`Grand Total: ₹${order.grandTotal.toFixed(2)}`, 370, y);
  y += 25;

  // ===== FOOTER =====
  doc.font("Helvetica-Oblique").fontSize(10);
  doc.text("In words: ____________________________", 50, y);
  y += 30;
  doc.font("Helvetica").fontSize(9)
    .text("Note: Plants once sold cannot be replaced or exchanged.", 50, y, { align: "center" });
  doc.end();

  return filePath;
}

// ✅ Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: "orderItems" }], // ✅ fixed alias
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "orderItems" }], // ✅ fixed alias
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Error fetching order" });
  }
});

// ✅ Create new order + generate invoice
// ✅ Create new order + generate invoice
router.post("/", async (req, res) => {
  const t = await Order.sequelize.transaction();
  try {
    const payload = req.body;

    if (!payload.items || payload.items.length === 0) {
      return res.status(400).json({ error: "Order must include at least one item" });
    }

    // Stock check
    for (const item of payload.items) {
      const plant = await Plant.findByPk(item.plantId);
      if (!plant) throw new Error(`Plant not found: ${item.plantId}`);
      if (plant.stock < item.quantity)
        throw new Error(`Insufficient stock for ${plant.plantName}`);
    }

    // Create order (NO TAX)
    const order = await Order.create(
      {
        orderNo: payload.orderNo,
        customerName: payload.customerName,
        customerContact: payload.customerContact,
        customerAddress: payload.customerAddress,   // <-- NEW FIELD
        subTotal: payload.subTotal,
        tax: 0,                                     // <-- REMOVED TAX
        grandTotal: payload.grandTotal,
    paidAmount: payload.paidAmount,
    status: payload.status,
      },
      { transaction: t }
    );

    // Create order items
    for (const item of payload.items) {
      const plant = await Plant.findByPk(item.plantId);

      await OrderItem.create(
        {
          orderId: order.id,
          plantId: plant.id,
          plantName: plant.plantName,
          rate: item.rate,
          quantity: item.quantity,
          total: item.total,
        },
        { transaction: t }
      );

      // Reduce stock
      await plant.update(
        { stock: plant.stock - item.quantity },
        { transaction: t }
      );
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "orderItems" }],
    });

    generateInvoice(fullOrder, fullOrder.orderItems);

    res.status(201).json({
      message: "Order created successfully",
      order: fullOrder,
      invoiceUrl: `/orders/invoice/${order.orderNo}`,
    });

  } catch (err) {
    if (t && !t.finished) await t.rollback();
    console.error("❌ Order creation error:", err);
    res.status(400).json({ error: err.message });
  }
});


// ✅ Download invoice
router.get("/invoice/:orderNo", (req, res) => {
  const filePath = path.join(__dirname, `../invoices/invoice_${req.params.orderNo}.pdf`);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "Invoice not found" });
  }
});

// ✅ Delete order
router.delete("/:id", async (req, res) => {
  const t = await Order.sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "orderItems" }], // ✅ fixed alias
    });
    if (!order) return res.status(404).json({ error: "Order not found" });

    for (const item of order.orderItems) {
      const plant = await Plant.findOne({ where: { plantName: item.plantName } });
      if (plant) {
        await plant.update({ stock: plant.stock + item.quantity }, { transaction: t });
      }
    }

    await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });
    await Order.destroy({ where: { id: order.id }, transaction: t });

    await t.commit();
    res.json({ message: "Order deleted successfully and stock restored" });
  } catch (err) {
    if (!t.finished) await t.rollback();
    res.status(400).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
