import { Router } from 'express';
import upload from '../middleware/multer';

import {
  test,
  createProductAttribute,
  getProductAttribute,
  getAllProductAttributes,
  createProductAttributeValue,
  getProductAttributeValuesByAttributeId,
  createProductVariantAttribute,
  getAllProductVariantAttributes,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createCategory,
  getAllCategories,
  createProductVariant,
  getProductVariantById,
  updateProductVariant,
  uploadProductImage,
  getAllProductImages,
  deleteProductImage,
  getProductVariantDetails,
  checkProductVariantAvailabilityAndCalculateAmounts,
} from '../controllers/product.controller';

const router = Router();

router.get('/test', test);

// product attribute routes
router.post('/admin/product-attributes', createProductAttribute);
router.get('/admin/product-attributes/:id', getProductAttribute);
router.get('/admin/product-attributes', getAllProductAttributes);

// Attribute value routes
router.post('/admin/attribute-values', createProductAttributeValue);
router.get('/admin/attribute-values/:attributeId', getProductAttributeValuesByAttributeId);

// Product Variant Attribute routes
router.post('/admin/product-variant-attribute', createProductVariantAttribute);
router.get('/admin/product-variant-attributes', getAllProductVariantAttributes);

// Product routes
router.post('/admin/product', createProduct);
router.get('/admin/product', getAllProducts);
router.get('/admin/product/:id', getProductById);
router.patch('/admin/product/:id', updateProduct);
router.delete('/admin/product/:id', deleteProduct);

// Category routes
router.post('/admin/categories', createCategory);
router.get('/admin/categories', getAllCategories);

// Product Variant
router.post('/admin/product-variant', createProductVariant);
router.get('/admin/product-variant/:id', getProductVariantById);
router.patch('/admin/product-variant/:id', updateProductVariant);

// Product Images
router.post(
  '/admin/product-images',
  upload.single('image'),
  uploadProductImage,
);
router.get('/admin/product-images', getAllProductImages);
router.delete('/admin/product-images/:id', deleteProductImage);

//Get product variant details for cart items
router.get('/cart-item-service/:productVariantId', getProductVariantDetails);

// Order service related routes
router.post(
  '/product-variant-prices',
  checkProductVariantAvailabilityAndCalculateAmounts,
);

export default router;
