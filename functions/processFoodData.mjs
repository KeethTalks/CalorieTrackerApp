// ✅ Import required modules
import fs from "fs"; // File system module to read JSON dataset
import path from "path"; // Helps resolve absolute file paths
import { fileURLToPath } from "url"; // Converts module URL to file path
import { Pinecone } from "@pinecone-database/pinecone"; // Pinecone vector database
import { OpenAIEmbeddings } from "@langchain/openai"; // OpenAI embeddings model
import dotenv from "dotenv"; // Loads environment variables

// ✅ Resolve the absolute path to `.env` file (to fix Firebase emulator issue)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");

// ✅ Debug: Log `.env` path and file existence
console.log("📌 Loading .env from:", envPath);
console.log("📌 File exists:", fs.existsSync(envPath));

// ✅ Load environment variables
dotenv.config({ path: envPath });

// ✅ Debug: Check if Pinecone API key is loaded
console.log("🔍 Pinecone API Key:", process.env.PINECONE_API_KEY ? "✅ Loaded" : "❌ Not found");

// ✅ Initialize Pinecone client with API key
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY, // Ensure API key is fetched correctly
});

async function loadFoodData() {
    // ✅ Verify API Key is loaded correctly
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

    // ✅ Prepare vectorized embeddings for each food item
    const vectors = [];
    for (const item of foodItems) {
        const text = `${item.name}: ${item.calories} calories, ${item.fat}g fat, ${item.carb}g carbs, ${item.protein}g protein`;

        // ✅ Generate OpenAI embeddings for the meal description
        console.log("🔍 Available methods:", Object.keys(new OpenAIEmbeddings()));
        const embedding = await new OpenAIEmbeddings().embedQuery(text);
        console.log("✅ Generated embedding for:", item.name);

        // ✅ Store vectorized data in Pinecone format
        vectors.push({
            id: item.id, // Unique ID for each meal
            values: embedding, // OpenAI-generated vector representation
            metadata: { text }, // Store original meal text for reference
        });
    }

    // ✅ Upload data to Pinecone
    await index.upsert({ upsertRequest: { vectors, namespace } });

    console.log("✅ Food data successfully loaded into Pinecone!");
}

// ✅ Run function with error handling
loadFoodData().catch((err) => console.error("❌ Error loading data:", err));