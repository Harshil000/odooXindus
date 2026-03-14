require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const PDFDocument = require("pdfkit");
const { pool } = require("./config/database");

const app = express();

app.use(express.json());
app.use(cookieParser());

function normalizeBody(body) {
  const normalized = {};
  Object.entries(body).forEach(([key, value]) => {
    const trimmed = key.trim();
    normalized[trimmed] = value;
  });
  return normalized;
}

function validateRequiredBodyFields(fields, body) {
  const missing = fields.filter(
    (key) => body[key] === undefined || body[key] === null,
  );
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }
  return true;
}

/* ===============================
   WAREHOUSES
================================*/

// Create warehouse
app.post("/warehouses", async (req, res) => {
  try {
    const body = normalizeBody(req.body);
    const { name, location, manager } = body;

    validateRequiredBodyFields(["name", "location", "manager"], body);

    const result = await pool.query(
      `INSERT INTO warehouses(name,location,manager)
             VALUES($1,$2,$3) RETURNING *`,
      [name, location, manager],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Get warehouses
app.get("/warehouses", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM warehouses`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   USER WAREHOUSE ASSIGNMENT
================================*/

app.post("/assign-warehouse", async (req, res) => {
  try {
    const { user_id, warehouse_id } = req.body;

    const result = await pool.query(
      `INSERT INTO user_warehouses(user_id,warehouse_id)
             VALUES($1,$2) RETURNING *`,
      [user_id, warehouse_id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user-warehouses", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT u.name, w.name AS warehouse
            FROM user_warehouses uw
            JOIN users u ON uw.user_id = u.user_id
            JOIN warehouses w ON uw.warehouse_id = w.warehouse_id
        `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   CATEGORIES
================================*/

app.post("/categories", async (req, res) => {
  try {
    const body = normalizeBody(req.body);
    const { name } = body;

    validateRequiredBodyFields(["name"], body);

    const result = await pool.query(
      `INSERT INTO categories(name)
             VALUES($1) RETURNING *`,
      [name],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get("/categories", async (req, res) => {
  const result = await pool.query(`SELECT * FROM categories`);
  res.json(result.rows);
});

/* ===============================
   PRODUCTS
================================*/

app.post("/products", async (req, res) => {
  try {
    const body = normalizeBody(req.body);
    const { name, sku, category_id, unit } = body;

    validateRequiredBodyFields(["name", "sku", "category_id", "unit"], body);

    const result = await pool.query(
      `INSERT INTO products(name,sku,category_id,unit)
             VALUES($1,$2,$3,$4) RETURNING *`,
      [name, sku, category_id, unit],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get("/products", async (req, res) => {
  const result = await pool.query(`
        SELECT p.*, c.name AS category
        FROM products p
        LEFT JOIN categories c
        ON p.category_id = c.category_id
    `);

  res.json(result.rows);
});

/* ===============================
   STOCK
================================*/

app.post("/stock", async (req, res) => {
  try {
    const body = normalizeBody(req.body);
    const { product_id, warehouse_id, quantity } = body;

    validateRequiredBodyFields(
      ["product_id", "warehouse_id", "quantity"],
      body,
    );

    const result = await pool.query(
      `INSERT INTO stock(product_id,warehouse_id,quantity)
             VALUES($1,$2,$3) RETURNING *`,
      [product_id, warehouse_id, quantity],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.get("/stock", async (req, res) => {
  const result = await pool.query(`
        SELECT s.quantity,
               p.name AS product,
               w.name AS warehouse
        FROM stock s
        JOIN products p ON s.product_id = p.product_id
        JOIN warehouses w ON s.warehouse_id = w.warehouse_id
    `);

  res.json(result.rows);
});

/* ===============================
   RECEIPTS (INCOMING STOCK)
================================*/

app.post("/receipts", async (req, res) => {
  try {
    const { supplier_name, warehouse_id, status } = req.body;

    const result = await pool.query(
      `INSERT INTO receipts(supplier_name,warehouse_id,status)
             VALUES($1,$2,$3) RETURNING *`,
      [supplier_name, warehouse_id, status],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add receipt items
app.post("/receipt-items", async (req, res) => {
  try {
    const { receipt_id, product_id, quantity } = req.body;

    const result = await pool.query(
      `INSERT INTO receipt_items(receipt_id,product_id,quantity)
             VALUES($1,$2,$3) RETURNING *`,
      [receipt_id, product_id, quantity],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   DELIVERIES (OUTGOING)
================================*/

app.post("/deliveries", async (req, res) => {
  try {
    const { customer_name, warehouse_id, status } = req.body;

    const result = await pool.query(
      `INSERT INTO deliveries(customer_name,warehouse_id,status)
             VALUES($1,$2,$3) RETURNING *`,
      [customer_name, warehouse_id, status],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delivery items
app.post("/delivery-items", async (req, res) => {
  try {
    const { delivery_id, product_id, quantity } = req.body;

    const result = await pool.query(
      `INSERT INTO delivery_items(delivery_id,product_id,quantity)
             VALUES($1,$2,$3) RETURNING *`,
      [delivery_id, product_id, quantity],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   TRANSFERS
================================*/

app.post("/transfers", async (req, res) => {
  try {
    const { from_warehouse, to_warehouse, status } = req.body;

    const result = await pool.query(
      `INSERT INTO transfers(from_warehouse,to_warehouse,status)
             VALUES($1,$2,$3) RETURNING *`,
      [from_warehouse, to_warehouse, status],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// transfer items
app.post("/transfer-items", async (req, res) => {
  try {
    const { transfer_id, product_id, quantity } = req.body;

    const result = await pool.query(
      `INSERT INTO transfer_items(transfer_id,product_id,quantity)
             VALUES($1,$2,$3) RETURNING *`,
      [transfer_id, product_id, quantity],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ADJUSTMENTS
================================*/

app.post("/adjustments", async (req, res) => {
  try {
    const { product_id, warehouse_id, new_quantity, reason } = req.body;

    validateRequiredBodyFields(
      ["product_id", "warehouse_id", "new_quantity", "reason"],
      req.body,
    );

    // get current stock
    const stockResult = await pool.query(
      `SELECT quantity FROM stock
             WHERE product_id=$1 AND warehouse_id=$2`,
      [product_id, warehouse_id],
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({
        error: "No stock record found for given product and warehouse",
      });
    }

    const old_quantity = stockResult.rows[0].quantity;

    // insert adjustment log
    await pool.query(
      `INSERT INTO adjustments
            (product_id,warehouse_id,old_quantity,new_quantity,reason)
            VALUES($1,$2,$3,$4,$5)`,
      [product_id, warehouse_id, old_quantity, new_quantity, reason],
    );

    // update stock
    await pool.query(
      `UPDATE stock
             SET quantity=$1
             WHERE product_id=$2 AND warehouse_id=$3`,
      [new_quantity, product_id, warehouse_id],
    );

    res.json({ message: "Stock adjusted successfully" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

/* ===============================
sku search


================================*/
app.get("/products/sku/:sku", async (req, res) => {
  try {
    const { sku } = req.params;

    const result = await pool.query(
      `SELECT 
                p.product_id,
                p.name,
                p.sku,
                p.unit,
                c.name AS category,
                w.name AS warehouse,
                s.quantity
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN stock s ON p.product_id = s.product_id
            LEFT JOIN warehouses w ON s.warehouse_id = w.warehouse_id
            WHERE p.sku = $1`,
      [sku],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// global error handler for synchronous middleware
app.use((err, req, res, next) => {
  res
    .status(err.statusCode || 500)
    .json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
