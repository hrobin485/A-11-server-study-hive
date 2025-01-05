const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',(req, res) => {
    res.send('Study Hive is a platform')
})

app.listen(port, () => {
    console.log(`Study hive is waiting at: ${port}`)
})