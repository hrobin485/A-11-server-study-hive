const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let assignmentsCollection;

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('studyHive'); // Use 'studyHive' as the database name
    assignmentsCollection = db.collection('assignments'); // Use 'assignments' as the collection name
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
run().catch(console.dir);

// Routes
app.get('/', (req, res) => {
  res.send('Study Hive is a platform');
});

// POST Endpoint to Add Assignment
app.post('/assignments', async (req, res) => {
  try {
    const assignmentData = req.body; // Receive assignment data from the client
    console.log('Received Data:', assignmentData);

    const result = await assignmentsCollection.insertOne(assignmentData); // Insert into MongoDB
    res.status(201).send({ message: 'Assignment created successfully!', result });
  } catch (error) {
    console.error('Error saving assignment:', error);
    res.status(500).send({ message: 'Failed to save assignment.' });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Study Hive server is running at: http://localhost:${port}`);
});
