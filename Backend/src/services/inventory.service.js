const {
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
} = require('../repositories/inventory.repository');

function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveInt(value) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null;
  }
  return numberValue;
}

function parseNonNegativeInt(value) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 0) {
    return null;
  }
  return numberValue;
}

function mapDbError(error, fallbackMessage) {
  if (error && error.code === '23505') {
    return { statusCode: 409, message: 'record already exists' };
  }

  if (error && error.code === '23503') {
    return { statusCode: 400, message: 'invalid reference id provided' };
  }

  return { statusCode: 500, message: fallbackMessage };
}

async function createWarehouseService({ name, location, manager }) {
  const cleanName = toCleanString(name);
  const cleanLocation = toCleanString(location);
  const cleanManager = toCleanString(manager);

  if (!cleanName || !cleanLocation || !cleanManager) {
    return { statusCode: 400, message: 'name, location and manager are required' };
  }

  try {
    const warehouse = await createWarehouse({
      name: cleanName,
      location: cleanLocation,
      manager: cleanManager,
    });

    return { statusCode: 201, message: 'warehouse created successfully', data: warehouse };
  } catch (error) {
    return mapDbError(error, 'failed to create warehouse');
  }
}

async function getWarehousesService() {
  const warehouses = await getWarehouses();
  return { statusCode: 200, data: warehouses };
}

async function assignWarehouseService({ user_id, warehouse_id }) {
  const userId = toCleanString(user_id);
  const warehouseId = parsePositiveInt(warehouse_id);

  if (!userId || !warehouseId) {
    return { statusCode: 400, message: 'user_id and warehouse_id are required' };
  }

  try {
    const assignment = await assignWarehouse({ userId, warehouseId });
    return { statusCode: 201, message: 'warehouse assigned successfully', data: assignment };
  } catch (error) {
    if (error && error.code === '23505') {
      return { statusCode: 409, message: 'warehouse already assigned to this user' };
    }

    return mapDbError(error, 'failed to assign warehouse');
  }
}

async function getUserWarehousesService() {
  const rows = await getUserWarehouses();
  return { statusCode: 200, data: rows };
}

async function createCategoryService({ name }) {
  const cleanName = toCleanString(name);

  if (!cleanName) {
    return { statusCode: 400, message: 'name is required' };
  }

  try {
    const category = await createCategory({ name: cleanName });
    return { statusCode: 201, message: 'category created successfully', data: category };
  } catch (error) {
    return mapDbError(error, 'failed to create category');
  }
}

async function getCategoriesService() {
  const categories = await getCategories();
  return { statusCode: 200, data: categories };
}

async function createProductService({ name, sku, category_id, unit }) {
  const cleanName = toCleanString(name);
  const cleanSku = toCleanString(sku);
  const cleanUnit = toCleanString(unit);
  const categoryId = parsePositiveInt(category_id);

  if (!cleanName || !cleanSku || !categoryId || !cleanUnit) {
    return { statusCode: 400, message: 'name, sku, category_id and unit are required' };
  }

  try {
    const product = await createProduct({
      name: cleanName,
      sku: cleanSku,
      categoryId,
      unit: cleanUnit,
    });

    return { statusCode: 201, message: 'product created successfully', data: product };
  } catch (error) {
    return mapDbError(error, 'failed to create product');
  }
}

async function getProductsService() {
  const products = await getProducts();
  return { statusCode: 200, data: products };
}

async function createStockService({ product_id, warehouse_id, quantity }) {
  const productId = parsePositiveInt(product_id);
  const warehouseId = parsePositiveInt(warehouse_id);
  const parsedQuantity = parseNonNegativeInt(quantity);

  if (!productId || !warehouseId || parsedQuantity === null) {
    return { statusCode: 400, message: 'product_id, warehouse_id and quantity are required' };
  }

  try {
    const stock = await createStock({ productId, warehouseId, quantity: parsedQuantity });
    return { statusCode: 201, message: 'stock created successfully', data: stock };
  } catch (error) {
    return mapDbError(error, 'failed to create stock');
  }
}

async function getStockService() {
  const stockRows = await getStock();
  return { statusCode: 200, data: stockRows };
}

async function createReceiptService({ supplier_name, warehouse_id, status }) {
  const supplierName = toCleanString(supplier_name);
  const warehouseId = parsePositiveInt(warehouse_id);
  const cleanStatus = toCleanString(status);

  if (!supplierName || !warehouseId || !cleanStatus) {
    return { statusCode: 400, message: 'supplier_name, warehouse_id and status are required' };
  }

  try {
    const receipt = await createReceipt({ supplierName, warehouseId, status: cleanStatus });
    return { statusCode: 201, message: 'receipt created successfully', data: receipt };
  } catch (error) {
    return mapDbError(error, 'failed to create receipt');
  }
}

async function createReceiptItemService({ receipt_id, product_id, quantity }) {
  const receiptId = parsePositiveInt(receipt_id);
  const productId = parsePositiveInt(product_id);
  const parsedQuantity = parsePositiveInt(quantity);

  if (!receiptId || !productId || !parsedQuantity) {
    return { statusCode: 400, message: 'receipt_id, product_id and quantity are required' };
  }

  try {
    const item = await createReceiptItem({ receiptId, productId, quantity: parsedQuantity });
    return { statusCode: 201, message: 'receipt item created successfully', data: item };
  } catch (error) {
    return mapDbError(error, 'failed to create receipt item');
  }
}

async function createDeliveryService({ customer_name, warehouse_id, status }) {
  const customerName = toCleanString(customer_name);
  const warehouseId = parsePositiveInt(warehouse_id);
  const cleanStatus = toCleanString(status);

  if (!customerName || !warehouseId || !cleanStatus) {
    return { statusCode: 400, message: 'customer_name, warehouse_id and status are required' };
  }

  try {
    const delivery = await createDelivery({ customerName, warehouseId, status: cleanStatus });
    return { statusCode: 201, message: 'delivery created successfully', data: delivery };
  } catch (error) {
    return mapDbError(error, 'failed to create delivery');
  }
}

async function createDeliveryItemService({ delivery_id, product_id, quantity }) {
  const deliveryId = parsePositiveInt(delivery_id);
  const productId = parsePositiveInt(product_id);
  const parsedQuantity = parsePositiveInt(quantity);

  if (!deliveryId || !productId || !parsedQuantity) {
    return { statusCode: 400, message: 'delivery_id, product_id and quantity are required' };
  }

  try {
    const item = await createDeliveryItem({ deliveryId, productId, quantity: parsedQuantity });
    return { statusCode: 201, message: 'delivery item created successfully', data: item };
  } catch (error) {
    return mapDbError(error, 'failed to create delivery item');
  }
}

async function createTransferService({ from_warehouse, to_warehouse, status }) {
  const fromWarehouse = parsePositiveInt(from_warehouse);
  const toWarehouse = parsePositiveInt(to_warehouse);
  const cleanStatus = toCleanString(status);

  if (!fromWarehouse || !toWarehouse || !cleanStatus) {
    return { statusCode: 400, message: 'from_warehouse, to_warehouse and status are required' };
  }

  if (fromWarehouse === toWarehouse) {
    return { statusCode: 400, message: 'from_warehouse and to_warehouse must be different' };
  }

  try {
    const transfer = await createTransfer({ fromWarehouse, toWarehouse, status: cleanStatus });
    return { statusCode: 201, message: 'transfer created successfully', data: transfer };
  } catch (error) {
    return mapDbError(error, 'failed to create transfer');
  }
}

async function createTransferItemService({ transfer_id, product_id, quantity }) {
  const transferId = parsePositiveInt(transfer_id);
  const productId = parsePositiveInt(product_id);
  const parsedQuantity = parsePositiveInt(quantity);

  if (!transferId || !productId || !parsedQuantity) {
    return { statusCode: 400, message: 'transfer_id, product_id and quantity are required' };
  }

  try {
    const item = await createTransferItem({ transferId, productId, quantity: parsedQuantity });
    return { statusCode: 201, message: 'transfer item created successfully', data: item };
  } catch (error) {
    return mapDbError(error, 'failed to create transfer item');
  }
}

async function adjustStockService({ product_id, warehouse_id, new_quantity, reason }) {
  const productId = parsePositiveInt(product_id);
  const warehouseId = parsePositiveInt(warehouse_id);
  const newQuantity = parseNonNegativeInt(new_quantity);
  const cleanReason = toCleanString(reason);

  if (!productId || !warehouseId || newQuantity === null || !cleanReason) {
    return { statusCode: 400, message: 'product_id, warehouse_id, new_quantity and reason are required' };
  }

  const stockRow = await getProductStockQuantity({ productId, warehouseId });
  if (!stockRow) {
    return {
      statusCode: 404,
      message: 'No stock record found for given product and warehouse',
    };
  }

  try {
    await adjustStockQuantity({
      productId,
      warehouseId,
      oldQuantity: stockRow.quantity,
      newQuantity,
      reason: cleanReason,
    });

    return { statusCode: 200, message: 'Stock adjusted successfully' };
  } catch (error) {
    return mapDbError(error, 'failed to adjust stock');
  }
}

async function getProductBySkuService({ sku }) {
  const cleanSku = toCleanString(sku);

  if (!cleanSku) {
    return { statusCode: 400, message: 'sku is required' };
  }

  const rows = await findProductBySku(cleanSku);
  if (!rows.length) {
    return { statusCode: 404, message: 'Product not found' };
  }

  return { statusCode: 200, data: rows };
}

module.exports = {
  createWarehouseService,
  getWarehousesService,
  assignWarehouseService,
  getUserWarehousesService,
  createCategoryService,
  getCategoriesService,
  createProductService,
  getProductsService,
  createStockService,
  getStockService,
  createReceiptService,
  createReceiptItemService,
  createDeliveryService,
  createDeliveryItemService,
  createTransferService,
  createTransferItemService,
  adjustStockService,
  getProductBySkuService,
};
