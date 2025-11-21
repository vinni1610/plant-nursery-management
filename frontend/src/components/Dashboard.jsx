import React, { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/plants").then((r) => setPlants(r.data)).catch(console.error);
    API.get("/orders").then((r) => setOrders(r.data)).catch(console.error);
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const lowStockPlants = plants.filter((p) => p.stock <= 5);
  const totalStock = plants.reduce((sum, p) => sum + (p.stock || 0), 0);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-semibold text-success">Dashboard</h2>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary shadow">
            <div className="card-body text-center">
              <h6 className="card-title">Total Plants</h6>
              <h3 className="mt-2">{plants.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info shadow">
            <div className="card-body text-center">
              <h6 className="card-title">Total Stock</h6>
              <h3 className="mt-2">{totalStock}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning shadow">
            <div className="card-body text-center">
              <h6 className="card-title">Total Orders</h6>
              <h3 className="mt-2">{orders.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success shadow">
            <div className="card-body text-center">
              <h6 className="card-title">Total Revenue</h6>
              <h3 className="mt-2">₹ {totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Low Stock Alerts */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-danger text-white">
              <h6 className="mb-0">⚠️ Low Stock Alerts (≤ 5)</h6>
            </div>
            <div className="card-body p-0">
              {lowStockPlants.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {lowStockPlants.map((p) => (
                    <li key={p.id} className="list-group-item d-flex justify-content-between">
                      <span>{p.plantName}</span>
                      <span className="badge bg-danger">{p.stock} left</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted py-4">
                  ✅ All plants are well stocked!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">📦 Recent Orders</h6>
            </div>
            <div className="card-body p-0">
              {orders.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {orders.slice(0, 5).map((o) => (
                    <li key={o.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <strong>{o.customerName}</strong>
                        <br />
                        <small className="text-muted">{o.orderNo}</small>
                      </div>
                      <span className="text-success fw-bold">₹ {o.grandTotal?.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted py-4">
                  No orders yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}