const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch(err => console.log(err));

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  modelUrl: String,
  description: String
});

const Product = mongoose.model("Product", ProductSchema);

const products = [
  {
    name: "Wireless Mouse",
    category: "Electronics",
    price: 799,
    description: "Smooth wireless control",
    modelUrl: "/uploads/mouse.glb"
  },
  {
    name: "Smartwatch",
    category: "Electronics",
    price: 7999,
    description: "Track fitness and notifications",
    modelUrl: "/uploads/watch.glb"
  },
  {
    name: "Desk Lamp",
    category: "Furniture",
    price: 1499,
    description: "Modern adjustable lamp",
    modelUrl: "/uploads/lamp.glb"
  }
];

Product.insertMany(products)
  .then(() => {
    console.log("✅ Products seeded successfully!");
    mongoose.connection.close();
  })
  .catch(err => console.log(err));
