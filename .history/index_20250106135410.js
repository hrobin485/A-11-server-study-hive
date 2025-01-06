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
      const assignments = await assignmentsCollection.find().toArray(); 
      res.status(200).send(assignments); 
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).send({ message: 'Failed to fetch assignments.', error });
    }
  });


  app.delete('/assignments/:id', async (req, res) => {
    const assignmentId = req.params.id;
    const { userEmail } = req.body; 
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
    const { id } = req.params; 
    try {
        const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });

        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }
        res.status(200).json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).send('Failed to fetch the assignment.');
    }
});



app.put('/assignments/:id', async (req, res) => {
    const { id } = req.params; 
    const { title, description, marks, difficulty, dueDate, email } = req.body; 
    try {
        const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });

        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }

        if (assignment.email !== email) {
            return res.status(403).send('You are not authorized to update this assignment.');
        }

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


// submissions
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
      const submissions = await submissionsCollection.find().toArray();
      res.status(200).json(submissions); // Ensure this sends an array of submissions
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Failed to fetch submissions.' });
    }
  });
  

  app.get('/submissions/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const submission = await submissionsCollection.findOne({ _id: new ObjectId(id) });
      if (!submission) {
        return res.status(404).send('Submission not found');
      }
      res.json(submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).send('Failed to fetch submission details');
    }
  });
  
  app.post('/give-mark/:id', async (req, res) => {
    const { id } = req.params;
    const { marks, feedback } = req.body;
  
    try {
      const result = await submissionsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            obtainMarks: parseInt(marks),
            feedback,
            status: 'completed' // Update status to 'completed'
          }
        }
      );
  
      if (result.modifiedCount > 0) {
        res.status(200).send('Marks and feedback given successfully.');
      } else {
        res.status(404).send('Submission not found.');
      }
    } catch (error) {
      console.error('Error updating marks and status:', error);
      res.status(500).send('Failed to give marks.');
    }
  });
  
// In your backend API (Node.js/Express)

// In your backend API (Node.js/Express)
// In your backend API (Node.js/Express)

app.get('/submissions', async (req, res) => {
    const userEmail = req.query.email; // Get email from query params
    
    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    try {
      // Query the database for submissions where email matches userEmail
      const submissions = await Submission.find({ email: userEmail });
      
      if (submissions.length === 0) {
        return res.status(404).json({ error: 'No attempted assignments found.' });
      }
      
      res.json(submissions); // Send filtered assignments back to frontend
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch attempted assignments.' });
    }
  });
  
  
  
  
  
  
  



  
  
  




app.get('/',(req, res) => {
    res.send('Study Hive is a platform')
})

app.listen(port, () => {
    console.log(`Study hive is waiting at: ${port}`)
})