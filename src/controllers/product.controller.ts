import prisma from '../config/prisma';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { uploadToBlobStorage } from '../utils/azureBlob';

//Test route
export const test = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Payment TEST',
    });
  } catch (error) {
    next(error);
  }
};

// Create product attribute
export const createProductAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    const newAttribute = await prisma.product_Attribute.create({
      data: {
        name,
      },
    });
    res.status(201).json({
      status: 'success',
      message: 'Product attribute added successfull',
      data: newAttribute,
    });
  } catch (error) {
    next(error);
  }
};

// Get a product attribute by ID (including its values)
export const getProductAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const attribute = await prisma.product_Attribute.findUnique({
      where: { id },
      include: {
        values: true,
      },
    });
    if (!attribute) {
      res.status(404).json({ error: 'Product attribute not found' });
    }
    res.status(201).json({
      status: 'success',
      message: 'Product attribute fetched successfull',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

// Get all product attributes with their values
export const getAllProductAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attributes = await prisma.product_Attribute.findMany({
      include: {
        values: true, // Include related Product_Attribute_Value entries for each attribute
      },
    });
    res.status(201).json({
      status: 'success',
      message: 'Product attributes fetched successfull',
      data: attributes,
    });
  } catch (error) {
    next(error);
  }
};

// Create a product attribute value
export const createProductAttributeValue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { value, attributeId } = req.body;

    const attributeExists = await prisma.product_Attribute.findUnique({
      where: { id: attributeId },
    });

    if (!attributeExists) {
      res.status(404).json({ message: 'Product Attribute not found' });
    }

    const newAttributeValue = await prisma.product_Attribute_Value.create({
      data: {
        value,
        attributeId,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Attribute values added successfull',
      data: newAttributeValue,
    });
  } catch (error) {
    next(error);
  }
};

// Get a product attribute value by attribute Id
export const getProductAttributeValuesByAttributeId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { attributeId } = req.params;

    // Fetch product attribute values linked to the attribute ID
    const attributeValues = await prisma.product_Attribute_Value.findMany({
      where: { attributeId },
      include: {
        attribute: false, // Includes associated Product_Attribute information
      },
    });

    if (!attributeValues.length) {
      res.status(404).json({
        message: 'No Product Attribute Values found for this attribute ID',
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Product Attribute Values found for this attribute ID',
      data: attributeValues,
    });
  } catch (error) {
    next(error);
  }
};

// Create a Product Variant Attribute
export const createProductVariantAttribute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productVariantId, attributeValueId } = req.body;

    const newProductVariantAttribute =
      await prisma.product_Variant_Attribute.create({
        data: {
          productVariantId,
          attributeValueId,
        },
      });

    res.status(201).json({
      status: 'success',
      message: 'Product variant attribute created successfull',
      data: newProductVariantAttribute,
    });
  } catch (error) {
    next(error);
  }
};

// Get all Product Variant Attributes
export const getAllProductVariantAttributes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    let limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

    // Ensure the limit is within reasonable bounds
    const MAX_LIMIT = 100;
    limit = Math.min(limit, MAX_LIMIT);

    const skip = (page - 1) * limit;

    const productVariantAttributes =
      await prisma.product_Variant_Attribute.findMany({
        skip,
        take: limit,
        include: {
          productVariant: true,
          attributeValue: true,
        },
      });

    const totalCount = await prisma.product_Variant_Attribute.count();
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: productVariantAttributes,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productName, description, specification, categoryId, adminId } =
      req.body;

    const newProduct = await prisma.product.create({
      data: {
        productName,
        description,
        specification,
        categoryId,
        adminId,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get all product
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;

    const MAX_LIMIT = 100;
    limit = Math.min(limit, MAX_LIMIT);

    const categoryId = req.query.categoryId as string | undefined;

    const skip = (page - 1) * limit;

    // Fetch products with filtering and pagination
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : {},
      skip,
      take: limit,
      include: {
        images: {
          where: { isHero: true },
        },
        variants: true,
      },
    });

    if (products.length === 0) {
      res.status(404).json({
        status: 'fail',
        message: 'No Products found',
      });
      return;
    }

    const formattedProducts = products.map(product => ({
      ...product,
      price: product.variants.reduce((min, variant) => variant.price < min ? variant.price : min, product.variants[0]?.price || 0),
    }));

    const totalCount = await prisma.product.count();
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 'success',
      message: 'products fetched successful',
      data: formattedProducts,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSearchedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query, category } = req.query;

    if (query) {
      const products = await prisma.product.findMany({
        where: {
          productName: {
            contains: query as string,
            mode: 'insensitive',
          },
        },
        include: {
          images: {
            where: { isHero: true },
          },
          variants: true,
        },
      });

      const formattedProducts = products.map(product => ({
        ...product,
        price: product.variants.reduce((min, variant) => variant.price < min ? variant.price : min, product.variants[0]?.price || 0),
      }));

      res.status(200).json({
        status: 'success',
        message: 'Products fetched successfully',
        data: formattedProducts,
      });
    } else if (category) {
      const products = await prisma.product.findMany({
        where: {
          category: {
            categoryName: {
              contains: category as string,
              mode: 'insensitive',
            },
          },
        },
        include: {
          images: {
            where: { isHero: true },
          },
          variants: true,
        },
      });

      const formattedProducts = products.map(product => ({
        ...product,
        price: product.variants.reduce((min, variant) => variant.price < min ? variant.price : min, product.variants[0]?.price || 0),
      }));

      res.status(200).json({
        status: 'success',
        message: 'Products fetched successfully',
        data: formattedProducts,
      });
    } 
  else {
    const products = await prisma.product.findMany({
      include: {
        images: {
          where: { isHero: true },
        },
        variants: true,
      },
    });

    const formattedProducts = products.map(product => ({
      ...product,
      price: product.variants.reduce((min, variant) => variant.price < min ? variant.price : min, product.variants[0]?.price || 0),
    }));

    res.status(200).json({
      status: 'success',
      message: 'Products fetched successfully',
      data: formattedProducts,
    });
  }
  } catch (error) {
    next(error);
  }
}

// Get Product by ID
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            attributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
        images: true, // Include all product images
        category: true, // Include category details
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Format the response for easier frontend integration
    const formattedProduct = {
      id: product.id,
      productName: product.productName,
      description: product.description,
      specification: product.specification,
      categoryId: product.categoryId,
      adminId: product.adminId,
      category: product.category,
      images: product.images,
      variants: product.variants.map(variant => ({
        id: variant.id,
        price: variant.price,
        stock: variant.stock,
        attributes: variant.attributes.map(attr => ({
          id: attr.id,
          value: attr.attributeValue.value,
          name: attr.attributeValue.attribute.name,
        })).sort((a, b) => a.name.localeCompare(b.name)),
      })),
    };

    res.status(200).json({
      status: 'success',
      message: 'Product fetched successfully',
      data: formattedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Update Product details
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { productName, description, specification, categoryId } = req.body;

    // Check if the product exists before attempting to update it
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({
        error: 'Product not found',
      });
    }

    // Proceed to update the product if it exists
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        productName,
        description,
        specification,
        categoryId,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Check if the product exists before attempting to update it
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({
        error: 'Product not found',
      });
    }

    // First, delete the associated product images and variants to avoid foreign key constraint violations
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.product_Variant.deleteMany({
      where: { productId: id },
    });

    // Now delete the product itself
    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Create a category
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryName } = req.body;

    // Create a new category in the database
    const newCategory = await prisma.category.create({
      data: {
        categoryName,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Parse pagination parameters from the query string
    const page = parseInt(req.query.page as string) || 1; // Default to page 1
    let limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page

    // Ensure the limit is within reasonable bounds
    const MAX_LIMIT = 100;
    limit = Math.min(limit, MAX_LIMIT);

    const skip = (page - 1) * limit;

    // Fetch paginated categories from the database
    const categories = await prisma.category.findMany({
      skip,
      take: limit,
      include: {
        products: true, // Include associated products if needed
      },
    });

    // Get total count for pagination metadata
    const totalCount = await prisma.category.count();
    const totalPages = Math.ceil(totalCount / limit);

    if (categories.length === 0) {
      res.status(404).json({
        status: 'fail',
        message: 'No categories found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: categories,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Product variant
export const createProductVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, price, stock } = req.body;

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    }

    // Create a new product variant
    const newProductVariant = await prisma.product_Variant.create({
      data: {
        price,
        stock,
        productId, // makes relation with productId of Product table
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Product variant added successfully',
      data: newProductVariant,
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Variant by Id
export const getProductVariantById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;

    // Fetch the product variant by ID
    const productVariants = await prisma.product_Variant.findMany({
      where: { productId },
      include: {
        attributes: true, // Include product variant attributes
      },
    });

    if (!productVariants) {
      res.status(404).json({ error: 'Product variant not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product variant fetched successfully',
      data: productVariants,
    });
  } catch (error) {
    next(error);
  }
};

// Update Product Variant
export const updateProductVariant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { price, stock, productId } = req.body;

    // Check if the product variant exists
    const productVariant = await prisma.product_Variant.findUnique({
      where: { id },
    });

    if (!productVariant) {
      res.status(404).json({ error: 'Product variant not found' });
    }

    // Update the product variant
    const updatedProductVariant = await prisma.product_Variant.update({
      where: { id },
      data: {
        price,
        stock,
        productId,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Product variant updated successfully',
      data: updatedProductVariant,
    });
  } catch (error) {
    next(error);
  }
};

// upload product-images
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, isHero } = req.body;

    // Validate product existence
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    }

    // Ensure file is provided
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Azure Blob Storage
    const imageUrl = await uploadToBlobStorage(
      req.file!.buffer,
      req.file!.originalname,
    );

    // Save image metadata in the database
    const newProductImage = await prisma.productImage.create({
      data: {
        imageUrl,
        isHero: Boolean(isHero),
        productId,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Product image uploaded successfully',
      data: newProductImage,
    });
  } catch (error) {
    next(error);
  }
};

// Get all product-images
export const getAllProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.query;

    // If `productId` is provided, filter images by product ID
    const filter = productId ? { where: { productId: String(productId) } } : {};

    const productImages = await prisma.productImage.findMany({
      where: filter?.where || {},
      orderBy: { isHero: 'desc' }, // Hero images come first
    });

    if (productImages.length === 0) {
      res.status(404).json({ message: 'No product images found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product images fetched successfully',
      data: productImages,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product-image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Validate product image existence
    const productImage = await prisma.productImage.findUnique({
      where: { id },
    });

    if (!productImage) {
      res.status(404).json({ error: 'Product image not found' });
    }

    // Delete image record from the database
    await prisma.productImage.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Product image deleted successfully from the database.',
    });
  } catch (error) {
    next(error);
  }
};

// get product variant details by id
export const getProductVariantDetails: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { productVariantId } = req.params;
  //  console.log("Received Product Variant ID:", productVariantId);

  try {
    const productVariantDetails = await prisma.product_Variant.findUnique({
      where: { id: productVariantId },
      include: {
        product: {
          include: {
            category: true,
            images: {
              where: { isHero: true },
            }
          },
        },
        attributes: {
          include: {
            attributeValue: {
              include: {
                attribute: true,
              },
            },
          },
        },
      },
    });
    if (!productVariantDetails) {
      res.status(404).json({ message: 'Product variant not found' });
      return;
    }

    res.status(200).json(productVariantDetails);
  } catch (error) {
    console.error('Error fetching product variant details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkProductVariantAvailabilityAndCalculateAmounts = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const variantIds = req.body;

  if (!variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
    res.status(400).json({
      status: false,
      data: null,
      message: 'Invalid product variant IDs',
    });
    return;
  }

  let totalAmount = 0;
  try {
    const variantDetails = [];

    for (const variant of variantIds) {
      const { variantId, quantity } = variant;

      if (!variantId) {
        return res.status(404).json({
          status: false,
          data: null,
          message: 'Variant ID required',
        });
      }

      const productVariant = await prisma.product_Variant.findUnique({
        where: { id: variantId },
      });

      if (!productVariant) {
        return res.status(404).json({
          status: false,
          data: null,
          message: 'Product variant not found',
        });
      }

      if (productVariant.stock < quantity) {
        return res.status(400).json({
          status: false,
          data: null,
          message: 'Insufficient stock',
        });
      }

      const currentVariantAmount = productVariant.price * quantity;

      totalAmount += currentVariantAmount;

      await prisma.product_Variant.update({
        where: { id: variantId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      variantDetails.push({
        product_variant_id: variantId,
        quantity,
        price: currentVariantAmount,
      });
    }

    res.status(200).json({
      status: true,
      data: {
        variantDetails: variantDetails,
        amount: totalAmount,
      },
      message: 'Product variant available',
    });
  } catch (error) {
    console.error('Error checking product variant availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
