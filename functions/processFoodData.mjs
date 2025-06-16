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

// ✅ Initialize Pinecone client
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function loadFoodData() {
    // ✅ Verify API key is loaded correctly
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("❌ Pinecone API key is missing! Check your .env file.");
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
    const vectors = [];

    for (let index = 0; index < foodItems.length; index++) {
        const item = foodItems[index];

        // ✅ Ensure item has a valid name
        const itemName = item.name ? item.name.trim() : `Unknown Dish ${index}`; // Assign default name if missing

        // ✅ Construct text description for embedding
        const text = `${itemName}: ${item.calories || 0} calories, ${item.fat || 0}g fat, ${item.carb || 0}g carbs, ${item.protein || 0}g protein`;

        // ✅ Generate OpenAI embeddings
        try {
            const embedding = await new OpenAIEmbeddings().embedQuery(text);

            // ✅ Store vectorized data in Pinecone format
            vectors.push({
                id: item.id || `auto_${index}`, // Generate an ID if missing
                values: embedding,
                metadata: { text },
            });

            // ✅ Log first few items only to avoid excessive output
            if (index < 5) {
                console.log(`✅ Processed item ${index + 1} of ${foodItems.length}: ${itemName}`);
            }

            // ✅ Show progress every 500 items
            if (index % 500 === 0) {
                console.log(`🔄 Progress: Processed ${index + 1} items so far...`);
            }
        } catch (err) {
            console.error(`⚠️ Error processing embedding for item ${index}:`, err);
            continue; // Skip problematic items
        }
    }

    // ✅ Fix "records is not iterable" error: Ensure data is in array format
    if (!Array.isArray(vectors) || vectors.length === 0) {
        throw new Error("❌ No valid vectors found for upload.");
    }

    // --- START DEBUGGING ADDITIONS ---
    console.log("\n--- Debugging Pinecone Upsert Payload ---");
    console.log("Type of 'vectors' variable:", typeof vectors);
    console.log("Is 'vectors' an array?", Array.isArray(vectors));
    console.log("Number of vectors prepared:", vectors.length);

    if (vectors.length > 0) {
        console.log("Structure of first vector:", JSON.stringify(vectors[0], null, 2));
        console.log("Type of values in first vector:", typeof vectors[0].values);
        console.log("Length of values in first vector:", vectors[0].values?.length);
    }
    console.log("--- End Debugging ---");
    // --- END DEBUGGING ADDITIONS ---

    // ✅ Upload data to Pinecone
    await index.upsert({ vectors, namespace });

    console.log("🎉 ✅ Food data successfully loaded into Pinecone!");
}

// ✅ Run function with error handling
loadFoodData().catch((err) => console.error("❌ Error loading data:", err));