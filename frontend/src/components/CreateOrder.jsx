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

  // Fetch all plants
  useEffect(() => {
    API.get('/plants')
      .then((res) => setPlants(res.data))
      .catch(console.error);
  }, []);

  // Add an item row
  const addItem = () => {
    setItems([...items, { plantId: '', plantName: '', rate: '', quantity: 1, total: 0 }]);
  };

  // Remove an item row
  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
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

  // Qty update
  const onQtyChange = (idx, qty) => {
    const next = [...items];
    next[idx].quantity = Number(qty);
    next[idx].total = next[idx].rate * next[idx].quantity;
    setItems(next);
  };

  // Totals (NO TAX)
  const subTotal = items.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = subTotal;

  // Submit order
  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert('Please add at least one plant.');

    // Check if all plants are selected
    const hasEmptyPlant = items.some((it) => !it.plantId);
    if (hasEmptyPlant) return alert('Please select a plant for all items.');

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

      if (res.data?.invoiceUrl) {
        const invoiceUrl = `${API.defaults.baseURL}${res.data.invoiceUrl}`;
        window.open(invoiceUrl, '_blank');
      }

      alert('✅ Order created successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('❌ Error: ' + (err?.response?.data?.error || err.message));
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
            <input
              type="text"
              className="form-control"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Customer Contact</label>
            <input
              type="text"
              className="form-control"
              value={form.customerContact}
              onChange={(e) => setForm({ ...form, customerContact: e.target.value })}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Customer Address *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter customer address"
              value={form.customerAddress}
              onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Order Items</h5>
            <button type="button" className="btn btn-primary" onClick={addItem}>
              + Add Plant
            </button>
          </div>

          {/* Column Headers */}
          {items.length > 0 && (
            <div className="row g-2 mb-2 fw-bold text-muted">
              <div className="col-md-4">Plant</div>
              <div className="col-md-2">Rate (₹)</div>
              <div className="col-md-2">Quantity</div>
              <div className="col-md-2">Total (₹)</div>
              <div className="col-md-2">Action</div>
            </div>
          )}

          {items.map((it, idx) => (
            <div key={idx} className="row g-2 mb-2 align-items-center">
              
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={it.plantId || ''}
                  onChange={(e) => onPlantChange(idx, e.target.value)}
                  required
                >
                  <option value="">-- Select Plant --</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plantName} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <input 
                  type="text" 
                  className="form-control" 
                  readOnly 
                  value={it.rate !== '' ? it.rate : ''} 
                  placeholder="Rate"
                />
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => onQtyChange(idx, e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  value={it.total > 0 ? it.total.toFixed(2) : ''}
                  placeholder="Total"
                  readOnly
                />
              </div>

              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeItem(idx)}
                >
                  ✕ Remove
                </button>
              </div>

            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center text-muted py-4 border rounded">
              <p className="mb-0">No items added. Click "+ Add Plant" to start.</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="text-end border-top pt-3">
          <p className="mb-1"><strong>Sub Total:</strong> ₹ {subTotal.toFixed(2)}</p>
          <p className="fs-5 fw-bold text-success">
            Grand Total: ₹ {grandTotal.toFixed(2)}
          </p>
        </div>

        <button type="submit" className="btn btn-success mt-3" disabled={items.length === 0}>
          Place Order
        </button>
      </form>
    </div>
  );
}