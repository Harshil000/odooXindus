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

module.exports = {
  INSERT_WAREHOUSE_QUERY,
  GET_WAREHOUSES_QUERY,
  INSERT_USER_WAREHOUSE_QUERY,
  GET_USER_WAREHOUSES_QUERY,
  INSERT_CATEGORY_QUERY,
  GET_CATEGORIES_QUERY,
  INSERT_PRODUCT_QUERY,
  GET_PRODUCTS_QUERY,
  INSERT_STOCK_QUERY,
  GET_STOCK_QUERY,
  INSERT_RECEIPT_QUERY,
  INSERT_RECEIPT_ITEM_QUERY,
  INSERT_DELIVERY_QUERY,
  INSERT_DELIVERY_ITEM_QUERY,
  INSERT_TRANSFER_QUERY,
  INSERT_TRANSFER_ITEM_QUERY,
  GET_STOCK_QUANTITY_QUERY,
  INSERT_ADJUSTMENT_QUERY,
  UPDATE_STOCK_QUANTITY_QUERY,
  GET_PRODUCT_BY_SKU_QUERY,
};
