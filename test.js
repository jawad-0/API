const express = require('express');
const sql = require('mssql');

const app = express();
const port = 8000;

const config = {
    user: 'sa',
    password: 'admin123',
    server: '127.0.0.1',
    database: 'WEB_API_TEST',
    options: {
      encrypt: false,
    },
  };

// Example SQL query
const query = 'SELECT * FROM Department';

app.get('/get', async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(config);

    // Execute the query
    const result = await sql.query(query);

    // Send the result as JSON
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the connection
    sql.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


// node api basic code

// const express = require('express')

// const app = express()

// port = 8000

// const Cars = [
//     {name: "AUDI" , Model: "A8" , Technology: "TFSI"}
// ]

// app.get('/' , (req , res) => {
//     res.json(Cars)
// })

// app.listen(port , () =>{
//     console.log(`listening on port ${port}`)
// })
