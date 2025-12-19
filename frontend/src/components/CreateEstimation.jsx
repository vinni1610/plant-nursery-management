import React, { useEffect, useState } from "react";
import API from "../api";

export default function CreateEstimation() {
  const [plants, setPlants] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    customerAddress: "",
  });

  // 🔹 Load plants
  useEffect(() => {
    API.get("/plants")
      .then((res) => setPlants(res.data))
      .catch(console.error);
  }, []);

  // ➕ Add row
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

  // ❌ Remove row
  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // 🌱 Select plant from search
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

  // 🔢 Quantity change
  const onQtyChange = (idx, qty) => {
    const next = [...items];
    next[idx].quantity = Number(qty);
    next[idx].total = next[idx].rate * next[idx].quantity;
    setItems(next);
  };

  // 💰 Totals
  const subTotal = items.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = subTotal;

  // 📄 Submit estimation & download PDF
  const submit = async (e) => {
    e.preventDefault();

    if (!items.length) return alert("Add at least one item");

    try {
      const res = await API.post("/estimations", {
        estimateNo: `EST-${Date.now()}`,
        customerName: form.customerName,
        customerContact: form.customerContact,
        customerAddress: form.customerAddress,
        items,
        subTotal,
        grandTotal,
      });

      const estimationId = res.data.estimation.id;

      // ⬇️ Download PDF
      const pdfRes = await API.get(`/estimations/${estimationId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([pdfRes.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `estimation_${estimationId}.pdf`;
      link.click();

    } catch (err) {
      console.error(err);
      alert("❌ Estimation failed");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">Create Estimation</h2>

      <form onSubmit={submit} className="card p-4 shadow-sm">

        {/* 👤 Customer Info */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Customer Name *</label>
            <input
              className="form-control"
              required
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
            />
          </div>

          <div className="col-md-4">
            <label>Mobile No</label>
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
              required
              value={form.customerAddress}
              onChange={(e) =>
                setForm({ ...form, customerAddress: e.target.value })
              }
            />
          </div>
        </div>

        {/* 🌿 Estimation Items */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <h5>Estimation Items</h5>
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
                {/* 🔍 Search */}
                <div className="col-md-4 position-relative">
                  <input
                    className="form-control"
                    placeholder="Search plant..."
                    value={it.search}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].search = e.target.value;
                      next[idx].plantId = "";
                      setItems(next);
                    }}
                  />

                  {it.search && !it.plantId && (
                    <div className="list-group position-absolute w-100 shadow z-3">
                      {filteredPlants.slice(0, 6).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => onPlantSelect(idx, p)}
                        >
                          {p.plantName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 💲 Rate */}
                <div className="col-md-2">
                  <input
                    className="form-control"
                    readOnly
                    value={it.rate ? `₹ ${it.rate.toFixed(2)}` : ""}
                  />
                </div>

                {/* 🔢 Qty */}
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => onQtyChange(idx, e.target.value)}
                  />
                </div>

                {/* 💰 Total */}
                <div className="col-md-2">
                  <input
                    className="form-control"
                    readOnly
                    value={it.total ? `₹ ${it.total.toFixed(2)}` : ""}
                  />
                </div>

                {/* ❌ Remove */}
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

        {/* 💰 Totals */}
        <div className="text-end border-top pt-3">
          <p><strong>Total Items:</strong> {items.length}</p>
          <p className="fw-bold text-success fs-5">
            Estimation Cost: ₹ {grandTotal.toFixed(2)}
          </p>
        </div>

        <button className="btn btn-success mt-3" disabled={!items.length}>
          Create Estimation
        </button>
      </form>
    </div>
  );
}
