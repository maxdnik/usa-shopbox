import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const { default: dbConnect } = await import("../src/lib/models/mongodb");
  const { Product } = await import("../src/lib/models/Product");

  await dbConnect();

  const res = await Product.updateMany(
    { source: "manual", sourceHandle: null },
    { $unset: { sourceHandle: "", sourceId: "" } }
  );

  console.log("✅ fixed:", res.modifiedCount);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});