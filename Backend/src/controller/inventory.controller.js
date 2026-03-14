const {
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
} = require('../services/inventory.service');

async function createWarehouse(req, res) {
  const result = await createWarehouseService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function getWarehouses(req, res) {
  const result = await getWarehousesService();
  return res.status(result.statusCode).json(result.data);
}

async function assignWarehouse(req, res) {
  const result = await assignWarehouseService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function getUserWarehouses(req, res) {
  const result = await getUserWarehousesService();
  return res.status(result.statusCode).json(result.data);
}

async function createCategory(req, res) {
  const result = await createCategoryService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function getCategories(req, res) {
  const result = await getCategoriesService();
  return res.status(result.statusCode).json(result.data);
}

async function createProduct(req, res) {
  const result = await createProductService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function getProducts(req, res) {
  const result = await getProductsService();
  return res.status(result.statusCode).json(result.data);
}

async function createStock(req, res) {
  const result = await createStockService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function getStock(req, res) {
  const result = await getStockService();
  return res.status(result.statusCode).json(result.data);
}

async function createReceipt(req, res) {
  const result = await createReceiptService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function createReceiptItem(req, res) {
  const result = await createReceiptItemService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function createDelivery(req, res) {
  const result = await createDeliveryService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function createDeliveryItem(req, res) {
  const result = await createDeliveryItemService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function createTransfer(req, res) {
  const result = await createTransferService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function createTransferItem(req, res) {
  const result = await createTransferItemService(req.body);
  return res.status(result.statusCode).json(result.data ? { data: result.data, message: result.message } : { message: result.message });
}

async function adjustStock(req, res) {
  const result = await adjustStockService(req.body);
  return res.status(result.statusCode).json({ message: result.message });
}

async function getProductBySku(req, res) {
  const result = await getProductBySkuService({ sku: req.params.sku });
  return res.status(result.statusCode).json(result.data ? result.data : { message: result.message });
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
  adjustStock,
  getProductBySku,
};
