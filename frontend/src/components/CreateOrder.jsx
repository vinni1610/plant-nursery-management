import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateOrder() {
  const [plants, setPlants] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    customerName: '',
    customerContact: '',
    customerAddress: '',
  });

  const navigate = useNavigate();

  // Fetch plant list
  useEffect(() => {
    API.get('/plants')
      .then((res) => setPlants(res.data))
      .catch(console.error);
  }, []);

  // Add row
  const addItem = () => {
    setItems([...items, { plantId: '', plantName: '', rate: '', quantity: 1, total: 0 }]);
  };

  // Remove row
  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // When plant selected
  const onPlantChange = (idx, plantId) => {
    const plant = plants.find((p) => p.id === parseInt(plantId));
    const next = [...items];

    if (!plant) {
      next[idx] = { plantId: '', plantName: '', rate: '', quantity: 1, total: 0 };
    } else {
      next[idx].plantId = plant.id;
      next[idx].plantName = plant.plantName;
      next[idx].rate = plant.price;
      next[idx].quantity = 1;
      next[idx].total = plant.price;
    }

    setItems(next);
  };

  // Update quantity
  const onQtyChange = (idx, qty) => {
    const next = [...items];
    next[idx].quantity = Number(qty);
    next[idx].total = next[idx].rate * next[idx].quantity;
    setItems(next);
  };

  // Totals
  const subTotal = items.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = subTotal;

  // ---------------------------------------------
  // ✅ Function to DOWNLOAD the Invoice PDF
  // ---------------------------------------------
  const downloadInvoice = async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${orderId}.pdf`;
      link.click();
      link.remove();

    } catch (err) {
      console.error("❌ Invoice download failed:", err);
      alert("Failed to download invoice");
    }
  };

  // Submit order
  const submit = async (e) => {
    e.preventDefault();

    if (items.length === 0) return alert('Add at least one plant');
    if (items.some((i) => !i.plantId)) return alert('Please select all plants');

    const payload = {
      orderNo: `ORD-${Date.now()}`,
      customerName: form.customerName,
      customerContact: form.customerContact,
      customerAddress: form.customerAddress,
      items,
      subTotal,
      grandTotal,
      paidAmount: grandTotal,
      status: 'Paid',
    };

    try {
      const res = await API.post('/orders', payload);

      const orderId = res?.data?.order?.id;
      const invoiceUrl = res?.data?.invoiceDownloadUrl;

      if (orderId && invoiceUrl) {
        // Download the invoice via blob
        await downloadInvoice(orderId);
      }

      alert("Order created successfully!");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("❌ Error: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-success">Create Order</h2>

      <form onSubmit={submit} className="card p-4 shadow-sm">
        {/* Customer Info */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Customer Name *</label>
            <input type="text" className="form-control"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Customer Contact</label>
            <input type="text" className="form-control"
              value={form.customerContact}
              onChange={(e) => setForm({ ...form, customerContact: e.target.value })}
              />
          </div>

          <div className="col-md-4">
            <label className="form-label">Customer Address *</label>
            <input type="text" className="form-control"
              value={form.customerAddress}
              onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
              required />
          </div>
        </div>

        {/* Items section */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Order Items</h5>
            <button type="button" className="btn btn-primary" onClick={addItem}>
              + Add Plant
            </button>
          </div>

          {items.length > 0 && (
            <div className="row g-2 fw-bold text-muted mb-2">
              <div className="col-md-4">Plant</div>
              <div className="col-md-2">Rate</div>
              <div className="col-md-2">Qty</div>
              <div className="col-md-2">Total</div>
              <div className="col-md-2">Action</div>
            </div>
          )}

          {items.map((it, idx) => (
            <div key={idx} className="row g-2 mb-2 align-items-center">
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={it.plantId}
                  onChange={(e) => onPlantChange(idx, e.target.value)}
                  required>
                  <option value="">-- Select --</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plantName} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <input className="form-control" readOnly value={it.rate || ""} />
              </div>

              <div className="col-md-2">
                <input type="number" className="form-control"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => onQtyChange(idx, e.target.value)} />
              </div>

              <div className="col-md-2">
                <input className="form-control" readOnly value={it.total.toFixed(2)} />
              </div>

              <div className="col-md-2">
                <button type="button" className="btn btn-outline-danger btn-sm"
                  onClick={() => removeItem(idx)}>✕ Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="text-end border-top pt-3">
          <p><strong>Subtotal:</strong> ₹ {subTotal.toFixed(2)}</p>
          <p className="fs-5 fw-bold text-success">
            Grand Total: ₹ {grandTotal.toFixed(2)}
          </p>
        </div>

        <button className="btn btn-success mt-3" disabled={items.length === 0}>
          Place Order
        </button>
      </form>
    </div>
  );
}
