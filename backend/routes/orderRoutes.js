const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { Sequelize } = require("sequelize");   // ✅ FIX ADDED
const { Order, OrderItem } = require("../models/Order");
const Plant = require("../models/Plant");
const path = require("path");


// 🔧 Generate PDF invoice and stream to response
function generateInvoiceStream(order, items, res) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 30,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${order.orderNo}.pdf`
  );

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // ================= OUTER BORDER =================
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();

  // ================= HEADER (LOGO + TEXT SAME LINE) =================
  const logoPath = path.join(__dirname, "../assets/logo.png");

  if (require("fs").existsSync(logoPath)) {
    doc.image(logoPath, 40, 35, { width: 60 });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("VARASHREE FARM & NURSERY", 110, 35, { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      "Approved by Department of Horticulture, Government of Karnataka & Government of India\n" +
        "Spice Board & NHB Approved 3 Star Nursery\n" +
        "Sakrebyle, Gajanur Post, Shimoga Tq. & Dist, Karnataka\n" +
        "Mob: 7892326717, 9449742477, 7892023515 | Email: varashreenursery10@gmail.com",
      110,
      55
    , { align: "center" });

  // ================= CASH INVOICE BOX =================
  doc.rect(20, 115, pageWidth - 40, 25).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("CASH INVOICE", 0, 122, { align: "center" });

  // ================= CUSTOMER DETAILS =================
  let y = 155;
  doc.fontSize(10).font("Helvetica");
  doc.text(`Invoice No : ${order.orderNo}`, 40, y);
  doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 350, y);

  y += 15;
  doc.text(`Customer Name : ${order.customerName}`, 40, y);
  y += 15;
  doc.text(`Contact : ${order.customerContact || "-"}`, 40, y);
  y += 15;
  doc.text(`Address : ${order.customerAddress || "-"}`, 40, y);

  // ================= TABLE =================
  y += 25;

  const tableX = 40;
  const col = {
    no: 40,
    item: 80,
    qty: 300,
    rate: 360,
    total: 440,
  };

  const rowHeight = 22;

  // Table Header
  doc.rect(tableX, y, pageWidth - 80, rowHeight).stroke();
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("No", col.no, y + 6);
  doc.text("Particulars", col.item, y + 6);
  doc.text("Qty", col.qty, y + 6);
  doc.text("Rate", col.rate, y + 6);
  doc.text("Total", col.total, y + 6);

  // Vertical Lines
  doc.moveTo(col.item - 10, y).lineTo(col.item - 10, y + rowHeight).stroke();
  doc.moveTo(col.qty - 10, y).lineTo(col.qty - 10, y + rowHeight).stroke();
  doc.moveTo(col.rate - 10, y).lineTo(col.rate - 10, y + rowHeight).stroke();
  doc.moveTo(col.total - 10, y).lineTo(col.total - 10, y + rowHeight).stroke();

  y += rowHeight;

  // Table Rows
  doc.font("Helvetica").fontSize(9);
  items.forEach((it, i) => {
    doc.rect(tableX, y, pageWidth - 80, rowHeight).stroke();

    doc.text(i + 1, col.no, y + 6);
    doc.text(it.plantName, col.item, y + 6, { width: 200 });
    doc.text(it.quantity.toString(), col.qty, y + 6);
    doc.text(it.rate.toFixed(2), col.rate, y + 6);
    doc.text(it.total.toFixed(2), col.total, y + 6);

    // Vertical Lines
    doc.moveTo(col.item - 10, y).lineTo(col.item - 10, y + rowHeight).stroke();
    doc.moveTo(col.qty - 10, y).lineTo(col.qty - 10, y + rowHeight).stroke();
    doc.moveTo(col.rate - 10, y).lineTo(col.rate - 10, y + rowHeight).stroke();
    doc.moveTo(col.total - 10, y).lineTo(col.total - 10, y + rowHeight).stroke();

    y += rowHeight;
  });

  // ================= TOTALS =================
  y += 15;
doc.fontSize(10).font("Helvetica");
doc.text("Subtotal :", 340, y);
doc.text(order.subTotal.toFixed(2), 440, y);

if (order.discount && order.discount > 0) {
  y += 15;
  doc.text("Discount :", 340, y);
  doc.text(order.discount.toFixed(2), 440, y);
}

y += 15;
doc.font("Helvetica-Bold");
doc.text("Grand Total :", 340, y);
doc.text(order.grandTotal.toFixed(2), 440, y);


  // ================= CENTER TEXT BLOCK =================
  y += 30;
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .text(`Amount in words: ${convertToWords(order.grandTotal)} Rupees Only`, 0, y, {
      align: "center",
    });

  y += 15;
  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Note: Plants once sold cannot be replaced or exchanged.", 0, y, {
      align: "center",
    });

  y += 15;
  doc
    .font("Helvetica-Bold")
    .text("Thank you for your business!", 0, y, { align: "center" });

  // ================= SIGNATURE =================
  y += 40;
  doc.font("Helvetica").fontSize(9);
  doc.text("For VARASHREE FARM & NURSERY", 350, y);
  y += 25;
  doc.text("Authorized Signatory", 350, y);

  doc.end();
}



// Convert number to words (Indian Format)
function convertToWords(amount) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  function convertLessThanThousand(n) {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10];
    return ones[Math.floor(n / 100)] + " Hundred " + convertLessThanThousand(n % 100);
  }

  if (amount === 0) return "Zero";

  let num = Math.floor(amount);
  let result = "";

  if (num >= 10000000) {
    result += convertLessThanThousand(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertLessThanThousand(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertLessThanThousand(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  result += convertLessThanThousand(num);
  return result.trim();
}

// Retry handler
async function retryOnDeadlock(fn, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (error.original?.code === "ER_LOCK_DEADLOCK" && attempt < maxRetries) {
        console.log(`⚠️ Deadlock detected, retrying (${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        continue;
      }

      throw error;
    }
  }
  throw lastError;
}

// ========================
//    GET ALL ORDERS
// ========================
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: "orderItems" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ========================
//    GET ORDER BY ID
// ========================
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "orderItems" }],
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("❌ Fetch order error:", err);
    res.status(500).json({ error: "Error fetching order" });
  }
});

// ========================
//    CREATE NEW ORDER
// ========================
router.post("/", async (req, res) => {
  try {
    const result = await retryOnDeadlock(async () => {

      // 🔧 FIXED: isolationLevel reference
      const t = await Order.sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      });

      try {
        const payload = req.body;

        if (!payload.items || payload.items.length === 0) {
          throw new Error("Order must include at least one item");
        }

        const sortedItems = [...payload.items].sort((a, b) => a.plantId - b.plantId);

        const plantUpdates = [];
        for (const item of sortedItems) {
          const plant = await Plant.findByPk(item.plantId, {
            lock: t.LOCK.UPDATE,
            transaction: t,
          });

          if (!plant) throw new Error(`Plant not found: ${item.plantId}`);

          if (plant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${plant.plantName}. Available: ${plant.stock}, Requested: ${item.quantity}`
            );
          }

          plantUpdates.push({ plant, quantity: item.quantity, item });
        }

        const order = await Order.create(
          {
            orderNo: payload.orderNo,
            customerName: payload.customerName,
            customerContact: payload.customerContact,
            customerAddress: payload.customerAddress,
            subTotal: payload.subTotal,
            discount: payload.discount || 0,
            tax: payload.tax || 0,
            grandTotal: payload.grandTotal,
            paidAmount: payload.paidAmount || 0,
            status: payload.status || "pending",
          },
          { transaction: t }
        );

        for (const { plant, quantity, item } of plantUpdates) {
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

          await plant.decrement("stock", { by: quantity, transaction: t });
        }

        await t.commit();

        return await Order.findByPk(order.id, {
          include: [{ model: OrderItem, as: "orderItems" }],
        });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    });

    res.status(201).json({
      message: "Order created successfully",
      order: result,
      invoiceDownloadUrl: `/api/orders/${result.id}/invoice`,
    });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(400).json({
      error: err.message || "Failed to create order",
    });
  }
});

// ========================
//    DOWNLOAD INVOICE
// ========================
router.get("/:id/invoice", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "orderItems" }],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    generateInvoiceStream(order, order.orderItems, res);
  } catch (err) {
    console.error("❌ Invoice generation error:", err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

// ========================
//    DELETE ORDER
// ========================
router.delete("/:id", async (req, res) => {
  try {
    await retryOnDeadlock(async () => {

      // 🔧 FIXED HERE TOO
      const t = await Order.sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      });

      try {
        const order = await Order.findByPk(req.params.id, {
          include: [{ model: OrderItem, as: "orderItems" }],
          transaction: t,
        });

        if (!order) {
          throw new Error("Order not found");
        }

        const sortedItems = [...order.orderItems].sort((a, b) => a.plantId - b.plantId);

        for (const item of sortedItems) {
          const plant = await Plant.findByPk(item.plantId, {
            lock: t.LOCK.UPDATE,
            transaction: t,
          });

          if (plant) {
            await plant.increment("stock", { by: item.quantity, transaction: t });
          }
        }

        await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });
        await Order.destroy({ where: { id: order.id }, transaction: t });

        await t.commit();
      } catch (error) {
        await t.rollback();
        throw error;
      }
    });

    res.json({ message: "Order deleted successfully and stock restored" });
  } catch (err) {
    console.error("❌ Delete order error:", err);
    res.status(400).json({
      error: err.message || "Failed to delete order",
    });
  }
});

module.exports = router;
