import React, { useEffect, useState } from "react";
import API from "../api";

export default function PurchaseDashboard() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    plant: "",
    name: "",
    from: "",
    to: "",
  });

  const load = async () => {
    const res = await API.get("/purchases", { params: filters });
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const downloadPDF = async () => {
    const res = await API.get("/purchases/pdf", {
      params: filters,
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Filtered_Purchases.pdf";
    link.click();
  };

  return (
    <div className="container mt-4">
      <h3 className="text-success mb-3">Purchase Dashboard</h3>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            placeholder="Search Plant"
            className="form-control"
            onChange={(e) => setFilters({ ...filters, plant: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <input
            placeholder="Customer Name"
            className="form-control"
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control"
            onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control"
            onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button className="btn btn-success w-100" onClick={load}>Search</button>
          <button className="btn btn-outline-danger" onClick={downloadPDF}>
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="table table-bordered">
          <thead className="table-success">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Plants</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => (
              <tr key={o.id}>
                <td>{o.customerName}</td>
                <td>{o.customerContact}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  {o.orderItems.map((i) => (
                    <div key={i.id}>
                      {i.plantName} × {i.quantity}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No purchases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
