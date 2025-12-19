const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { Sequelize } = require("sequelize");   // ✅ FIX ADDED
const { Order, OrderItem } = require("../models/Order");
const Plant = require("../models/Plant");


// 🔧 Generate PDF invoice and stream to response
function generateInvoiceStream(order, items, res) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${order.orderNo}.pdf`
  );

  doc.pipe(res);

  // ===== HEADER =====
  doc.font("Helvetica-Bold").fontSize(18)
    .text("VARASHREE FARM & NURSERY", { align: "center" });

  doc.fontSize(10).font("Helvetica")
    .text("Approved by Department of Horticulture, Government of Karnataka & Government of India",
      { align: "center" })
    .text("Spice Board & NHB Approved 3 Star Nursery\nSakebyle, Gajanur Post, Shimoga Tq. & Dist, Karnataka",
      { align: "center" })
    .text("Mob: 7892326717, 9449742477, 7892023515 | Email: varashreenursery10@gmail.com",
      { align: "center" })
    .moveDown(0.5);

  doc.font("Helvetica-Bold").fontSize(12)
    .text("CASH INVOICE", { align: "center" });
  doc.moveDown();

  // ===== CUSTOMER INFO =====
  doc.font("Helvetica").fontSize(11)
    .text(`Invoice No: ${order.orderNo}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`)
    .text(`Customer Name: ${order.customerName}`)
    .text(`Contact: ${order.customerContact || "—"}`)
    .text(`Address: ${order.customerAddress || "—"}`)
    .moveDown(0.5);

  // ===== TABLE HEADER =====
  const tableTop = doc.y + 10;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("No", 50, tableTop);
  doc.text("Particulars", 100, tableTop);
  doc.text("Qty", 300, tableTop);
  doc.text("Rate", 370, tableTop);
  doc.text("Total", 450, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();

  // ===== TABLE CONTENT =====
  let y = tableTop + 25;
  doc.font("Helvetica").fontSize(9);
  items.forEach((item, i) => {
    doc.text(i + 1, 50, y);
    doc.text(item.plantName, 100, y, { width: 180 });
    doc.text(item.quantity.toString(), 300, y);
    doc.text(` ${parseFloat(item.rate).toFixed(2)}`, 370, y);
    doc.text(`${parseFloat(item.total).toFixed(2)}`, 450, y);
    y += 20;
  });

  // ===== TOTALS =====
  doc.moveTo(50, y).lineTo(520, y).stroke();
  y += 15;
  doc.font("Helvetica").fontSize(10);
  doc.text(`Subtotal:`, 370, y);
  doc.text(` ${parseFloat(order.subTotal).toFixed(2)}`, 450, y);

  if (order.discount && order.discount > 0) {
    y += 15;
    doc.text(`Discount:`, 370, y);
    doc.text(` ${parseFloat(order.discount).toFixed(2)}`, 450, y);
  }

  if (order.tax && order.tax > 0) {
    y += 15;
    doc.text(`Tax:`, 370, y);
      doc.text(` ${parseFloat(order.tax).toFixed(2)}`, 450, y);
  }

  y += 15;
  doc.font("Helvetica-Bold").fontSize(11);
  doc.text(`Grand Total:`, 370, y);
  doc.text(`${parseFloat(order.grandTotal).toFixed(2)}`, 450, y);

  if (order.paidAmount) {
    y += 15;
    doc.font("Helvetica").fontSize(10);
    doc.text(`Paid Amount:`, 370, y);
    doc.text(`${parseFloat(order.grandTotal).toFixed(2)}`, 450, y);

    const balance = order.grandTotal - order.paidAmount;
    if (balance > 0) {
      y += 15;
      doc.font("Helvetica-Bold");
      doc.text(`Balance:`, 370, y);
      doc.text(`${balance.toFixed(2)}`, 450, y);
    }
  }

  y += 30;

  doc.font("Helvetica-Oblique").fontSize(9)
    .text(`Amount in words: ${convertToWords(order.grandTotal)} Rupees Only`, 50, y);

  y += 30;

  doc.font("Helvetica").fontSize(8)
    .text("Note: Plants once sold cannot be replaced or exchanged.", { align: "center" });

  y += 20;

  doc.font("Helvetica-Bold").fontSize(9)
    .text("Thank you for your business!", { align: "center" });

  y += 30;

  doc.font("Helvetica").fontSize(8)
    .text("For VARASHREE FARM & NURSERY", 400, y);

  y += 30;
  doc.text("Authorized Signatory", 400, y);

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
