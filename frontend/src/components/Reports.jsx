import React, { useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [results, setResults] = useState([]);

  // 📅 Generate filtered report
 const generate = async () => {
  try {
    const res = await API.get("/orders");

    const data = res.data.filter((o) => {
      const orderDate = new Date(o.createdAt);

      let startDate = start ? new Date(start) : null;
      let endDate = end ? new Date(end) : null;

      // Normalize to full-day range
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;

      return true;
    });

    setResults(data);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
    alert("Failed to fetch orders");
  }
};


  // 📊 Export to Excel
  const downloadExcel = () => {
    if (results.length === 0) return alert("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(
      results.map((r, i) => ({
        "No": i + 1,
        "Order No": r.orderNo,
        "Customer": r.customerName,
        "Date": new Date(r.createdAt).toLocaleString(),
        "Total (₹)": r.grandTotal,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "Nursery_Report.xlsx");
  };

  // 🧾 Export to PDF
  // 🧾 Export to PDF
const downloadPDF = () => {
  if (results.length === 0) return alert("No data to export");

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Varashree Nursery - Sales Report", 14, 15);
  doc.setFontSize(10);
  doc.text(`From: ${start || "All"}  To: ${end || "All"}`, 14, 22);

  const tableData = results.map((r, i) => [
    i + 1,
    r.orderNo,
    r.customerName,
    new Date(r.createdAt).toLocaleString(),
    `₹ ${r.grandTotal.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [["No", "Order No", "Customer", "Date", "Total (₹)"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [46, 125, 50] }, // green header
  });

  doc.save("Nursery_Report.pdf");
};

  return (
    <div className="container mt-4">
      <h2 className="fw-semibold text-success mb-4">
        📊 Date-wise Report Management
      </h2>

      <div className="card shadow-sm">
        <div className="card-body">
          {/* 🔹 Date Filters */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">End Date</label>
              <input
                type="date"
                className="form-control"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>

            <div className="col-md-4 d-flex align-items-end">
              <button onClick={generate} className="btn btn-primary w-100">
                <i className="bi bi-bar-chart"></i> Generate Report
              </button>
            </div>
          </div>

          {/* 🔹 Download Buttons */}
          {results.length > 0 && (
            <div className="d-flex justify-content-end mb-3 gap-2">
              <button className="btn btn-success" onClick={downloadExcel}>
                <i className="bi bi-file-earmark-excel"></i> Export Excel
              </button>
              <button className="btn btn-danger" onClick={downloadPDF}>
                <i className="bi bi-filetype-pdf"></i> Export PDF
              </button>
            </div>
          )}

          {/* 🔹 Report Table */}
          {results.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-success">
                  <tr>
                    <th>No</th>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.id || i}>
                      <td>{i + 1}</td>
                      <td>{r.orderNo}</td>
                      <td>{r.customerName}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="fw-bold text-success">
                        ₹ {r.grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
              No results to display. Select a date range and click{" "}
              <b>"Generate Report"</b>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
