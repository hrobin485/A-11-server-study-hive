const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
const submissionsCollection = client.db("studyHive").collection("submissions");

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
    const assignmentId = req.params.id;
    const { userEmail } = req.body; // Get user email from the request body
  
    try {
      const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(assignmentId) });
  
      if (!assignment) {
        return res.status(404).send('Assignment not found.');
      }
  
      if (assignment.email !== userEmail) {
        return res.status(403).send('You are not authorized to delete this assignment.');
      }
  
      await assignmentsCollection.deleteOne({ _id: new ObjectId(assignmentId) });
      res.status(200).send('Assignment deleted successfully.');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).send('Failed to delete the assignment.');
    }
  });
  

  app.get('/assignments/:id', async (req, res) => {
    const { id } = req.params; // Extract the ID from the URL parameters

    try {
        // Find the assignment in the collection
        const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });

        // If no assignment is found, send a 404 response
        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }

        // If found, send the assignment data
        res.status(200).json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).send('Failed to fetch the assignment.');
    }
});



app.put('/assignments/:id', async (req, res) => {
    const { id } = req.params; // Get the assignment ID from the URL
    const { title, description, marks, difficulty, dueDate, email } = req.body; // Get the updated data from the request body

    try {
        // Find the assignment by ID
        const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });

        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }

        // Check if the logged-in user's email matches the assignment creator's email
        if (assignment.email !== email) {
            return res.status(403).send('You are not authorized to update this assignment.');
        }

        // Update the assignment in the database
        const updateResult = await assignmentsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title,
                    description,
                    marks,
                    difficulty,
                    dueDate,
                },
            }
        );

        res.status(200).send({ message: 'Assignment updated successfully!', result: updateResult });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).send('Failed to update the assignment.');
    }
});


// Backend: POST /submissions
app.post('/submissions', async (req, res) => {
    try {
        const { assignmentId, googleDocsLink, notes, email, status } = req.body;

        // Assume we have a function `getAssignmentMarks` to fetch the assignment marks
        const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(assignmentId) });
        const assignmentMarks = assignment ? assignment.marks : 0; // Default to 0 if not available

        const newSubmission = {
            assignmentId,
            assignmentTitle: assignment ? assignment.title : '',
            googleDocsLink,
            notes,
            email,
            status,
            marks: assignmentMarks, // Add the assignment marks from the fetched data
        };

        const result = await submissionsCollection.insertOne(newSubmission);
        res.status(201).send({ message: 'Submission created successfully!', result });
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).send({ message: 'Failed to create submission.', error });
    }
});

app.get('/submissions', async (req, res) => {
    try {
        const submissions = await submissionsCollection.find().toArray(); // Fetch all submissions
        res.status(200).send(submissions); // Send submissions as response
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).send({ message: 'Failed to fetch submissions.', error });
    }
});

  

app.post('/GiveMark/:submissionId', async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { marks, feedback } = req.body;
  
      const result = await submissionsCollection.updateOne(
        { _id: new ObjectId(submissionId) },
        {
          $set: {
            marks,
            feedback,
            status: 'graded', // Update status to 'graded' if needed
          },
        }
      );
  
      if (result.matchedCount > 0) {
        res.status(200).send({ message: 'Marks and feedback updated successfully.' });
      } else {
        res.status(404).send({ message: 'Submission not found.' });
      }
    } catch (error) {
      console.error('Error updating marks and feedback:', error);
      res.status(500).send({ message: 'Failed to update marks and feedback.', error });
    }
  });
  


  
  
  




app.get('/',(req, res) => {
    res.send('Study Hive is a platform')
})

app.listen(port, () => {
    console.log(`Study hive is waiting at: ${port}`)
})