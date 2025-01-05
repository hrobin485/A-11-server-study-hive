const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsf9k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db('studyHive');
    const assignmentsCollection = db.collection('assignments');

    // API to create an assignment
    app.post('/assignments', async (req, res) => {
        try {
            const assignment = req.body;
            console.log('Received assignment:', assignment); // Log the incoming data
            const result = await assignmentsCollection.insertOne(assignment);
            console.log('Database insert result:', result); // Log the MongoDB response
            res.status(201).send({ message: 'Assignment created successfully!', result });
        } catch (error) {
            console.error('Error creating assignment:', error);
            res.status(500).send({ message: 'Failed to create assignment.' });
        }
    });
    

    // API to get all assignments
    app.get('/assignments', async (req, res) => {
      try {
        const assignments = await assignmentsCollection.find().toArray();
        res.status(200).send(assignments);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).send({ message: 'Failed to fetch assignments.' });
      }
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Study Hive is a platform');
});

app.listen(port, () => {
  console.log(`Study Hive server is running at: ${port}`);
});
