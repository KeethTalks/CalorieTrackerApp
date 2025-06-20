// ✅ Import required modules
import fs from "fs"; // File system module to read JSON dataset
import path from "path"; // Helps resolve absolute file paths
import { fileURLToPath } from "url"; // Converts module URL to file path
import { Pinecone } from "@pinecone-database/pinecone"; // Pinecone vector database
import { OpenAIEmbeddings } from "@langchain/openai"; // OpenAI embeddings model
import dotenv from "dotenv"; // Loads environment variables

// ✅ Resolve the absolute path to `.env` file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");

// ✅ Load environment variables using the absolute path
dotenv.config({ path: envPath });

// ✅ Debugging logs
console.log("📌 Loading .env from:", envPath);
console.log("📌 File exists:", fs.existsSync(envPath));
console.log("🔍 Pinecone API Key:", process.env.PINECONE_API_KEY ? "✅ Loaded" : "❌ Not found");
console.log("🔍 Pinecone Index Name:", process.env.PINECONE_INDEX_NAME ? "✅ Loaded" : "❌ Not found");


// ✅ Initialize Pinecone client
// For parallel batching, you might initialize with pool_threads (for Python SDK),
// but for Node.js, the client handles concurrency by default with async/await.
// The primary benefit of batching in Node.js is managing payload size.
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function loadFoodData() {
    // ✅ Verify API key is loaded correctly
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("❌ Pinecone API key is missing! Check your .env file.");
    }
    if (!process.env.PINECONE_INDEX_NAME) {
        throw new Error("❌ Pinecone index name is missing! Check your .env file.");
    }

    // ✅ Connect to Pinecone index
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    const namespace = "nutrition"; // Namespace for storing meal insights

    // ✅ Read the food dataset file
    const jsonPath = path.resolve(__dirname, "food_nutrients_fixed.json");
    console.log("📌 Loading dataset from:", jsonPath);
    console.log("📌 File exists:", fs.existsSync(jsonPath));

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const foodItems = JSON.parse(rawData); // Convert JSON text into objects

    // ✅ Debug: Log total items count
    console.log(`🔢 Total food items: ${foodItems.length}`);

    // ✅ Prepare vectorized embeddings
    const allVectors = []; // Store all prepared vectors before batching

    for (let i = 0; i < foodItems.length; i++) {
        const item = foodItems[i];

        // ✅ Ensure item has a valid name
        const itemName = item.name ? item.name.trim() : `Unknown Dish ${i}`; // Assign default name if missing

        // ✅ Construct text description for embedding
        const text = `${itemName}: ${item.calories || 0} calories, ${item.fat || 0}g fat, ${item.carb || 0}g carbs, ${item.protein || 0}g protein`;

        // ✅ Generate OpenAI embeddings
        try {
            const embedding = await new OpenAIEmbeddings().embedQuery(text);

            // ✅ Store vectorized data in Pinecone format
            allVectors.push({
                id: item.id || `auto_${i}`, // Generate an ID if missing
                values: embedding,
                metadata: { text },
            });

            // ✅ Log first few items only to avoid excessive output
            if (i < 5) {
                console.log(`✅ Processed item ${i + 1} of ${foodItems.length}: ${itemName}`);
            }

            // ✅ Show progress every 500 items
            if ((i + 1) % 500 === 0) { // +1 to log after 500th, 1000th etc.
                console.log(`🔄 Progress: Processed ${i + 1} items so far...`);
            }
        } catch (err) {
            console.error(`⚠️ Error processing embedding for item ${i} (${itemName}):`, err);
            continue; // Skip problematic items
        }
    }

    // ✅ Fix "records is not iterable" error: Ensure data is in array format
    if (!Array.isArray(allVectors) || allVectors.length === 0) {
        throw new Error("❌ No valid vectors found for upload after processing.");
    }

    // --- START DEBUGGING ADDITIONS ---
    console.log("\n--- Debugging Pinecone Upsert Payload ---");
    console.log("Type of 'allVectors' variable:", typeof allVectors);
    console.log("Is 'allVectors' an array?", Array.isArray(allVectors));
    console.log("Number of vectors prepared:", allVectors.length);

    if (allVectors.length > 0) {
        console.log("Structure of first vector:", JSON.stringify(allVectors[0], null, 2));
        console.log("Type of values in first vector:", typeof allVectors[0].values);
        console.log("Length of values in first vector:", allVectors[0].values?.length);
    }
    console.log("--- End Debugging ---");
    // --- END DEBUGGING ADDITIONS ---

    // ✅ Implement Batching for Pinecone Upsert
    // Pinecone recommends batch sizes up to 1000 vectors.
    // Adjust `batchSize` based on your vector dimension and metadata size.
    const batchSize = 100; // A reasonable default; can be adjusted.
    console.log(`🚀 Starting Pinecone upsert in batches of ${batchSize} vectors...`);

    for (let i = 0; i < allVectors.length; i += batchSize) {
        const batch = allVectors.slice(i, i + batchSize);
        try {
            await index.upsert({ vectors: batch, namespace });
            console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allVectors.length / batchSize)} (${batch.length} vectors)`);
        } catch (batchError) {
            console.error(`❌ Error uploading batch starting at index ${i}:`, batchError);
            // Depending on the error, you might want to retry this batch
            // or log specific batch details for debugging.
            // For now, we'll continue to the next batch.
            continue;
        }
    }

    console.log("🎉 ✅ Food data successfully loaded into Pinecone!");
}

// ✅ Run function with error handling
loadFoodData().catch((err) => console.error("❌ Error loading data:", err));