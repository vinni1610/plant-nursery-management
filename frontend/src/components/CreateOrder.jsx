import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateOrder() {
  const [plants, setPlants] = useState([]);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);

  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    customerAddress: "",
  });

  const navigate = useNavigate();

  // =============================
  // FETCH PLANTS
  // =============================
  useEffect(() => {
    API.get("/plants")
      .then((res) => setPlants(res.data))
      .catch(console.error);
  }, []);

  // =============================
  // ADD / REMOVE ITEM
  // =============================
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
        showDropdown: false,
      },
    ]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // =============================
  // SELECT PLANT
  // =============================
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
      showDropdown: false, // ✅ close dropdown
    };
    setItems(next);
  };

  // =============================
  // UPDATE QUANTITY
  // =============================
  const onQtyChange = (idx, qty) => {
    const next = [...items];
    next[idx].quantity = Number(qty);
    next[idx].total = next[idx].rate * next[idx].quantity;
    setItems(next);
  };

  // =============================
  // CALCULATIONS
  // =============================
  const subTotal = items.reduce((sum, i) => sum + i.total, 0);
  const grandTotal = subTotal - Number(discount || 0);

  // =============================
  // DOWNLOAD INVOICE
  // =============================
  const downloadInvoice = async (orderId) => {
    const res = await API.get(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_${orderId}.pdf`;
    link.click();
  };

  // =============================
  // SUBMIT ORDER
  // =============================
  const submit = async (e) => {
    e.preventDefault();

    if (!items.length) return alert("Add at least one plant");
    if (items.some((i) => !i.plantId))
      return alert("Select plant for all rows");

    const payload = {
      orderNo: `ORD-${Date.now()}`,
      customerName: form.customerName,
      customerContact: form.customerContact,
      customerAddress: form.customerAddress,
      items,
      subTotal,
      discount,
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

        {/* CUSTOMER INFO */}
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
              required
              value={form.customerAddress}
              onChange={(e) =>
                setForm({ ...form, customerAddress: e.target.value })
              }
            />
          </div>
        </div>

        {/* ITEMS */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <h5>Order Items</h5>
            <button type="button" className="btn btn-primary" onClick={addItem}>
              + Add Plant
            </button>
          </div>

          {/* DESKTOP HEADER ONLY */}
          {items.length > 0 && (
            <div className="row g-2 fw-bold text-muted border-bottom pb-2 mb-2 d-none d-md-flex">
              <div className="col-md-4">Plant</div>
              <div className="col-md-2">Price</div>
              <div className="col-md-2">Quantity</div>
              <div className="col-md-2">Total</div>
              <div className="col-md-2">Action</div>
            </div>
          )}

          {items.map((it, idx) => {
            const filteredPlants = plants.filter((p) =>
              p.plantName.toLowerCase().includes(it.search.toLowerCase())
            );

            return (
              <div key={idx} className="border rounded p-3 mb-3">
                <div className="row g-2 align-items-center">

                  {/* PLANT */}
                  <div className="col-md-4 position-relative">
                    <div className="fw-bold d-md-none mb-1">Plant</div>
                    <input
                      className="form-control"
                      placeholder="Search plant..."
                      value={it.search}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx].search = e.target.value;
                        next[idx].showDropdown = true;
                        setItems(next);
                      }}
                    />

                    {it.showDropdown && filteredPlants.length > 0 && (
                      <div className="list-group position-absolute w-100 shadow z-3">
                        {filteredPlants.slice(0, 6).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => onPlantSelect(idx, p)}
                          >
                            {p.plantName} (Stock: {p.stock})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="col-md-2">
                    <div className="fw-bold d-md-none mb-1">Price</div>
                    <input
                      className="form-control"
                      readOnly
                      value={it.rate ? `₹ ${it.rate.toFixed(2)}` : ""}
                    />
                  </div>

                  {/* QTY */}
                  <div className="col-md-2">
                    <div className="fw-bold d-md-none mb-1">Quantity</div>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => onQtyChange(idx, e.target.value)}
                    />
                  </div>

                  {/* TOTAL */}
                  <div className="col-md-2">
                    <div className="fw-bold d-md-none mb-1">Total</div>
                    <input
                      className="form-control"
                      readOnly
                      value={it.total ? `₹ ${it.total.toFixed(2)}` : ""}
                    />
                  </div>

                  {/* REMOVE */}
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={() => removeItem(idx)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTALS */}
        <div className="border-top pt-3">
          <div className="row">
            <div className="col-md-4 offset-md-8">
              <p><strong>Subtotal:</strong> ₹ {subTotal.toFixed(2)}</p>

              <div className="mb-2">
                <label>Discount</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>

              <p className="fw-bold text-success fs-5">
                Grand Total: ₹ {grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <button className="btn btn-success mt-3" disabled={!items.length}>
          Place Order
        </button>
      </form>
    </div>
  );
}
