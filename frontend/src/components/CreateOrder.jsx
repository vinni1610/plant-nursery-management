import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateOrder() {
  const [plants, setPlants] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    customerAddress: "",
  });

  const navigate = useNavigate();

  // Fetch plant list
  useEffect(() => {
    API.get("/plants")
      .then((res) => setPlants(res.data))
      .catch(console.error);
  }, []);

  // Add row
  const addItem = () => {
    setItems([
      ...items,
      {
        plantId: "",
        plantName: "",
        rate: 0,
        quantity: 1,
        total: 0,
        search: "",
      },
    ]);
  };

  // Remove row
  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Select plant
  const onPlantSelect = (idx, plant) => {
    const next = [...items];
    next[idx] = {
      ...next[idx],
      plantId: plant.id,
      plantName: plant.plantName,
      rate: plant.price,
      quantity: 1,
      total: plant.price,
      search: plant.plantName,
    };
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

  // Download invoice
  const downloadInvoice = async (orderId) => {
    try {
      const res = await API.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      a.click();
      a.remove();
    } catch {
      alert("Invoice download failed");
    }
  };

  // Submit order
  const submit = async (e) => {
    e.preventDefault();

    if (items.length === 0) return alert("Add at least one plant");
    if (items.some((i) => !i.plantId))
      return alert("Select plant for all rows");

    const payload = {
      orderNo: `ORD-${Date.now()}`,
      customerName: form.customerName,
      customerContact: form.customerContact,
      customerAddress: form.customerAddress,
      items,
      subTotal,
      grandTotal,
      paidAmount: grandTotal,
      status: "Paid",
    };

    try {
      const res = await API.post("/orders", payload);
      await downloadInvoice(res.data.order.id);
      alert("Order created successfully");
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Order failed");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">Create Order</h2>

      <form onSubmit={submit} className="card p-4 shadow-sm">
        {/* Customer Info */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Customer Name *</label>
            <input
              className="form-control"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-4">
            <label>Contact</label>
            <input
              className="form-control"
              value={form.customerContact}
              onChange={(e) =>
                setForm({ ...form, customerContact: e.target.value })
              }
            />
          </div>

          <div className="col-md-4">
            <label>Address *</label>
            <input
              className="form-control"
              value={form.customerAddress}
              onChange={(e) =>
                setForm({ ...form, customerAddress: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Items */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <h5>Order Items</h5>
            <button type="button" className="btn btn-primary" onClick={addItem}>
              + Add Plant
            </button>
          </div>

          {items.map((it, idx) => {
            const filteredPlants = plants.filter((p) =>
              p.plantName.toLowerCase().includes(it.search.toLowerCase())
            );

            return (
              <div key={idx} className="row g-2 mb-2 align-items-center">
                <div className="col-md-4 position-relative">
                  <input
                    className="form-control"
                    placeholder="Search plant..."
                    value={it.search}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].search = e.target.value;
                      setItems(next);
                    }}
                  />

                  {it.search && !it.plantId && (
                    <div className="list-group position-absolute w-100 shadow z-3">
                      {filteredPlants.slice(0, 6).map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => onPlantSelect(idx, p)}
                        >
                          {p.plantName} (Stock: {p.stock})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-md-2">
                  <input
                    className="form-control"
                    readOnly
                    value={`₹ ${it.rate.toFixed(2)}`}
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
                    className="form-control"
                    readOnly
                    value={`₹ ${it.total.toFixed(2)}`}
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
            );
          })}
        </div>

        {/* Totals */}
        <div className="text-end border-top pt-3">
          <p>
            <strong>Subtotal:</strong> ₹ {subTotal.toFixed(2)}
          </p>
          <p className="fw-bold text-success fs-5">
            Grand Total: ₹ {grandTotal.toFixed(2)}
          </p>
        </div>

        <button className="btn btn-success mt-3" disabled={!items.length}>
          Place Order
        </button>
      </form>
    </div>
  );
}
