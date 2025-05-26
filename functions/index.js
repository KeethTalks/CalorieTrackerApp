/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// Import RAG functions
const {processQuery, generateResponse} = require("../queryProcessor");

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint to handle RAG queries
app.post("/rag-query", async (req, res) => {
  try {
    const {query, namespace} = req.body;
    if (!query || !namespace) {
      return res.status(400).json({error: "Missing query or namespace"});
    }

    // Retrieve relevant documents
    const retrievedDocs = await processQuery(query, namespace);

    // Generate AI response
    const aiResponse = await generateResponse(query, retrievedDocs);

    res.json({response: aiResponse});
  } catch (error) {
    console.error("Error processing RAG request:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

// Expose API function
exports.api = functions.https.onRequest(app);
