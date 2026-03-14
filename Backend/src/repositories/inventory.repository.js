const { pool } = require('../config/database');
const {
  INSERT_WAREHOUSE_QUERY,
  GET_WAREHOUSES_QUERY,
  GET_WAREHOUSES_BY_USER_QUERY,
  INSERT_USER_WAREHOUSE_QUERY,
  GET_USER_WAREHOUSES_QUERY,
  INSERT_CATEGORY_QUERY,
  GET_CATEGORIES_QUERY,
  INSERT_PRODUCT_QUERY,
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
} = require('../queries/inventory.queries');

// Warehouses
async function createWarehouse({ name, location, manager }) {
  const result = await pool.query(INSERT_WAREHOUSE_QUERY, [name, location, manager]);
  return result.rows[0];
}

async function getWarehouses(userId) {
  const result = userId
    ? await pool.query(GET_WAREHOUSES_BY_USER_QUERY, [userId])
    : await pool.query(GET_WAREHOUSES_QUERY);
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

// Categories
async function createCategory({ name }) {
  const result = await pool.query(INSERT_CATEGORY_QUERY, [name]);
  return result.rows[0];
}

async function getCategories() {
  const result = await pool.query(GET_CATEGORIES_QUERY);
  return result.rows;
}

async function getCategoryProductCount(categoryId) {
  const result = await pool.query(GET_CATEGORY_PRODUCTS_COUNT_QUERY, [categoryId]);
  return parseInt(result.rows[0]?.product_count || '0', 10);
}

async function deleteCategoryById(categoryId) {
  await pool.query(DELETE_CATEGORY_QUERY, [categoryId]);
}

// Products
async function createProduct({ name, sku, categoryId, unit }) {
  const result = await pool.query(INSERT_PRODUCT_QUERY, [name, sku, categoryId, unit]);
  return result.rows[0];
}

async function getProductsWithStock(userId) {
  const result = userId
    ? await pool.query(GET_PRODUCTS_WITH_STOCK_BY_USER_QUERY, [userId])
    : await pool.query(GET_PRODUCTS_WITH_STOCK_QUERY);
  return result.rows;
}

// Stock
async function createStock({ productId, warehouseId, quantity }) {
  const result = await pool.query(INSERT_STOCK_QUERY, [productId, warehouseId, quantity]);
  return result.rows[0];
}

async function getStock(userId) {
  const result = userId
    ? await pool.query(GET_STOCK_BY_USER_QUERY, [userId])
    : await pool.query(GET_STOCK_QUERY);
  return result.rows;
}

async function increaseStockInTx(client, productId, warehouseId, quantity) {
  const existing = await client.query(CHECK_STOCK_ROW_QUERY, [productId, warehouseId]);
  if (existing.rows.length > 0) {
    await client.query(INCREASE_STOCK_QUERY, [productId, warehouseId, quantity]);
  } else {
    await client.query(INSERT_STOCK_QUERY, [productId, warehouseId, quantity]);
  }
}

async function decreaseStockInTx(client, productId, warehouseId, quantity) {
  await client.query(DECREASE_STOCK_QUERY, [productId, warehouseId, quantity]);
}

// Receipts
async function createReceiptWithItem({ supplierName, warehouseId, status, productId, quantity }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const receiptResult = await client.query(INSERT_RECEIPT_QUERY, [supplierName, warehouseId, status]);
    const receipt = receiptResult.rows[0];

    await client.query(INSERT_RECEIPT_ITEM_QUERY, [receipt.receipt_id, productId, quantity]);

    if (status === 'Done') {
      await increaseStockInTx(client, productId, warehouseId, quantity);
    }

    await client.query('COMMIT');
    return receipt;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getReceipts() {
  const result = await pool.query(GET_RECEIPTS_QUERY);
  return result.rows;
}

async function validateReceipt(receiptId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const receiptResult = await client.query(GET_RECEIPT_BY_ID_QUERY, [receiptId]);
    const receipt = receiptResult.rows[0];
    if (!receipt) throw Object.assign(new Error('receipt not found'), { statusCode: 404 });
    if (receipt.status === 'Done') throw Object.assign(new Error('receipt already validated'), { statusCode: 409 });

    await client.query(UPDATE_RECEIPT_STATUS_QUERY, [receiptId, 'Done']);

    const items = await client.query(GET_RECEIPT_ITEMS_QUERY, [receiptId]);
    for (const item of items.rows) {
      await increaseStockInTx(client, item.product_id, receipt.warehouse_id, item.quantity);
    }

    await client.query('COMMIT');
    return { receipt_id: receiptId, status: 'Done' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Deliveries
async function createDeliveryWithItem({ customerName, warehouseId, status, productId, quantity }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deliveryResult = await client.query(INSERT_DELIVERY_QUERY, [customerName, warehouseId, status]);
    const delivery = deliveryResult.rows[0];

    await client.query(INSERT_DELIVERY_ITEM_QUERY, [delivery.delivery_id, productId, quantity]);

    if (status === 'Done') {
      const stockRes = await client.query(
        'SELECT COALESCE(quantity, 0)::int AS quantity FROM stock WHERE product_id = $1 AND warehouse_id = $2 FOR UPDATE LIMIT 1',
        [productId, warehouseId]
      );
      const available = stockRes.rows[0]?.quantity ?? 0;
      if (available < quantity) {
        throw Object.assign(
          new Error(`Insufficient stock. Available: ${available}, requested: ${quantity}`),
          { statusCode: 409 }
        );
      }
      await decreaseStockInTx(client, productId, warehouseId, quantity);
    }

    await client.query('COMMIT');
    return delivery;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getDeliveries() {
  const result = await pool.query(GET_DELIVERIES_QUERY);
  return result.rows;
}

async function validateDelivery(deliveryId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deliveryResult = await client.query(GET_DELIVERY_BY_ID_QUERY, [deliveryId]);
    const delivery = deliveryResult.rows[0];
    if (!delivery) throw Object.assign(new Error('delivery not found'), { statusCode: 404 });
    if (delivery.status === 'Done') throw Object.assign(new Error('delivery already validated'), { statusCode: 409 });

    const items = await client.query(GET_DELIVERY_ITEMS_QUERY, [deliveryId]);
    // Pre-check stock availability with row-level lock to prevent overdraft
    for (const item of items.rows) {
      const stockRes = await client.query(
        'SELECT COALESCE(quantity, 0)::int AS quantity FROM stock WHERE product_id = $1 AND warehouse_id = $2 FOR UPDATE LIMIT 1',
        [item.product_id, delivery.warehouse_id]
      );
      const available = stockRes.rows[0]?.quantity ?? 0;
      if (available < item.quantity) {
        const pRes = await client.query('SELECT name FROM products WHERE product_id = $1', [item.product_id]);
        const pName = pRes.rows[0]?.name || `Product #${item.product_id}`;
        throw Object.assign(
          new Error(`Insufficient stock for "${pName}". Available: ${available}, requested: ${item.quantity}`),
          { statusCode: 409 }
        );
      }
    }

    await client.query(UPDATE_DELIVERY_STATUS_QUERY, [deliveryId, 'Done']);
    for (const item of items.rows) {
      await decreaseStockInTx(client, item.product_id, delivery.warehouse_id, item.quantity);
    }

    await client.query('COMMIT');
    return { delivery_id: deliveryId, status: 'Done' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Transfers
async function createTransferWithItem({ fromWarehouse, toWarehouse, status, productId, quantity }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const transferResult = await client.query(INSERT_TRANSFER_QUERY, [fromWarehouse, toWarehouse, status]);
    const transfer = transferResult.rows[0];

    await client.query(INSERT_TRANSFER_ITEM_QUERY, [transfer.transfer_id, productId, quantity]);

    if (status === 'Done') {
      const stockRes = await client.query(
        'SELECT COALESCE(quantity, 0)::int AS quantity FROM stock WHERE product_id = $1 AND warehouse_id = $2 FOR UPDATE LIMIT 1',
        [productId, fromWarehouse]
      );
      const available = stockRes.rows[0]?.quantity ?? 0;
      if (available < quantity) {
        throw Object.assign(
          new Error(`Insufficient stock in source warehouse. Available: ${available}, requested: ${quantity}`),
          { statusCode: 409 }
        );
      }
      await decreaseStockInTx(client, productId, fromWarehouse, quantity);
      await increaseStockInTx(client, productId, toWarehouse, quantity);
    }

    await client.query('COMMIT');
    return transfer;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getTransfers() {
  const result = await pool.query(GET_TRANSFERS_QUERY);
  return result.rows;
}

async function validateTransfer(transferId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const transferResult = await client.query(GET_TRANSFER_BY_ID_QUERY, [transferId]);
    const transfer = transferResult.rows[0];
    if (!transfer) throw Object.assign(new Error('transfer not found'), { statusCode: 404 });
    if (transfer.status === 'Done') throw Object.assign(new Error('transfer already completed'), { statusCode: 409 });

    const items = await client.query(GET_TRANSFER_ITEMS_QUERY, [transferId]);
    // Pre-check stock availability with row-level lock
    for (const item of items.rows) {
      const stockRes = await client.query(
        'SELECT COALESCE(quantity, 0)::int AS quantity FROM stock WHERE product_id = $1 AND warehouse_id = $2 FOR UPDATE LIMIT 1',
        [item.product_id, transfer.from_warehouse]
      );
      const available = stockRes.rows[0]?.quantity ?? 0;
      if (available < item.quantity) {
        const pRes = await client.query('SELECT name FROM products WHERE product_id = $1', [item.product_id]);
        const pName = pRes.rows[0]?.name || `Product #${item.product_id}`;
        throw Object.assign(
          new Error(`Insufficient stock for "${pName}" in source warehouse. Available: ${available}, requested: ${item.quantity}`),
          { statusCode: 409 }
        );
      }
    }

    await client.query(UPDATE_TRANSFER_STATUS_QUERY, [transferId, 'Done']);
    for (const item of items.rows) {
      await decreaseStockInTx(client, item.product_id, transfer.from_warehouse, item.quantity);
      await increaseStockInTx(client, item.product_id, transfer.to_warehouse, item.quantity);
    }

    await client.query('COMMIT');
    return { transfer_id: transferId, status: 'Done' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Adjustments
async function getAdjustments() {
  const result = await pool.query(GET_ADJUSTMENTS_QUERY);
  return result.rows;
}

async function adjustStockQuantity({ productId, warehouseId, oldQuantity, newQuantity, reason }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(INSERT_ADJUSTMENT_QUERY, [productId, warehouseId, oldQuantity, newQuantity, reason]);
    await client.query(UPDATE_STOCK_QUANTITY_QUERY, [newQuantity, productId, warehouseId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getProductStockQuantity({ productId, warehouseId }) {
  const result = await pool.query(GET_STOCK_QUANTITY_QUERY, [productId, warehouseId]);
  return result.rows[0] || null;
}

async function findProductBySku(sku) {
  const result = await pool.query(GET_PRODUCT_BY_SKU_QUERY, [sku]);
  return result.rows;
}

async function getProductTotalStock(productId) {
  const result = await pool.query(GET_PRODUCT_TOTAL_STOCK_QUERY, [productId]);
  return Number(result.rows[0]?.total_stock || 0);
}

async function deleteProductById(productId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(DELETE_ADJUSTMENTS_BY_PRODUCT_QUERY, [productId]);
    await client.query(DELETE_TRANSFER_ITEMS_BY_PRODUCT_QUERY, [productId]);
    await client.query(DELETE_DELIVERY_ITEMS_BY_PRODUCT_QUERY, [productId]);
    await client.query(DELETE_RECEIPT_ITEMS_BY_PRODUCT_QUERY, [productId]);
    await client.query(DELETE_PRODUCT_STOCK_ROWS_QUERY, [productId]);

    const deleted = await client.query(DELETE_PRODUCT_QUERY, [productId]);
    await client.query('COMMIT');
    return deleted.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getWarehouseTotalStock(warehouseId) {
  const result = await pool.query(GET_WAREHOUSE_TOTAL_STOCK_QUERY, [warehouseId]);
  return Number(result.rows[0]?.total_stock || 0);
}

async function getWarehouseStockDetails(warehouseId) {
  const result = await pool.query(GET_WAREHOUSE_STOCK_DETAILS_QUERY, [warehouseId]);
  return result.rows;
}

async function deleteWarehouseById(warehouseId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(DELETE_ADJUSTMENTS_BY_WAREHOUSE_QUERY, [warehouseId]);
    await client.query(DELETE_TRANSFERS_BY_WAREHOUSE_QUERY, [warehouseId]);
    await client.query(DELETE_DELIVERIES_BY_WAREHOUSE_QUERY, [warehouseId]);
    await client.query(DELETE_RECEIPTS_BY_WAREHOUSE_QUERY, [warehouseId]);
    await client.query(DELETE_WAREHOUSE_ASSIGNMENTS_QUERY, [warehouseId]);
    await client.query(DELETE_WAREHOUSE_STOCK_ROWS_QUERY, [warehouseId]);

    const deleted = await client.query(DELETE_WAREHOUSE_QUERY, [warehouseId]);
    await client.query('COMMIT');
    return deleted.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createWarehouse,
  getWarehouses,
  assignWarehouse,
  getUserWarehouses,
  createCategory,
  getCategories,
  getCategoryProductCount,
  deleteCategoryById,
  createProduct,
  getProductsWithStock,
  createStock,
  getStock,
  createReceiptWithItem,
  getReceipts,
  validateReceipt,
  createDeliveryWithItem,
  getDeliveries,
  validateDelivery,
  createTransferWithItem,
  getTransfers,
  validateTransfer,
  getAdjustments,
  getProductStockQuantity,
  adjustStockQuantity,
  findProductBySku,
  getProductTotalStock,
  deleteProductById,
  getWarehouseTotalStock,
  getWarehouseStockDetails,
  deleteWarehouseById,
};
