const express = require("express");
const { sql, pool } = require("./database");

const paperRouter = express.Router();

let printedPapersQuery = "SELECT DISTINCT c.c_title, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Printed'";
let approvedPapersQuery = "SELECT DISTINCT c.c_title, p.status FROM Course c JOIN Paper p ON c.c_id = p.c_id WHERE p.status = 'Approved'";

paperRouter.get('/getPrintedPapers', async (req, res) => {
  try {
    await pool.connect();
    const request = pool.request();
    const result = await request.query(printedPapersQuery);
    res.status(200).json(result.recordset);
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

paperRouter.get('/SearchPrintedPapers', async (req, res) => {
  try {
    const { courseTitle } = req.query;
    await pool.connect();
    const request = pool.request();
    let query = printedPapersQuery;

    if (courseTitle) {
      query += ` AND c.c_title LIKE @courseTitle`;
      request.input('courseTitle', sql.NVarChar, `%${courseTitle}%`);
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

paperRouter.get('/getApprovedPapers', async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(approvedPapersQuery);
    res.status(200).json(result.recordset);
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

paperRouter.get('/SearchApprovedPapers', async (req, res) => {
  try {
    const { courseTitle } = req.query;
    await pool.connect();
    const request = pool.request();
    let query = approvedPapersQuery;

    if (courseTitle) {
      query += ` AND c.c_title LIKE @courseTitle`;
      request.input('courseTitle', sql.NVarChar, `%${courseTitle}%`);
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (ex) {
    console.error('Exception:', ex);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
});

module.exports = paperRouter;