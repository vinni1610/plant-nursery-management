import React, { useEffect, useState } from "react";
import API from "../api";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plantsRes, ordersRes] = await Promise.all([
          API.get("/plants"),
          API.get("/orders"),
        ]);
        setPlants(plantsRes.data);
        setOrders(ordersRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
  const totalStock = plants.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStockPlants = plants.filter((p) => p.stock <= 5);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-success" />
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-sm-3 px-lg-4 mt-3">

      {/* HEADER */}
      <h2 className="fw-bold text-success mb-3">
        <i className="bi bi-speedometer2 me-2"></i> Dashboard
      </h2>

      {/* ===================== STATS ===================== */}
      <div className="row g-3 mb-4">

        {/* TOTAL PLANTS */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card bg-primary text-white shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-white-50">Total Plants</small>
                  <h3 className="fw-bold">{plants.length}</h3>
                </div>
                <i className="bi bi-flower1 fs-1 opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL STOCK */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card bg-info text-white shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-white-50">Total Stock</small>
                  <h3 className="fw-bold">{totalStock}</h3>
                </div>
                <i className="bi bi-boxes fs-1 opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card bg-warning text-white shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-white-50">Total Orders</small>
                  <h3 className="fw-bold">{orders.length}</h3>
                </div>
                <i className="bi bi-cart-check fs-1 opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL REVENUE */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card bg-success text-white shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-white-50">Total Revenue</small>
                  <h3 className="fw-bold">₹{totalRevenue.toFixed(2)}</h3>
                </div>
                <i className="bi bi-currency-rupee fs-1 opacity-75"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ===================== LOW STOCK ===================== */}
      <div className="row g-3">

        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header bg-danger text-white">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Low Stock Alerts
            </div>
            <ul className="list-group list-group-flush">
              {lowStockPlants.length ? lowStockPlants.map((p) => (
                <li key={p.id} className="list-group-item d-flex justify-content-between">
                  <span>{p.plantName}</span>
                  <span className="badge bg-danger">{p.stock}</span>
                </li>
              )) : (
                <li className="list-group-item text-center text-muted">
                  All stocks are healthy
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ===================== RECENT ORDERS ===================== */}
        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header bg-success text-white">
              <i className="bi bi-cart-check-fill me-2"></i>
              Recent Orders
            </div>
            <ul className="list-group list-group-flush">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="list-group-item d-flex justify-content-between">
                  <div>
                    <strong>{o.customerName}</strong>
                    <div className="text-muted small">{o.orderNo}</div>
                  </div>
                  <span className="fw-bold text-success">
                    ₹{o.grandTotal?.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
