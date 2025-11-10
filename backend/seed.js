// seed.js - Populate database with sample products
const mongoose = require('mongoose');

require('dotenv').config();

// ✅ Dynamic Mongo URI (Atlas or Local)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ar-viewer';

// ✅ Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  modelUrl: { type: String, required: true },      // ✅ Store only relative path
  thumbnailUrl: String,                            // ✅ Store only relative path
  dimensions: {
    width: Number,
    height: Number,
    depth: Number
  },
  scale: { type: Number, default: 1 },
  category: String,
  variants: [{
    name: String,
    modelUrl: String,
    thumbnailUrl: String
  }],
  metadata: {
    fileSize: Number,
    format: String,
    compressed: Boolean
  },
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  placements: { type: Number, default: 0 }
});

const Product = mongoose.model('Product', productSchema);

// ✅ Sample Products (RELATIVE URLs only — GOOD for production)
const sampleProducts = [
  {
    name: 'Modern Chair',
    description: 'Comfortable ergonomic chair',
    modelUrl: '/models/chair.glb',
    thumbnailUrl: '/thumbnail/chair.png',
    dimensions: { width: 0.6, height: 0.85, depth: 0.6 },
    scale: 1,
    category: 'Furniture',
    metadata: { fileSize: 2500000, format: '.glb', compressed: true }
  },
  {
    name: 'Table Lamp',
    description: 'Elegant desk lamp',
    modelUrl: '/models/lamp.glb',
    thumbnailUrl: '/thumbnail/lamp.png',
    dimensions: { width: 0.2, height: 0.4, depth: 0.2 },
    scale: 1,
    category: 'Lighting',
    metadata: { fileSize: 1200000, format: '.glb', compressed: true }
  },
  {
    name: 'Coffee Table',
    description: 'Modern coffee table',
    modelUrl: '/models/coffe_tab.glb',
    thumbnailUrl: '/thumbnail/table.png',
    dimensions: { width: 1.0, height: 0.4, depth: 0.6 },
    scale: 1,
    category: 'Furniture',
    metadata: { fileSize: 3200000, format: '.glb', compressed: true }
  }
];

// ✅ Seeder Function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Clear old data
    console.log('🗑️ Clearing old products...');
    const deleted = await Product.deleteMany({});
    console.log(`✅ Removed ${deleted.deletedCount} products\n`);

    // Insert new samples
    console.log('📦 Inserting sample products...');
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${inserted.length} products\n`);

    // Display summary
    console.log('📋 Inserted Products:');
    console.log('══════════════════════════════════════════════');

    inserted.forEach((p, index) => {
      console.log(`\n${index + 1}. ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Thumbnail: ${p.thumbnailUrl}`);
      console.log(`   Model: ${p.modelUrl}`);
      console.log(`   Dimensions: ${p.dimensions.width} x ${p.dimensions.height} x ${p.dimensions.depth}`);
    });

    console.log('\n══════════════════════════════════════════════');
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   npm run dev  (backend)');
    console.log('   Test API -> GET /api/products');
    console.log('   Test file -> GET /models/chair.glb\n');

    process.exit(0);

  } catch (err) {
    console.error('❌ Seeder Error:', err);
    process.exit(1);
  }
}

// ✅ Run Seeder
console.log('\n══════════════════════════════════════════════');
console.log('   AR Product Viewer — Database Seeder');
console.log('══════════════════════════════════════════════\n');

seedDatabase();
