const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsf9k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

run().catch(console.dir);

// Collection reference
const assignmentsCollection = client.db("studyHive").collection("assignments");

app.post('/assignments', async (req, res) => {
  try {
    const assignment = req.body;
    const result = await assignmentsCollection.insertOne(assignment);
    res.status(201).send({ message: 'Assignment created successfully!', result });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).send({ message: 'Failed to create assignment.', error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
