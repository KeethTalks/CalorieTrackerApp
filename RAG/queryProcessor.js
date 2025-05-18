// queryProcessor.js
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { ChatOpenAI } from "langchain/chat_models/openai";
import dotenv from "dotenv";

dotenv.config(); // Load API keys from your .env file

// Function to convert text into an embedding vector
async function getEmbedding(query) {
    const embeddings = new OpenAIEmbeddings();
    return await embeddings.embedText(query);
}

// Function to query Pinecone
async function queryPinecone(embedding, namespace) {
    try {
        const pinecone = new PineconeClient();
        await pinecone.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENV,
        });

        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        const queryResponse = await index.query({
            vector: embedding,
            namespace,
            topK: 5,
            includeMetadata: true, // Ensure we retrieve metadata like the original text
        });

        return queryResponse.matches.map(match => match.metadata.text);
    } catch (error) {
        console.error("Error querying Pinecone:", error);
        return []; // Return an empty array if the query fails
    }
}

// Function to process a query
async function processQuery(query, namespace) {
    const sanitizedQuery = query.trim(); // Remove leading/trailing whitespace
    if (!sanitizedQuery) {
        console.error("Query is empty. Cannot process.");
        return [];
    }
    const embedding = await getEmbedding(sanitizedQuery);
    return await queryPinecone(embedding, namespace);
}

// Function to generate an AI response with retrieved context
export async function generateResponse(query, retrievedDocs) {
    // Initialize the language model. You can adjust 'temperature' for creativity.
    const llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
    });

    // Create a context block by joining all retrieved documents
    const context = retrievedDocs.join("\n");

    // Construct the prompt by combining the context with the user query
    const prompt = `Here is some relevant context:
${context}

Based on the above context, please answer the following question:
${query}

Provide a detailed and useful response.`;

    // Call the language model with the prompt and return its response
    const response = await llm.call({ prompt });
    return response;
}

// Example usage for testing the full pipeline
async function main() {
    try {
        const namespace = "your-namespace";  // Replace with your actual namespace
        const query = "What healthy low calorie dinner ideas do you recommend?"; // Sample query

        // Retrieve relevant documents from Pinecone
        const retrievedDocs = await processQuery(query, namespace);
        console.log("Retrieved Documents:", retrievedDocs);
        
        // Use the retrieved documents to generate an AI response
        const finalResponse = await generateResponse(query, retrievedDocs);
        console.log("Final AI Response:", finalResponse);
    } catch (error) {
        console.error("Error during processing:", error);
    }
}

main();