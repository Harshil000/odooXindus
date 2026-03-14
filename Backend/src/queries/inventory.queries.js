const INSERT_WAREHOUSE_QUERY = `
  INSERT INTO warehouses (name, location, manager)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const GET_WAREHOUSES_QUERY = `
  SELECT *
  FROM warehouses
  ORDER BY warehouse_id DESC;
`;

const GET_WAREHOUSES_BY_USER_QUERY = `
  SELECT w.*
  FROM user_warehouses uw
  JOIN warehouses w ON uw.warehouse_id = w.warehouse_id
  WHERE uw.user_id = $1
  ORDER BY w.warehouse_id DESC;
`;

const INSERT_USER_WAREHOUSE_QUERY = `
  INSERT INTO user_warehouses (user_id, warehouse_id)
  VALUES ($1, $2)
  RETURNING *;
`;

const GET_USER_WAREHOUSES_QUERY = `
  SELECT u.user_id, u.name AS user_name, w.warehouse_id, w.name AS warehouse_name, uw.assigned_at
  FROM user_warehouses uw
  JOIN users u ON uw.user_id = u.user_id
  JOIN warehouses w ON uw.warehouse_id = w.warehouse_id
  ORDER BY uw.assigned_at DESC;
`;

const INSERT_CATEGORY_QUERY = `
  INSERT INTO categories (name)
  VALUES ($1)
  RETURNING *;
`;

const GET_CATEGORIES_QUERY = `
  SELECT *
  FROM categories
  ORDER BY category_id DESC;
`;

const INSERT_PRODUCT_QUERY = `
  INSERT INTO products (name, sku, category_id, unit)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

const GET_PRODUCTS_QUERY = `
  SELECT p.*, c.name AS category
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.category_id
  ORDER BY p.product_id DESC;
`;

const INSERT_STOCK_QUERY = `
  INSERT INTO stock (product_id, warehouse_id, quantity)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const GET_STOCK_QUERY = `
  SELECT s.stock_id, s.quantity, p.product_id, p.name AS product, w.warehouse_id, w.name AS warehouse
  FROM stock s
  JOIN products p ON s.product_id = p.product_id
  JOIN warehouses w ON s.warehouse_id = w.warehouse_id
  ORDER BY s.stock_id DESC;
`;

const GET_STOCK_BY_USER_QUERY = `
  SELECT s.stock_id, s.quantity, p.product_id, p.name AS product, w.warehouse_id, w.name AS warehouse
  FROM stock s
  JOIN products p ON s.product_id = p.product_id
  JOIN warehouses w ON s.warehouse_id = w.warehouse_id
  JOIN user_warehouses uw ON uw.warehouse_id = s.warehouse_id
  WHERE uw.user_id = $1
  ORDER BY s.stock_id DESC;
`;

const INSERT_RECEIPT_QUERY = `
  INSERT INTO receipts (supplier_name, warehouse_id, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const INSERT_RECEIPT_ITEM_QUERY = `
  INSERT INTO receipt_items (receipt_id, product_id, quantity)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const INSERT_DELIVERY_QUERY = `
  INSERT INTO deliveries (customer_name, warehouse_id, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const INSERT_DELIVERY_ITEM_QUERY = `
  INSERT INTO delivery_items (delivery_id, product_id, quantity)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const INSERT_TRANSFER_QUERY = `
  INSERT INTO transfers (from_warehouse, to_warehouse, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const INSERT_TRANSFER_ITEM_QUERY = `
  INSERT INTO transfer_items (transfer_id, product_id, quantity)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const GET_STOCK_QUANTITY_QUERY = `
  SELECT quantity
  FROM stock
  WHERE product_id = $1 AND warehouse_id = $2
  LIMIT 1;
`;

const INSERT_ADJUSTMENT_QUERY = `
  INSERT INTO adjustments (product_id, warehouse_id, old_quantity, new_quantity, reason)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

const UPDATE_STOCK_QUANTITY_QUERY = `
  UPDATE stock
  SET quantity = $1
  WHERE product_id = $2 AND warehouse_id = $3
  RETURNING *;
`;

const GET_PRODUCT_BY_SKU_QUERY = `
  SELECT
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
  WHERE p.sku = $1;
`;

// Products with total stock across all warehouses (for frontend list)
const GET_PRODUCTS_WITH_STOCK_QUERY = `
  SELECT
    p.product_id  AS id,
    p.name,
    p.sku,
    p.unit        AS uom,
    p.category_id,
    COALESCE(c.name, 'Uncategorized') AS cat,
    COALESCE(SUM(s.quantity), 0)::int AS stock
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN stock s ON p.product_id = s.product_id
  GROUP BY p.product_id, p.name, p.sku, p.unit, p.category_id, c.name
  ORDER BY p.product_id DESC;
`;

const GET_PRODUCTS_WITH_STOCK_BY_USER_QUERY = `
  SELECT
    p.product_id  AS id,
    p.name,
    p.sku,
    p.unit        AS uom,
    p.category_id,
    COALESCE(c.name, 'Uncategorized') AS cat,
    COALESCE(SUM(s.quantity), 0)::int AS stock
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN stock s ON p.product_id = s.product_id
    AND s.warehouse_id IN (
      SELECT warehouse_id FROM user_warehouses WHERE user_id = $1
    )
  WHERE
    EXISTS (
      SELECT 1
      FROM stock sx
      JOIN user_warehouses uwx ON uwx.warehouse_id = sx.warehouse_id
      WHERE sx.product_id = p.product_id
        AND uwx.user_id = $1
    )
    OR NOT EXISTS (
      SELECT 1 FROM stock sn WHERE sn.product_id = p.product_id
    )
  GROUP BY p.product_id, p.name, p.sku, p.unit, p.category_id, c.name
  ORDER BY p.product_id DESC;
`;

// Receipts list joined with warehouse + first item (frontend shows one product per receipt)
const GET_RECEIPTS_QUERY = `
  SELECT
    r.receipt_id,
    r.supplier_name AS supplier,
    r.status,
    TO_CHAR(r.created_at, 'YYYY-MM-DD') AS date,
    w.name          AS wh,
    r.warehouse_id,
    COALESCE(p.name, '')     AS product,
    COALESCE(ri.product_id,  0)  AS product_id,
    COALESCE(ri.quantity,    0)  AS qty
  FROM receipts r
  LEFT JOIN warehouses w    ON r.warehouse_id  = w.warehouse_id
  LEFT JOIN receipt_items ri ON ri.receipt_id = r.receipt_id
  LEFT JOIN products p      ON p.product_id   = ri.product_id
  ORDER BY r.receipt_id DESC;
`;

const GET_RECEIPT_BY_ID_QUERY = `
  SELECT * FROM receipts WHERE receipt_id = $1 LIMIT 1;
`;

const GET_RECEIPT_ITEMS_QUERY = `
  SELECT product_id, quantity FROM receipt_items WHERE receipt_id = $1;
`;

const UPDATE_RECEIPT_STATUS_QUERY = `
  UPDATE receipts SET status = $2 WHERE receipt_id = $1 RETURNING *;
`;

// Deliveries list
const GET_DELIVERIES_QUERY = `
  SELECT
    d.delivery_id,
    d.customer_name AS customer,
    d.status,
    TO_CHAR(d.created_at, 'YYYY-MM-DD') AS date,
    w.name          AS wh,
    d.warehouse_id,
    COALESCE(p.name, '')     AS product,
    COALESCE(di.product_id,  0)  AS product_id,
    COALESCE(di.quantity,    0)  AS qty
  FROM deliveries d
  LEFT JOIN warehouses w     ON d.warehouse_id  = w.warehouse_id
  LEFT JOIN delivery_items di ON di.delivery_id = d.delivery_id
  LEFT JOIN products p       ON p.product_id    = di.product_id
  ORDER BY d.delivery_id DESC;
`;

const GET_DELIVERY_BY_ID_QUERY = `
  SELECT * FROM deliveries WHERE delivery_id = $1 LIMIT 1;
`;

const GET_DELIVERY_ITEMS_QUERY = `
  SELECT product_id, quantity FROM delivery_items WHERE delivery_id = $1;
`;

const UPDATE_DELIVERY_STATUS_QUERY = `
  UPDATE deliveries SET status = $2 WHERE delivery_id = $1 RETURNING *;
`;

// Transfers list
const GET_TRANSFERS_QUERY = `
  SELECT
    t.transfer_id,
    t.status,
    TO_CHAR(t.created_at, 'YYYY-MM-DD') AS date,
    fw.name         AS "from",
    tw.name         AS "to",
    t.from_warehouse,
    t.to_warehouse,
    COALESCE(p.name, '')     AS product,
    COALESCE(ti.product_id,  0)  AS product_id,
    COALESCE(ti.quantity,    0)  AS qty
  FROM transfers t
  LEFT JOIN warehouses fw   ON t.from_warehouse = fw.warehouse_id
  LEFT JOIN warehouses tw   ON t.to_warehouse   = tw.warehouse_id
  LEFT JOIN transfer_items ti ON ti.transfer_id = t.transfer_id
  LEFT JOIN products p      ON p.product_id     = ti.product_id
  ORDER BY t.transfer_id DESC;
`;

const GET_TRANSFER_BY_ID_QUERY = `
  SELECT * FROM transfers WHERE transfer_id = $1 LIMIT 1;
`;

const GET_TRANSFER_ITEMS_QUERY = `
  SELECT product_id, quantity FROM transfer_items WHERE transfer_id = $1;
`;

const UPDATE_TRANSFER_STATUS_QUERY = `
  UPDATE transfers SET status = $2 WHERE transfer_id = $1 RETURNING *;
`;

// Adjustments list
const GET_ADJUSTMENTS_QUERY = `
  SELECT
    a.adjustment_id,
    a.old_quantity AS recorded,
    a.new_quantity AS counted,
    a.reason,
    TO_CHAR(a.created_at, 'YYYY-MM-DD') AS date,
    p.name AS product,
    w.name AS location
  FROM adjustments a
  JOIN products p  ON a.product_id  = p.product_id
  JOIN warehouses w ON a.warehouse_id = w.warehouse_id
  ORDER BY a.adjustment_id DESC;
`;

// Stock helpers for validate flows
const CHECK_STOCK_ROW_QUERY = `
  SELECT stock_id, quantity FROM stock
  WHERE product_id = $1 AND warehouse_id = $2
  LIMIT 1;
`;

const INCREASE_STOCK_QUERY = `
  UPDATE stock SET quantity = quantity + $3
  WHERE product_id = $1 AND warehouse_id = $2
  RETURNING *;
`;

const DECREASE_STOCK_QUERY = `
  UPDATE stock SET quantity = GREATEST(0, quantity - $3)
  WHERE product_id = $1 AND warehouse_id = $2
  RETURNING *;
`;

const GET_PRODUCT_TOTAL_STOCK_QUERY = `
  SELECT COALESCE(SUM(quantity), 0)::int AS total_stock
  FROM stock
  WHERE product_id = $1;
`;

const DELETE_PRODUCT_STOCK_ROWS_QUERY = `
  DELETE FROM stock
  WHERE product_id = $1;
`;

const DELETE_RECEIPT_ITEMS_BY_PRODUCT_QUERY = `
  DELETE FROM receipt_items
  WHERE product_id = $1;
`;

const DELETE_DELIVERY_ITEMS_BY_PRODUCT_QUERY = `
  DELETE FROM delivery_items
  WHERE product_id = $1;
`;

const DELETE_TRANSFER_ITEMS_BY_PRODUCT_QUERY = `
  DELETE FROM transfer_items
  WHERE product_id = $1;
`;

const DELETE_ADJUSTMENTS_BY_PRODUCT_QUERY = `
  DELETE FROM adjustments
  WHERE product_id = $1;
`;

const DELETE_PRODUCT_QUERY = `
  DELETE FROM products
  WHERE product_id = $1
  RETURNING product_id;
`;

const GET_WAREHOUSE_TOTAL_STOCK_QUERY = `
  SELECT COALESCE(SUM(quantity), 0)::int AS total_stock
  FROM stock
  WHERE warehouse_id = $1;
`;

const DELETE_WAREHOUSE_ASSIGNMENTS_QUERY = `
  DELETE FROM user_warehouses
  WHERE warehouse_id = $1;
`;

const DELETE_WAREHOUSE_STOCK_ROWS_QUERY = `
  DELETE FROM stock
  WHERE warehouse_id = $1;
`;

const DELETE_WAREHOUSE_QUERY = `
  DELETE FROM warehouses
  WHERE warehouse_id = $1
  RETURNING warehouse_id;
`;

const GET_WAREHOUSE_STOCK_DETAILS_QUERY = `
  SELECT
    s.product_id,
    p.name AS product,
    p.sku,
    s.quantity
  FROM stock s
  JOIN products p ON p.product_id = s.product_id
  WHERE s.warehouse_id = $1 AND s.quantity > 0
  ORDER BY p.name;
`;

const DELETE_ADJUSTMENTS_BY_WAREHOUSE_QUERY = `
  DELETE FROM adjustments
  WHERE warehouse_id = $1;
`;

const DELETE_TRANSFERS_BY_WAREHOUSE_QUERY = `
  DELETE FROM transfers
  WHERE from_warehouse = $1 OR to_warehouse = $1;
`;

const DELETE_DELIVERIES_BY_WAREHOUSE_QUERY = `
  DELETE FROM deliveries
  WHERE warehouse_id = $1;
`;

const DELETE_RECEIPTS_BY_WAREHOUSE_QUERY = `
  DELETE FROM receipts
  WHERE warehouse_id = $1;
`;

const GET_CATEGORY_PRODUCTS_COUNT_QUERY = `
  SELECT COUNT(*) AS product_count
  FROM products
  WHERE category_id = $1;
`;

const DELETE_CATEGORY_QUERY = `
  DELETE FROM categories
  WHERE category_id = $1
  RETURNING *;
`;

module.exports = {
  INSERT_WAREHOUSE_QUERY,
  GET_WAREHOUSES_QUERY,
  GET_WAREHOUSES_BY_USER_QUERY,
  INSERT_USER_WAREHOUSE_QUERY,
  GET_USER_WAREHOUSES_QUERY,
  INSERT_CATEGORY_QUERY,
  GET_CATEGORIES_QUERY,
  INSERT_PRODUCT_QUERY,
  GET_PRODUCTS_QUERY,
  GET_PRODUCTS_WITH_STOCK_QUERY,
  GET_PRODUCTS_WITH_STOCK_BY_USER_QUERY,
  INSERT_STOCK_QUERY,
  GET_STOCK_QUERY,
  GET_STOCK_BY_USER_QUERY,
  INSERT_RECEIPT_QUERY,
  INSERT_RECEIPT_ITEM_QUERY,
  GET_RECEIPTS_QUERY,
  GET_RECEIPT_BY_ID_QUERY,
  GET_RECEIPT_ITEMS_QUERY,
  UPDATE_RECEIPT_STATUS_QUERY,
  INSERT_DELIVERY_QUERY,
  INSERT_DELIVERY_ITEM_QUERY,
  GET_DELIVERIES_QUERY,
  GET_DELIVERY_BY_ID_QUERY,
  GET_DELIVERY_ITEMS_QUERY,
  UPDATE_DELIVERY_STATUS_QUERY,
  INSERT_TRANSFER_QUERY,
  INSERT_TRANSFER_ITEM_QUERY,
  GET_TRANSFERS_QUERY,
  GET_TRANSFER_BY_ID_QUERY,
  GET_TRANSFER_ITEMS_QUERY,
  UPDATE_TRANSFER_STATUS_QUERY,
  GET_ADJUSTMENTS_QUERY,
  GET_STOCK_QUANTITY_QUERY,
  INSERT_ADJUSTMENT_QUERY,
  UPDATE_STOCK_QUANTITY_QUERY,
  GET_PRODUCT_BY_SKU_QUERY,
  CHECK_STOCK_ROW_QUERY,
  INCREASE_STOCK_QUERY,
  DECREASE_STOCK_QUERY,
  GET_PRODUCT_TOTAL_STOCK_QUERY,
  DELETE_PRODUCT_STOCK_ROWS_QUERY,
  DELETE_RECEIPT_ITEMS_BY_PRODUCT_QUERY,
  DELETE_DELIVERY_ITEMS_BY_PRODUCT_QUERY,
  DELETE_TRANSFER_ITEMS_BY_PRODUCT_QUERY,
  DELETE_ADJUSTMENTS_BY_PRODUCT_QUERY,
  DELETE_PRODUCT_QUERY,
  GET_WAREHOUSE_TOTAL_STOCK_QUERY,
  DELETE_WAREHOUSE_ASSIGNMENTS_QUERY,
  DELETE_WAREHOUSE_STOCK_ROWS_QUERY,
  DELETE_WAREHOUSE_QUERY,
  GET_WAREHOUSE_STOCK_DETAILS_QUERY,
  DELETE_ADJUSTMENTS_BY_WAREHOUSE_QUERY,
  DELETE_TRANSFERS_BY_WAREHOUSE_QUERY,
  DELETE_DELIVERIES_BY_WAREHOUSE_QUERY,
  DELETE_RECEIPTS_BY_WAREHOUSE_QUERY,
  GET_CATEGORY_PRODUCTS_COUNT_QUERY,
  DELETE_CATEGORY_QUERY,
};
