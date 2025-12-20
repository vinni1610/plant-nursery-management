import React, { useEffect, useState } from "react";
import API from "../api";

export default function CreateEstimation() {
  const [plants, setPlants] = useState([]);
  const [items, setItems] = useState([]);
  const [estimations, setEstimations] = useState([]);

  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    customerAddress: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    API.get("/plants").then(res => setPlants(res.data));
    loadEstimations();
  }, []);

  const loadEstimations = async () => {
    const res = await API.get("/estimations");
    setEstimations(res.data);
  };

  /* ================= ITEMS ================= */
  const addItem = () => {
    setItems([
      ...items,
      {
        plantName: "",
        rate: 0,
        quantity: 1,
        total: 0,
        search: "",
        selected: false,
      },
    ]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const selectPlant = (idx, plant) => {
    const next = [...items];
    next[idx] = {
      ...next[idx],
      plantName: plant.plantName,
      rate: plant.price,
      quantity: 1,
      total: plant.price,
      search: plant.plantName,
      selected: true, // ✅ closes dropdown
    };
    setItems(next);
  };

  const onQtyChange = (idx, qty) => {
    const next = [...items];
    next[idx].quantity = Number(qty);
    next[idx].total = next[idx].rate * next[idx].quantity;
    setItems(next);
  };

  const subTotal = items.reduce((s, i) => s + i.total, 0);

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();
    if (!items.length) return alert("Add at least one plant");

    const res = await API.post("/estimations", {
      estimateNo: `EST-${Date.now()}`,
      ...form,
      items,
      grandTotal: subTotal,
    });

    const id = res.data.estimation.id;
    const pdf = await API.get(`/estimations/${id}/pdf`, {
      responseType: "blob",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([pdf.data]));
    link.download = `estimation_${id}.pdf`;
    link.click();

    setForm({ customerName: "", customerContact: "", customerAddress: "" });
    setItems([]);
    loadEstimations();
  };

  return (
    <div className="container mt-4">

      {/* ================= CREATE ================= */}
      <h3 className="text-success mb-3">Create Estimation</h3>

      <form onSubmit={submit} className="card p-4 shadow-sm mb-5">
        <div className="row mb-3">
          <div className="col-md-4">
            <input className="form-control" placeholder="Customer Name"
              value={form.customerName}
              onChange={e => setForm({ ...form, customerName: e.target.value })}
              required />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Mobile"
              value={form.customerContact}
              onChange={e => setForm({ ...form, customerContact: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Address"
              value={form.customerAddress}
              onChange={e => setForm({ ...form, customerAddress: e.target.value })}
              required />
          </div>
        </div>

        {/* ================= ITEMS ================= */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <h5>Estimation Items</h5>
            <button type="button" className="btn btn-primary" onClick={addItem}>
              + Add Plant
            </button>
          </div>

          {items.map((it, idx) => {
            const filteredPlants = plants.filter(p =>
              p.plantName.toLowerCase().includes(it.search.toLowerCase())
            );

            return (
              <div key={idx} className="row g-2 mb-2 align-items-center">
                {/* SEARCH */}
                <div className="col-md-4 position-relative">
                  <input
                    className="form-control"
                    placeholder="Search plant..."
                    value={it.search}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].search = e.target.value;
                      next[idx].selected = false;
                      setItems(next);
                    }}
                  />

                  {/* ✅ DROPDOWN */}
                  {it.search && !it.selected && (
                    <div className="list-group position-absolute w-100 shadow z-3">
                      {filteredPlants.slice(0, 6).map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => selectPlant(idx, p)}
                        >
                          {p.plantName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RATE */}
                <div className="col-md-2">
                  <input className="form-control" readOnly value={`₹ ${it.rate}`} />
                </div>

                {/* QTY */}
                <div className="col-md-2">
                  <input type="number" className="form-control"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => onQtyChange(idx, e.target.value)} />
                </div>

                {/* TOTAL */}
                <div className="col-md-2">
                  <input className="form-control" readOnly value={`₹ ${it.total}`} />
                </div>

                {/* REMOVE */}
                <div className="col-md-2">
                  <button type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeItem(idx)}>
                    ✕ Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-end border-top pt-3">
          <strong>Estimated Cost:  {subTotal.toFixed(2)}</strong>
        </div>

        <button className="btn btn-success mt-3" disabled={!items.length}>
          Create Estimation
        </button>
      </form>

      {/* ================= DASHBOARD ================= */}
      <h4 className="text-success mb-3">Estimations</h4>

      <div className="card shadow-sm table-responsive">
        <table className="table table-bordered">
          <thead className="table-success">
            <tr>
              <th>Sl.No</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Items</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {estimations.map((e, i) => (
              <tr key={e.id}>
                <td>{i + 1}</td>
                <td>{e.customerName}</td>
                <td>{e.customerContact || "-"}</td>
                <td>{e.customerAddress}</td>
                <td>
                  {e.items.map((it, idx) => (
                    <div key={idx}>{it.plantName} × {it.quantity}</div>
                  ))}
                </td>
                <td>{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}

            {!estimations.length && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No estimations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
