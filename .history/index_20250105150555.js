const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();  // Load environment variables
const port = process.env.PORT || 5000;  // Define port
const { MongoClient, ServerApiVersion } = require('mongodb');  // MongoDB client

// Middleware
app.use(cors());  // Enable CORS
app.use(express.json());  // Enable JSON parsing

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsf9k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("MongoDB connected successfully!");

    // Assignments collection
    const assignmentsCollection = client.db("studyHive").collection("assignments");

    // API to create assignments
    app.post('/assignments', async (req, res) => {
      try {
        const assignment = req.body;  // Get assignment data from request
        console.log('Received assignment:', assignment);

        const result = await assignmentsCollection.insertOne(assignment);  // Insert assignment into MongoDB
        res.status(201).send({ message: 'Assignment created successfully!', result });
      } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).send({ message: 'Failed to create assignment.', error });
      }
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

// Start server
app.get('/', (req, res) => {
  res.send('Study Hive is a platform');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
