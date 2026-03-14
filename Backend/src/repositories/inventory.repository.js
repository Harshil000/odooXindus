const { pool } = require('../config/database');
const {
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
} = require('../queries/inventory.queries');

async function createWarehouse({ name, location, manager }) {
  const result = await pool.query(INSERT_WAREHOUSE_QUERY, [name, location, manager]);
  return result.rows[0];
}

async function getWarehouses() {
  const result = await pool.query(GET_WAREHOUSES_QUERY);
  return result.rows;
}

async function assignWarehouse({ userId, warehouseId }) {
  const result = await pool.query(INSERT_USER_WAREHOUSE_QUERY, [userId, warehouseId]);
  return result.rows[0];
}

async function getUserWarehouses() {
  const result = await pool.query(GET_USER_WAREHOUSES_QUERY);
  return result.rows;
}

async function createCategory({ name }) {
  const result = await pool.query(INSERT_CATEGORY_QUERY, [name]);
  return result.rows[0];
}

async function getCategories() {
  const result = await pool.query(GET_CATEGORIES_QUERY);
  return result.rows;
}

async function createProduct({ name, sku, categoryId, unit }) {
  const result = await pool.query(INSERT_PRODUCT_QUERY, [name, sku, categoryId, unit]);
  return result.rows[0];
}

async function getProducts() {
  const result = await pool.query(GET_PRODUCTS_QUERY);
  return result.rows;
}

async function createStock({ productId, warehouseId, quantity }) {
  const result = await pool.query(INSERT_STOCK_QUERY, [productId, warehouseId, quantity]);
  return result.rows[0];
}

async function getStock() {
  const result = await pool.query(GET_STOCK_QUERY);
  return result.rows;
}

async function createReceipt({ supplierName, warehouseId, status }) {
  const result = await pool.query(INSERT_RECEIPT_QUERY, [supplierName, warehouseId, status]);
  return result.rows[0];
}

async function createReceiptItem({ receiptId, productId, quantity }) {
  const result = await pool.query(INSERT_RECEIPT_ITEM_QUERY, [receiptId, productId, quantity]);
  return result.rows[0];
}

async function createDelivery({ customerName, warehouseId, status }) {
  const result = await pool.query(INSERT_DELIVERY_QUERY, [customerName, warehouseId, status]);
  return result.rows[0];
}

async function createDeliveryItem({ deliveryId, productId, quantity }) {
  const result = await pool.query(INSERT_DELIVERY_ITEM_QUERY, [deliveryId, productId, quantity]);
  return result.rows[0];
}

async function createTransfer({ fromWarehouse, toWarehouse, status }) {
  const result = await pool.query(INSERT_TRANSFER_QUERY, [fromWarehouse, toWarehouse, status]);
  return result.rows[0];
}

async function createTransferItem({ transferId, productId, quantity }) {
  const result = await pool.query(INSERT_TRANSFER_ITEM_QUERY, [transferId, productId, quantity]);
  return result.rows[0];
}

async function getProductStockQuantity({ productId, warehouseId }) {
  const result = await pool.query(GET_STOCK_QUANTITY_QUERY, [productId, warehouseId]);
  return result.rows[0] || null;
}

async function adjustStockQuantity({ productId, warehouseId, oldQuantity, newQuantity, reason }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const adjustmentResult = await client.query(INSERT_ADJUSTMENT_QUERY, [
      productId,
      warehouseId,
      oldQuantity,
      newQuantity,
      reason,
    ]);

    const stockResult = await client.query(UPDATE_STOCK_QUANTITY_QUERY, [
      newQuantity,
      productId,
      warehouseId,
    ]);

    await client.query('COMMIT');

    return {
      adjustment: adjustmentResult.rows[0],
      stock: stockResult.rows[0] || null,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findProductBySku(sku) {
  const result = await pool.query(GET_PRODUCT_BY_SKU_QUERY, [sku]);
  return result.rows;
}

module.exports = {
  createWarehouse,
  getWarehouses,
  assignWarehouse,
  getUserWarehouses,
  createCategory,
  getCategories,
  createProduct,
  getProducts,
  createStock,
  getStock,
  createReceipt,
  createReceiptItem,
  createDelivery,
  createDeliveryItem,
  createTransfer,
  createTransferItem,
  getProductStockQuantity,
  adjustStockQuantity,
  findProductBySku,
};
