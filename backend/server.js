require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("crypto");
const https = require("https");
const fs = require("fs");

const app = express();

// ✅ Environment variables
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/* ---------------------------------------------------
 ✅ 1. CORS MUST COME FIRST (BEFORE STATIC FILES)
--------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:5173",
  "https://localhost:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

/* ---------------------------------------------------
 ✅ 2. STATIC FILES (models + thumbnails)
--------------------------------------------------- */
app.use(
  "/models",
  express.static(path.join(__dirname, "models"), {

    setHeaders: (res, filepath) => {
      if (filepath.endsWith(".glb"))
        res.set("Content-Type", "model/gltf-binary");
      if (filepath.endsWith(".gltf"))
        res.set("Content-Type", "model/gltf+json");

      res.set("Cache-Control", "public, max-age=31536000");
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

app.use("/thumbnail", express.static("uploads/thumbnail"));

/* ---------------------------------------------------
 ✅ 3. MongoDB Connection
--------------------------------------------------- */
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ar-viewer", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

/* ---------------------------------------------------
 ✅ 4. Mongoose Schemas
--------------------------------------------------- */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  modelUrl: { type: String, required: true },
  thumbnailUrl: String,
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
  },
  scale: { type: Number, default: 1 },
  category: String,
  variants: [
    {
      name: String,
      modelUrl: String,
      thumbnailUrl: String,
    },
  ],
  metadata: {
    fileSize: Number,
    format: String,
    compressed: Boolean,
  },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  placements: { type: Number, default: 0 },
});

const Product = mongoose.model("Product", productSchema);

const analyticsSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  eventType: String,
  sessionId: String,
  deviceInfo: {
    userAgent: String,
    hasWebXR: Boolean,
    hasAR: Boolean,
  },
  duration: Number,
  timestamp: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

/* ---------------------------------------------------
 ✅ 5. MULTER for File Uploads
--------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/models/"),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${hash}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".glb", ".gltf"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext)
      ? cb(null, true)
      : cb(new Error("Only GLB / GLTF files allowed"));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

/* ---------------------------------------------------
 ✅ 6. AUTH Middleware
--------------------------------------------------- */
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

/* ---------------------------------------------------
 ✅ 7. ROUTES
--------------------------------------------------- */

// ✅ Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    product.views++;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create product
app.post(
  "/api/products",
  authenticateToken,
  upload.single("model"),
  async (req, res) => {
    try {
      const { name, description, dimensions, category, scale } = req.body;

      const product = new Product({
        name,
        description,
        modelUrl: `/models/${req.file.filename}`,
        thumbnailUrl: req.body.thumbnailUrl || null,
        dimensions: JSON.parse(dimensions || "{}"),
        category,
        scale: scale || 1,
        metadata: {
          fileSize: req.file.size,
          format: path.extname(req.file.filename),
          compressed: req.file.filename.endsWith(".glb"),
        },
      });

      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ✅ Update product
app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Analytics
app.post("/api/analytics", async (req, res) => {
  try {
    await Analytics.create(req.body);

    if (req.body.eventType === "placement" && req.body.productId) {
      await Product.findByIdAndUpdate(req.body.productId, {
        $inc: { placements: 1 },
      });
    }

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ username }, JWT_SECRET, {
      expiresIn: "24h",
    });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// ✅ Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

/* ---------------------------------------------------
 ✅ 8. ERROR HANDLER
--------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

/* ---------------------------------------------------
 ✅ 9. HTTPS in DEVELOPMENT ONLY
--------------------------------------------------- */
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  if (fs.existsSync("localhost-key.pem") && fs.existsSync("localhost.pem")) {
    https
      .createServer(
        {
          key: fs.readFileSync("localhost-key.pem"),
          cert: fs.readFileSync("localhost.pem"),
        },
        app
      )
      .listen(PORT, () =>
        console.log(`✅ DEV HTTPS running at https://localhost:${PORT}`)
      );
  } else {
    console.log("⚠️ SSL certs missing — using HTTP");
    app.listen(PORT, () =>
      console.log(`✅ HTTP running at http://localhost:${PORT}`)
    );
  }
} else {
  // ✅ PRODUCTION — HTTPS handled by hosting (NGINX / Vercel / Render)
  app.listen(PORT, () =>
    console.log(`✅ Production server running on port ${PORT}`)
  );
}

module.exports = app;