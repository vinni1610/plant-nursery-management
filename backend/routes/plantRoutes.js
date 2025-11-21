const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant");
const multer = require("multer");
const path = require("path");

// 🖼️ Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// 🌿 Get all plants (with full image URL)
router.get("/", async (req, res) => {
  try {
    const plants = await Plant.findAll({ order: [["createdAt", "DESC"]] });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const withFullUrl = plants.map((plant) => ({
      ...plant.toJSON(),
      image: plant.image ? `${baseUrl}${plant.image}` : null,
    }));

    res.status(200).json(withFullUrl);
  } catch (err) {
    console.error("❌ Error fetching plants:", err);
    res.status(500).json({ error: "Failed to fetch plants" });
  }
});

// 🌱 Get one plant by ID
router.get("/:id", async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) return res.status(404).json({ error: "Plant not found" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.json({
      ...plant.toJSON(),
      image: plant.image ? `${baseUrl}${plant.image}` : null,
    });
  } catch (err) {
    console.error("❌ Error fetching plant:", err);
    res.status(500).json({ error: "Failed to fetch plant" });
  }
});

// ➕ Add new plant (with image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      plantName,
      botanicalName,
      description,
      price,
      stock,
      size,
      light,
      water,
      category,
    } = req.body;

    if (!plantName || !price) {
      return res
        .status(400)
        .json({ error: "Plant name and price are required" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newPlant = await Plant.create({
      plantName,
      botanicalName,
      description,
      price,
      stock,
      size,
      light,
      water,
      category,
      image: imagePath,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fullPlant = {
      ...newPlant.toJSON(),
      image: newPlant.image ? `${baseUrl}${newPlant.image}` : null,
    };

    res.status(201).json(fullPlant);
  } catch (err) {
    console.error("❌ Error creating plant:", err);
    res.status(400).json({ error: "Error creating plant" });
  }
});

// ✏️ Update plant by ID (with optional image)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) return res.status(404).json({ error: "Plant not found" });

    const {
      plantName,
      botanicalName,
      description,
      price,
      stock,
      size,
      light,
      water,
      category,
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : plant.image;

    await plant.update({
      plantName,
      botanicalName,
      description,
      price,
      stock,
      size,
      light,
      water,
      category,
      image: imagePath,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.json({
      ...plant.toJSON(),
      image: plant.image ? `${baseUrl}${plant.image}` : null,
    });
  } catch (err) {
    console.error("❌ Error updating plant:", err);
    res.status(400).json({ error: "Error updating plant" });
  }
});

// 🗑️ Delete plant by ID
router.delete("/:id", async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) return res.status(404).json({ error: "Plant not found" });

    await plant.destroy();
    res.json({ message: "Plant deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting plant:", err);
    res.status(500).json({ error: "Failed to delete plant" });
  }
});

// 🖼️ Serve images statically
router.use("/uploads", express.static("uploads"));

module.exports = router;
