const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsf9k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
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

app.get('/assignments', async (req, res) => {
    try {
      const assignments = await assignmentsCollection.find().toArray(); // Fetch all assignments from the database
      res.status(200).send(assignments); // Send assignments to the frontend
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).send({ message: 'Failed to fetch assignments.', error });
    }
  });


  app.delete('/assignments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { userEmail } = req.body;  // Replace 'userEmail' with actual authentication/user context
      const assignmentToDelete = await assignmentsCollection.findOne({ _id: id });
  
      if (assignmentToDelete && assignmentToDelete.createdBy === userEmail) {
        const result = await assignmentsCollection.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
          res.status(200).send({ message: 'Assignment deleted successfully!' });
        } else {
          throw new Error('Failed to delete the assignment.');
        }
      } else {
        res.status(403).send({ message: 'You are not authorized to delete this assignment.' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Failed to delete assignment.', error });
    }
  });
  
  




app.get('/',(req, res) => {
    res.send('Study Hive is a platform')
})

app.listen(port, () => {
    console.log(`Study hive is waiting at: ${port}`)
})