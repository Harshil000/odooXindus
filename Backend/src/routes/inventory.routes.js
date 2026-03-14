const express = require('express');
const inventoryController = require('../controller/inventory.controller');

const inventoryRoute = express.Router();

inventoryRoute.post('/warehouses', inventoryController.createWarehouse);
inventoryRoute.get('/warehouses', inventoryController.getWarehouses);

inventoryRoute.post('/assign-warehouse', inventoryController.assignWarehouse);
inventoryRoute.get('/user-warehouses', inventoryController.getUserWarehouses);

inventoryRoute.post('/categories', inventoryController.createCategory);
inventoryRoute.get('/categories', inventoryController.getCategories);

inventoryRoute.post('/products', inventoryController.createProduct);
inventoryRoute.get('/products', inventoryController.getProducts);
inventoryRoute.get('/products/sku/:sku', inventoryController.getProductBySku);

inventoryRoute.post('/stock', inventoryController.createStock);
inventoryRoute.get('/stock', inventoryController.getStock);

inventoryRoute.post('/receipts', inventoryController.createReceipt);
inventoryRoute.post('/receipt-items', inventoryController.createReceiptItem);

inventoryRoute.post('/deliveries', inventoryController.createDelivery);
inventoryRoute.post('/delivery-items', inventoryController.createDeliveryItem);

inventoryRoute.post('/transfers', inventoryController.createTransfer);
inventoryRoute.post('/transfer-items', inventoryController.createTransferItem);

inventoryRoute.post('/adjustments', inventoryController.adjustStock);

module.exports = inventoryRoute;
