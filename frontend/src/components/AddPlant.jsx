import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function AddPlant() {
  const [form, setForm] = useState({
    plantName: "",
    botanicalName: "",
    description: "",
    price: 0,
    stock: 0,
    size: "",
    category: "",
    image: null, // change from string to file
  });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      await API.post("/plants", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Plant added successfully!");
      navigate("/plants/manage");
    } catch (err) {
      alert("❌ Error: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">Add New Plant</h4>
        </div>
        <div className="card-body">
          <form onSubmit={submit} encType="multipart/form-data">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Plant Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.plantName}
                  onChange={(e) =>
                    setForm({ ...form, plantName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Botanical Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.botanicalName}
                  onChange={(e) =>
                    setForm({ ...form, botanicalName: e.target.value })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Size</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              {/* 🖼️ Image upload */}
              <div className="col-12">
                <label className="form-label">Upload Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.files[0] })
                  }
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-success px-4">
                  <i className="bi bi-check-circle me-2"></i>Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
