// check-slugs.mjs
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://maxidimnik_db_user:3Q8R6pWYLde7fUx7@cluster0.dfwidy6.mongodb.net/usashopbox?retryWrites=true&w=majority&appName=Cluster0"; // Pegala aquí

async function check() {
  await mongoose.connect(MONGODB_URI);
  const collection = mongoose.connection.db.collection('products');
  
  console.log("--- REVISANDO SLUGS EN BASE DE DATOS ---");
  const products = await collection.find({}).toArray();
  
  products.forEach(p => {
    console.log(`Producto: ${p.title}`);
    console.log(`Slug en DB: "${p.slug}"`);
    console.log(`ID: ${p._id}`);
    console.log("---------------------------------------");
  });

  process.exit();
}

check();