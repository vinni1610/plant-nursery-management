import React, { useEffect, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PlantCatalog() {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    loadPlants();
  }, []);

  // ✅ Load all plants
  const loadPlants = async () => {
    try {
      const res = await API.get("/plants");
      setPlants(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("❌ Failed to load plants:", err);
    }
  };

  // 🔍 Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    const f = plants.filter(
      (p) =>
        p.plantName.toLowerCase().includes(q) ||
        (p.botanicalName && p.botanicalName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
    setFiltered(f);
  }, [search, plants]);

  // 📥 Export Excel
  const downloadExcel = () => {
    const data = plants.map((p, i) => ({
      "Sl.No": i + 1,
      "Plant Name": p.plantName,
      "Botanical Name": p.botanicalName,
      "Category": p.category,
      "Price (₹)": p.price,
      "Stock": p.stock,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Plants");
    XLSX.writeFile(wb, "Plant_Catalog.xlsx");
  };

  // 📄 Export PDF
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Plant Catalog", 14, 15);

      const tableData = plants.map((p, index) => [
        index + 1,
        p.plantName || "—",
        p.botanicalName || "—",
        p.category || "—",
        p.stock || 0,
        "₹ " + (p.price || 0),
      ]);

      autoTable(doc, {
        head: [["Sl.No", "Plant Name", "Botanical Name", "Category", "Stock", "Price"]],
        body: tableData,
        startY: 20,
      });

      doc.save("Plant_Catalog.pdf");
    } catch (err) {
      console.error("❌ PDF download failed:", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      {/* Header + Search + Download Buttons */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="fw-semibold text-success">🌿 Plant Catalog</h2>

        <div className="d-flex gap-2 mt-2 mt-md-0">
          <input
            type="text"
            className="form-control"
            style={{ width: "250px" }}
            placeholder="Search plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Download Buttons */}
          <button className="btn btn-outline-success" onClick={downloadExcel}>
            📥 Excel
          </button>
          <button className="btn btn-outline-danger" onClick={downloadPDF}>
            📄 PDF
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive card shadow-sm">
        <table className="table table-hover table-bordered align-middle mb-0">
          <thead className="table-success">
            <tr>
              <th>Sl.No</th>
              <th>Plant Name</th>
              <th>Botanical Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>{p.plantName}</td>
                <td>{p.botanicalName || "—"}</td>
                <td>{p.category || "—"}</td>
                <td>₹ {p.price?.toFixed(2)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  <i className="bi bi-flower2 fs-2 d-block mb-2"></i>
                  No plants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}