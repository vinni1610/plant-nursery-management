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
        setLoading(true);
        const [plantsRes, ordersRes] = await Promise.all([
          API.get("/plants"),
          API.get("/orders")
        ]);
        setPlants(plantsRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const lowStockPlants = plants.filter((p) => p.stock <= 5);
  const totalStock = plants.reduce((sum, p) => sum + (p.stock || 0), 0);

  if (loading) {
    return (
      <div className="container-fluid px-2 px-sm-3 px-lg-4 mt-3 mt-md-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 px-sm-3 px-lg-4 mt-3 mt-md-4">
      {/* Page Header - Responsive */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4">
        <h2 className="mb-2 mb-sm-0 fw-bold text-success fs-4 fs-md-3">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success btn-sm">
            <i className="bi bi-arrow-clockwise me-1"></i>
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <button className="btn btn-success btn-sm">
            <i className="bi bi-download me-1"></i>
            <span className="d-none d-sm-inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Fully Responsive Grid */}
      <div className="row g-2 g-md-3 g-lg-4 mb-3 mb-md-4">
        {/* Total Plants */}
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card text-white bg-primary shadow-sm border-0 h-100">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0 small text-white-50">Total Plants</h6>
                  <h3 className="mt-2 mb-0 fw-bold fs-4 fs-lg-2">{plants.length}</h3>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <i className="bi bi-flower1 fs-4"></i>
                </div>
              </div>
              <small className="text-white-50 d-none d-md-block">
                <i className="bi bi-arrow-up"></i> Active inventory
              </small>
            </div>
          </div>
        </div>

        {/* Total Stock */}
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card text-white bg-info shadow-sm border-0 h-100">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0 small text-white-50">Total Stock</h6>
                  <h3 className="mt-2 mb-0 fw-bold fs-4 fs-lg-2">{totalStock}</h3>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <i className="bi bi-boxes fs-4"></i>
                </div>
              </div>
              <small className="text-white-50 d-none d-md-block">
                <i className="bi bi-graph-up"></i> Units available
              </small>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card text-white bg-warning shadow-sm border-0 h-100">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0 small text-white-50">Total Orders</h6>
                  <h3 className="mt-2 mb-0 fw-bold fs-4 fs-lg-2">{orders.length}</h3>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <i className="bi bi-cart-check fs-4"></i>
                </div>
              </div>
              <small className="text-white-50 d-none d-md-block">
                <i className="bi bi-calendar3"></i> All time
              </small>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-6 col-sm-6 col-md-3">
          <div className="card text-white bg-success shadow-sm border-0 h-100">
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0 small text-white-50">Total Revenue</h6>
                  <h3 className="mt-2 mb-0 fw-bold fs-5 fs-lg-2">₹{totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="bg-white bg-opacity-25 rounded p-2">
                  <i className="bi bi-currency-rupee fs-4"></i>
                </div>
              </div>
              <small className="text-white-50 d-none d-md-block">
                <i className="bi bi-graph-up-arrow"></i> Total earnings
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Responsive Grid */}
      <div className="row g-2 g-md-3 g-lg-4">
        {/* Low Stock Alerts - Full width on mobile, half on tablet+ */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-danger text-white py-2 py-md-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold small">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Low Stock Alerts (≤ 5)
                </h6>
                <span className="badge bg-white text-danger">
                  {lowStockPlants.length}
                </span>
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
              {lowStockPlants.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {lowStockPlants.map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item d-flex justify-content-between align-items-center py-2 py-md-3"
                    >
                      <div className="d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-danger bg-opacity-10 rounded p-2">
                          <i className="bi bi-flower1 text-danger"></i>
                        </div>
                        <div>
                          <span className="fw-semibold d-block text-truncate" style={{ maxWidth: "200px" }}>
                            {p.plantName}
                          </span>
                          <small className="text-muted d-none d-sm-block">
                            {p.botanicalName || "—"}
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-danger rounded-pill px-3">
                        {p.stock} left
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-check-circle text-success fs-1 d-block mb-3"></i>
                  <p className="mb-0">All plants are well stocked!</p>
                </div>
              )}
            </div>
            {lowStockPlants.length > 0 && (
              <div className="card-footer bg-light py-2 text-center">
                <button className="btn btn-sm btn-outline-danger">
                  <i className="bi bi-bell me-1"></i>
                  <span className="d-none d-sm-inline">Set Restock Alerts</span>
                  <span className="d-inline d-sm-none">Alerts</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders - Full width on mobile, half on tablet+ */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-success text-white py-2 py-md-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-semibold small">
                  <i className="bi bi-cart-check-fill me-2"></i>
                  Recent Orders
                </h6>
                <span className="badge bg-white text-success">
                  {orders.length}
                </span>
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
              {orders.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {orders.slice(0, 5).map((o) => (
                    <li
                      key={o.id}
                      className="list-group-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 py-2 py-md-3"
                    >
                      <div className="d-flex align-items-center gap-2 gap-md-3 flex-grow-1">
                        <div className="bg-success bg-opacity-10 rounded p-2">
                          <i className="bi bi-person-fill text-success"></i>
                        </div>
                        <div className="flex-grow-1">
                          <strong className="d-block text-truncate" style={{ maxWidth: "180px" }}>
                            {o.customerName}
                          </strong>
                          <small className="text-muted d-block">
                            <i className="bi bi-hash"></i>
                            {o.orderNo}
                          </small>
                          <small className="text-muted d-none d-md-block">
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-success fw-bold d-block fs-5 fs-md-4">
                          ₹{o.grandTotal?.toFixed(2)}
                        </span>
                        <small className="badge bg-success bg-opacity-25 text-success">
                          Completed
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                  <p className="mb-0">No orders yet</p>
                  <button className="btn btn-success btn-sm mt-3">
                    <i className="bi bi-plus-circle me-1"></i>
                    Create First Order
                  </button>
                </div>
              )}
            </div>
            {orders.length > 5 && (
              <div className="card-footer bg-light py-2 text-center">
                <button className="btn btn-sm btn-outline-success">
                  <i className="bi bi-eye me-1"></i>
                  <span className="d-none d-sm-inline">View All Orders</span>
                  <span className="d-inline d-sm-none">View All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}