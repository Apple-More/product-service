import { test,createProductAttribute ,
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
      deleteProductImage,getProductVariantDetails} from '../../src/controllers/product.controller';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import prisma from '../../src/config/prisma';
import { uploadToBlobStorage } from "../../src/utils/azureBlob";




// Mock the Prisma client
jest.mock('../../src/config/prisma', () => require('../../tests/mocks/mock-prisma'));

jest.mock("../../src/utils/azureBlob", () => ({
  uploadToBlobStorage: jest.fn(),
}));
const uploadToBlobStorageMock = uploadToBlobStorage as jest.Mock;


describe('test controller', () => {
    it('should respond with a success message', async () => {
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        await test(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Payment TEST',
        });
    });

    it('should handle errors by calling next', async () => {
        const req = {} as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(() => {
                throw new Error('Test error');
            }),
        } as unknown as Response;
        const next = jest.fn();

        await test(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe('createProductAttribute controller', () => {
  it('should create a new product attribute and return success', async () => {
      const req = {
          body: { name: 'Color' },
      } as Request;

      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      // Mock Prisma response
      const mockAttribute = { id: 1, name: 'Color' };
      (prisma.product_Attribute.create as jest.Mock).mockResolvedValue(mockAttribute);

      await createProductAttribute(req, res, next);

      expect(prisma.product_Attribute.create).toHaveBeenCalledWith({
          data: { name: 'Color' },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Product attribute added successfull',
          data: mockAttribute,
      });
  });

  it('should handle errors and call next with the error', async () => {
      const req = {
          body: { name: 'Invalid' },
      } as Request;

      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      // Mock Prisma to throw an error
      const mockError = new Error('Database error');
      (prisma.product_Attribute.create as jest.Mock).mockRejectedValue(mockError);

      await createProductAttribute(req, res, next);

      expect(prisma.product_Attribute.create).toHaveBeenCalledWith({
          data: { name: 'Invalid' },
      });
      expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe('getProductAttribute controller', () => {
  beforeEach(() => {
      jest.clearAllMocks(); // Reset mock calls
  });

  it('should return a product attribute with its values when found', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      const mockAttribute = {
          id: 1,
          name: 'Color',
          values: [{ id: 1, value: 'Red' }],
      };

      (prisma.product_Attribute.findUnique as jest.Mock).mockResolvedValue(mockAttribute);

      await getProductAttribute(req, res, next);

      expect(prisma.product_Attribute.findUnique).toHaveBeenCalledWith({
          where: { id: '1' },
          include: { values: true },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Product attribute fetched successfull',
          data: mockAttribute,
      });
  });

  it('should return 404 if the product attribute is not found', async () => {
      const req = { params: { id: '999' } } as unknown as Request;
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      (prisma.product_Attribute.findUnique as jest.Mock).mockResolvedValue(null);

      await getProductAttribute(req, res, next);

      expect(prisma.product_Attribute.findUnique).toHaveBeenCalledWith({
          where: { id: '999' },
          include: { values: true },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product attribute not found' });
  });

  it('should call next with an error if an exception occurs', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn();

      const mockError = new Error('Database error');
      (prisma.product_Attribute.findUnique as jest.Mock).mockRejectedValue(mockError);

      await getProductAttribute(req, res, next);

      expect(prisma.product_Attribute.findUnique).toHaveBeenCalledWith({
          where: { id: '1' },
          include: { values: true },
      });
      expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe('getAllProductAttributes controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();  // Clear mocks before each test
  });

  it('should fetch all product attributes successfull', async () => {
    const req = {} as Request;  // No params needed for this endpoint

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    // Mock Prisma response
    const mockAttributes = [
      { id: '1', name: 'Color', values: ['Red', 'Blue'] },
      { id: '2', name: 'Size', values: ['Small', 'Medium', 'Large'] },
    ];
    (prisma.product_Attribute.findMany as jest.Mock).mockResolvedValue(mockAttributes);

    await getAllProductAttributes(req, res, next);

    expect(prisma.product_Attribute.findMany).toHaveBeenCalledWith({
      include: { values: true },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product attributes fetched successfull',
      data: mockAttributes,
    });
  });

  it('should handle errors and call next with the error', async () => {
    const req = {} as Request;  // No params needed for this endpoint

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    // Mock Prisma to throw an error
    const mockError = new Error('Database error');
    (prisma.product_Attribute.findMany as jest.Mock).mockRejectedValue(mockError);

    await getAllProductAttributes(req, res, next);

    expect(prisma.product_Attribute.findMany).toHaveBeenCalledWith({
      include: { values: true },
    });
    expect(next).toHaveBeenCalledWith(mockError);  // The error should be passed to `next()`
  });
});

describe('createProductAttributeValue controller', () => {
  it('should create a new product attribute value successfully', async () => {
    const req = {
      body: { value: 'Red', attributeId: 1 },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    // Mock Prisma to return an existing product attribute
    const mockAttribute = { id: 1, name: 'Color' };
    (prisma.product_Attribute.findUnique as jest.Mock).mockResolvedValue(mockAttribute);

    const mockAttributeValue = { id: 1, value: 'Red', attributeId: 1 };
    (prisma.product_Attribute_Value.create as jest.Mock).mockResolvedValue(mockAttributeValue);

    await createProductAttributeValue(req, res, next);

    expect(prisma.product_Attribute.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prisma.product_Attribute_Value.create).toHaveBeenCalledWith({
      data: { value: 'Red', attributeId: 1 },
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Attribute values added successfull',
      data: mockAttributeValue,
    });
  });

  it('should return a 404 if the product attribute does not exist', async () => {
    const req = {
      body: { value: 'Red', attributeId: 1 },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    // Mock Prisma to return null for product attribute (i.e., attribute does not exist)
    (prisma.product_Attribute.findUnique as jest.Mock).mockResolvedValue(null);

    await createProductAttributeValue(req, res, next);

    expect(prisma.product_Attribute.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product Attribute not found',
    });
  });

  it('should handle errors and call next with the error', async () => {
    const req = {
      body: { value: 'Red', attributeId: 1 },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    // Mock Prisma to throw an error when creating product attribute value
    const mockError = new Error('Database error');
    (prisma.product_Attribute_Value.create as jest.Mock).mockRejectedValue(mockError);

    await createProductAttributeValue(req, res, next);

    expect(prisma.product_Attribute_Value.create).toHaveBeenCalledWith({
      data: { value: 'Red', attributeId: 1 },
    });

    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe('getProductAttributeValuesByAttributeId controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  it('should return product attribute values for a valid attributeId', async () => {
    const req = { params: { attributeId: '1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockAttributeValues = [
      { id: 1, value: 'Red', attributeId: 1 },
      { id: 2, value: 'Blue', attributeId: 1 },
    ];

    // Mock Prisma's findMany method to return mock data
    (prisma.product_Attribute_Value.findMany as jest.Mock).mockResolvedValue(mockAttributeValues);

    await getProductAttributeValuesByAttributeId(req, res, next);

    // Ensure Prisma is called with correct parameters
    expect(prisma.product_Attribute_Value.findMany).toHaveBeenCalledWith({
      where: { attributeId: '1' },
      include: { attribute: false },
    });

    // Ensure response status and data are as expected
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product Attribute Values found for this attribute ID',
      data: mockAttributeValues,
    });
  });

  it('should return 404 if no product attribute values are found', async () => {
    const req = { params: { attributeId: '999' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    // Mock Prisma's findMany method to return an empty array (no values found)
    (prisma.product_Attribute_Value.findMany as jest.Mock).mockResolvedValue([]);

    await getProductAttributeValuesByAttributeId(req, res, next);

    // Ensure Prisma is called with correct parameters
    expect(prisma.product_Attribute_Value.findMany).toHaveBeenCalledWith({
      where: { attributeId: '999' },
      include: { attribute: false },
    });

    // Ensure response status and message are as expected
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No Product Attribute Values found for this attribute ID',
    });
  });

  it('should handle errors and call next with the error', async () => {
    const req = { params: { attributeId: '1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockError = new Error('Database error');
    // Mock Prisma to throw an error
    (prisma.product_Attribute_Value.findMany as jest.Mock).mockRejectedValue(mockError);

    await getProductAttributeValuesByAttributeId(req, res, next);

    // Ensure Prisma is called with correct parameters
    expect(prisma.product_Attribute_Value.findMany).toHaveBeenCalledWith({
      where: { attributeId: '1' },
      include: { attribute: false },
    });

    // Ensure the next middleware is called with the error
    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe('createProductVariantAttribute controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  it('should create a new product variant attribute and return it', async () => {
    const req = {
      body: { productVariantId: '1', attributeValueId: '101' },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockNewProductVariantAttribute = {
      id: 1,
      productVariantId: '1',
      attributeValueId: '101',
    };

    // Mock Prisma's create method to return the mock new attribute
    (prisma.product_Variant_Attribute.create as jest.Mock).mockResolvedValue(mockNewProductVariantAttribute);

    await createProductVariantAttribute(req, res, next);

    // Ensure Prisma is called with correct parameters
    expect(prisma.product_Variant_Attribute.create).toHaveBeenCalledWith({
      data: {
        productVariantId: '1',
        attributeValueId: '101',
      },
    });

    // Ensure response status and data are as expected
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product variant attribute created successfull',
      data: mockNewProductVariantAttribute,
    });
  });

  it('should call next with an error if an exception occurs', async () => {
    const req = {
      body: { productVariantId: '1', attributeValueId: '101' },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockError = new Error('Database error');
    // Mock Prisma to throw an error
    (prisma.product_Variant_Attribute.create as jest.Mock).mockRejectedValue(mockError);

    await createProductVariantAttribute(req, res, next);

    // Ensure Prisma is called with correct parameters
    expect(prisma.product_Variant_Attribute.create).toHaveBeenCalledWith({
      data: {
        productVariantId: '1',
        attributeValueId: '101',
      },
    });

    // Ensure the next middleware is called with the error
    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe('getAllProductVariantAttributes controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  it('should return product variant attributes with pagination data', async () => {
    const req = {
      query: {
        page: '1',
        limit: '10',
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockProductVariantAttributes = [
      { id: 1, productVariantId: '1', attributeValueId: '10' },
      { id: 2, productVariantId: '2', attributeValueId: '20' },
    ];
    const mockTotalCount = 20;

    // Mock the Prisma methods
    (prisma.product_Variant_Attribute.findMany as jest.Mock).mockResolvedValue(mockProductVariantAttributes);
    (prisma.product_Variant_Attribute.count as jest.Mock).mockResolvedValue(mockTotalCount);

    await getAllProductVariantAttributes(req, res, next);

    // Verify the Prisma methods are called with the correct parameters
    expect(prisma.product_Variant_Attribute.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      include: {
        productVariant: true,
        attributeValue: true,
      },
    });
    expect(prisma.product_Variant_Attribute.count).toHaveBeenCalled();

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: mockProductVariantAttributes,
      meta: {
        totalCount: mockTotalCount,
        totalPages: 2, // 20 total items / 10 items per page = 2 pages
        currentPage: 1,
        itemsPerPage: 10,
      },
    });
  });

  it('should handle missing query parameters and return defaults', async () => {
    const req = { query: {} } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockProductVariantAttributes = [
      { id: 1, productVariantId: '1', attributeValueId: '10' },
    ];
    const mockTotalCount = 1;

    // Mock the Prisma methods
    (prisma.product_Variant_Attribute.findMany as jest.Mock).mockResolvedValue(mockProductVariantAttributes);
    (prisma.product_Variant_Attribute.count as jest.Mock).mockResolvedValue(mockTotalCount);

    await getAllProductVariantAttributes(req, res, next);

    // Verify the response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: mockProductVariantAttributes,
      meta: {
        totalCount: mockTotalCount,
        totalPages: 1, // 1 total item / 10 items per page = 1 page
        currentPage: 1,
        itemsPerPage: 10,
      },
    });
  });

  it('should call next with an error if an exception occurs', async () => {
    const req = {
      query: {
        page: '1',
        limit: '10',
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockError = new Error('Database error');

    // Mock Prisma to throw an error
    (prisma.product_Variant_Attribute.findMany as jest.Mock).mockRejectedValue(mockError);

    await getAllProductVariantAttributes(req, res, next);

    // Ensure next is called with the error
    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should apply MAX_LIMIT constraint when limit is higher than the max value', async () => {
    const req = {
      query: {
        page: '1',
        limit: '200', // Exceeds MAX_LIMIT
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    const mockProductVariantAttributes = [
      { id: 1, productVariantId: '1', attributeValueId: '10' },
    ];
    const mockTotalCount = 1;

    // Mock the Prisma methods
    (prisma.product_Variant_Attribute.findMany as jest.Mock).mockResolvedValue(mockProductVariantAttributes);
    (prisma.product_Variant_Attribute.count as jest.Mock).mockResolvedValue(mockTotalCount);

    await getAllProductVariantAttributes(req, res, next);

    // Ensure the limit is capped at MAX_LIMIT
    expect(prisma.product_Variant_Attribute.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 100, // Ensure the limit is capped at 100
      include: {
        productVariant: true,
        attributeValue: true,
      },
    });
  });
});

describe('createProduct Controller', () => {
  it('should create a new product successfully', async () => {
    const req = {
      body: {
        productName: 'Product A',
        description: 'Description of Product A',
        specification: 'Specification of Product A',
        categoryId: 1,
        adminId: 1,
      },
    } as Request;
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    
    const next = jest.fn();

    // Mock Prisma's create method to simulate the successful creation of a product
    const mockProduct = {
      id: 1,
      productName: 'Product A',
      description: 'Description of Product A',
      specification: 'Specification of Product A',
      categoryId: 1,
      adminId: 1,
    };
    
    (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

    await createProduct(req, res, next);

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        productName: 'Product A',
        description: 'Description of Product A',
        specification: 'Specification of Product A',
        categoryId: 1,
        adminId: 1,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product created successfully',
      data: mockProduct,
    });
  });
});

describe('getAllProducts', () => {
  it('should return all products with pagination', async () => {
    const req = {
      query: { page: '1', limit: '10' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mocking the prisma.product.findMany method correctly
    const mockProducts = [
      { id: 1, productName: 'Product A', categoryId: '123', images: [], variants: [] },
    ];

    // Tell TypeScript that findMany is a jest mock function and mock its resolved value
    (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
    (prisma.product.count as jest.Mock).mockResolvedValue(1);

    // Call the controller function
    await getAllProducts(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      include: { images: { where: { isHero: true } }, variants: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'products fetched successful',
      data: mockProducts,
      meta: {
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      },
    });
  });

  it('should return 404 if no products are found', async () => {
    const req = {
      query: { page: '1', limit: '10' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock empty response from Prisma
    (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.product.count as jest.Mock).mockResolvedValue(0);

    // Call the controller function
    await getAllProducts(req as Request, res as Response, jest.fn());

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'No Products found',
    });
  });
});

describe('getProductById', () => {
  it('should return a product by ID', async () => {
    const req = {
      params: { id: '123' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock the product retrieval
    const mockProduct = {
      id: '123',
      productName: 'Product A',
      description: 'Description A',
      specification: 'Specification A',
      categoryId: '1',
      variants: [],
      images: [],
    };

    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

    // Call the controller function
    await getProductById(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
      include: { variants: true, images: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product fetched successfully',
      data: mockProduct,
    });
  });

  it('should return 404 if the product is not found', async () => {
    const req = {
      params: { id: '123' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock no product found
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the controller function
    await getProductById(req as Request, res as Response, jest.fn());

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Product not found',
    });
  });
});

describe('updateProduct', () => {
  it('should update the product successfully', async () => {
    const req = {
      params: { id: '123' },
      body: {
        productName: 'Updated Product',
        description: 'Updated description',
        specification: 'Updated specification',
        categoryId: '1',
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock product existence
    const mockProduct = {
      id: '123',
      productName: 'Old Product',
      description: 'Old description',
      specification: 'Old specification',
      categoryId: '1',
    };

    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

    // Mock update product
    const updatedProduct = {
      id: '123',
      productName: 'Updated Product',
      description: 'Updated description',
      specification: 'Updated specification',
      categoryId: '1',
    };
    (prisma.product.update as jest.Mock).mockResolvedValue(updatedProduct);

    // Call the controller function
    await updateProduct(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: req.body,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  });

  it('should return 404 if the product to update does not exist', async () => {
    const req = {
      params: { id: '123' },
      body: {
        productName: 'Updated Product',
        description: 'Updated description',
        specification: 'Updated specification',
        categoryId: '1',
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock no product found
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the controller function
    await updateProduct(req as Request, res as Response, jest.fn());

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Product not found',
    });
  });
});

describe('deleteProduct', () => {
  it('should delete the product successfully', async () => {
    const req = {
      params: { id: '123' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock product existence
    const mockProduct = {
      id: '123',
      productName: 'Product A',
      description: 'Description A',
      specification: 'Specification A',
      categoryId: '1',
    };
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

    // Mock delete associated images and variants
    (prisma.productImage.deleteMany as jest.Mock).mockResolvedValue({});
    (prisma.product_Variant.deleteMany as jest.Mock).mockResolvedValue({});

    // Mock delete product
    const deletedProduct = { ...mockProduct };
    (prisma.product.delete as jest.Mock).mockResolvedValue(deletedProduct);

    // Call the controller function
    await deleteProduct(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
    });
    expect(prisma.productImage.deleteMany).toHaveBeenCalledWith({
      where: { productId: '123' },
    });
    expect(prisma.product_Variant.deleteMany).toHaveBeenCalledWith({
      where: { productId: '123' },
    });
    expect(prisma.product.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product deleted successfully',
      data: deletedProduct,
    });
  });

  it('should return 404 if the product to delete does not exist', async () => {
    const req = {
      params: { id: '123' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock no product found
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the controller function
    await deleteProduct(req as Request, res as Response, jest.fn());

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Product not found',
    });
  });
});

describe('createCategory', () => {
  it('should create a category successfully', async () => {
    const req = {
      body: {
        categoryName: 'New Category',  // Category name provided
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock the category creation
    const mockNewCategory = {
      id: '123',
      categoryName: 'New Category',
    };

    (prisma.category.create as jest.Mock).mockResolvedValue(mockNewCategory);

    // Call the controller function
    await createCategory(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { categoryName: 'New Category' },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Category created successfully',
      data: mockNewCategory,
    });
  });

  it('should return 201 even if categoryName is missing', async () => {
    const req = {
      body: {},  // Empty body (missing categoryName)
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock the category creation
    const mockNewCategory = {
      id: '123',
      categoryName: undefined,  // Simulating missing category name (undefined)
    };

    (prisma.category.create as jest.Mock).mockResolvedValue(mockNewCategory);

    // Call the controller function
    await createCategory(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { categoryName: undefined },  // Simulating missing category name
    });
    expect(res.status).toHaveBeenCalledWith(201);  // Controller returns 201 even without validation
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Category created successfully',
      data: mockNewCategory,
    });
  });

});

describe('getAllCategories', () => {
  it('should return all categories with pagination', async () => {
    const req = {
      query: { page: '1', limit: '10' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock data
    const mockCategories = [
      { id: 1, name: 'Category A', products: [] },
      { id: 2, name: 'Category B', products: [] },
    ];

    // Mock Prisma methods
    (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);
    (prisma.category.count as jest.Mock).mockResolvedValue(2);

    // Call the controller
    await getAllCategories(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      include: { products: true },
    });
    expect(prisma.category.count).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: mockCategories,
      meta: {
        totalCount: 2,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      },
    });
  });

  it('should return 404 if no categories are found', async () => {
    const req = {
      query: { page: '1', limit: '10' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock empty response
    (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.category.count as jest.Mock).mockResolvedValue(0);

    // Call the controller
    await getAllCategories(req as Request, res as Response, jest.fn());

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'No categories found',
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    const req = {
      query: { page: '1', limit: '10' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    const next = jest.fn();

    // Mock Prisma to throw an error
    (prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Call the controller
    await getAllCategories(req as Request, res as Response, next);

    // Assertions
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('createProductVariant', () => {
  it('should create a new product variant successfully', async () => {
    const req = {
      body: {
        productId: 1,
        price: 100.0,
        stock: 50,
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock Prisma methods
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: 1, productName: 'Product A' });
    (prisma.product_Variant.create as jest.Mock).mockResolvedValue({
      id: 1,
      price: 100.0,
      stock: 50,
      productId: 1,
    });

    // Call the controller
    await createProductVariant(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prisma.product_Variant.create).toHaveBeenCalledWith({
      data: {
        price: 100.0,
        stock: 50,
        productId: 1,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product variant added successfully',
      data: {
        id: 1,
        price: 100.0,
        stock: 50,
        productId: 1,
      },
    });
  });

  it('should return 404 if the product does not exist', async () => {
    const req = {
      body: {
        productId: 99,
        price: 100.0,
        stock: 50,
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock Prisma methods
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the controller
    await createProductVariant(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 99 },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  it('should handle unexpected errors gracefully', async () => {
    const req = {
      body: {
        productId: 1,
        price: 100.0,
        stock: 50,
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    const next = jest.fn();

    // Mock Prisma to throw an error
    (prisma.product.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Call the controller
    await createProductVariant(req as Request, res as Response, next);

    // Assertions
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('getProductVariantById', () => {
  it('should return the product variants for a valid productId', async () => {
    const req = {
      params: { productId: '1' },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock Prisma methods
    const mockProductVariants = [
      {
        id: 1,
        price: 100.0,
        stock: 50,
        productId: 1,
        attributes: [],
      },
    ];
    (prisma.product_Variant.findMany as jest.Mock).mockResolvedValue(mockProductVariants);

    // Call the controller
    await getProductVariantById(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product_Variant.findMany).toHaveBeenCalledWith({
      where: { productId: '1' },
      include: { attributes: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product variant fetched successfully',
      data: mockProductVariants,
    });
  });
});

describe('updateProductVariant', () => {
  it('should update the product variant successfully', async () => {
    const req = {
      params: { id: 'variant-id-123' },
      body: {
        price: 200.0,
        stock: 50,
        productId: 'product-id-123',
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock product variant existence
    const mockProductVariant = {
      id: 'variant-id-123',
      price: 150.0,
      stock: 30,
      productId: 'product-id-123',
    };

    (prisma.product_Variant.findUnique as jest.Mock).mockResolvedValue(mockProductVariant);

    // Mock update product variant
    const updatedProductVariant = {
      id: 'variant-id-123',
      price: 200.0,
      stock: 50,
      productId: 'product-id-123',
    };

    (prisma.product_Variant.update as jest.Mock).mockResolvedValue(updatedProductVariant);

    // Call the controller function
    await updateProductVariant(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product_Variant.findUnique).toHaveBeenCalledWith({
      where: { id: 'variant-id-123' },
    });
    expect(prisma.product_Variant.update).toHaveBeenCalledWith({
      where: { id: 'variant-id-123' },
      data: req.body,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product variant updated successfully',
      data: updatedProductVariant,
    });
  });

  it('should return 404 if the product variant to update does not exist', async () => {
    const req = {
      params: { id: 'variant-id-123' },
      body: {
        price: 200.0,
        stock: 50,
        productId: 'product-id-123',
      },
    } as Partial<Request>;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Mock no product variant found
    (prisma.product_Variant.findUnique as jest.Mock).mockResolvedValue(null);

    // Call the controller function
    await updateProductVariant(req as Request, res as Response, jest.fn());

    // Assertions
    expect(prisma.product_Variant.findUnique).toHaveBeenCalledWith({
      where: { id: 'variant-id-123' },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Product variant not found',
    });
  });
});

// test: upload product-images
describe('uploadProductImage Controller', () => {
  it('should upload an image and save metadata successfully', async () => {
    // Mock data
    const mockProduct = { id: '1', name: 'Test Product' };
    const mockImageUrl = 'https://example.com/image.jpg';
    const mockImage = { id: '1', imageUrl: mockImageUrl, isHero: true, productId: '1' };

    // Mock Prisma and Azure Blob functions
    prisma.product.findUnique = jest.fn().mockResolvedValue(mockProduct);
    prisma.productImage.create = jest.fn().mockResolvedValue(mockImage);
    uploadToBlobStorageMock.mockResolvedValue(mockImageUrl);

    // Mock request, response, and next
    const req = {
      body: { productId: '1', isHero: true },
      file: { buffer: Buffer.from('test'), originalname: 'image.jpg' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    // Call the function
    await uploadProductImage(req, res, next);

    // Assertions
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(uploadToBlobStorageMock).toHaveBeenCalledWith(req.file!.buffer, req.file!.originalname);
    expect(prisma.productImage.create).toHaveBeenCalledWith({
      data: {
        imageUrl: mockImageUrl,
        isHero: true,
        productId: '1',
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product image uploaded successfully',
      data: mockImage,
    });
  });

  it('should return 404 if the product does not exist', async () => {
    prisma.product.findUnique = jest.fn().mockResolvedValue(null);

    const req = {
      body: { productId: 'invalid-id', isHero: false },
      file: { buffer: Buffer.from('test'), originalname: 'image.jpg' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await uploadProductImage(req, res, next);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'invalid-id' } });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  it('should return 400 if no file is provided', async () => {
    const mockProduct = { id: '1', name: 'Test Product' };
    prisma.product.findUnique = jest.fn().mockResolvedValue(mockProduct);

    const req = {
      body: { productId: '1', isHero: true },
      file: null,
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await uploadProductImage(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No image file provided' });
  });
});
// test: getAll product-images
describe('getAllProductImages Controller', () => {
  it('should fetch all images for a given productId', async () => {
    const mockImages = [
      { id: '1', imageUrl: 'https://example.com/image1.jpg', isHero: true, productId: '1' },
      { id: '2', imageUrl: 'https://example.com/image2.jpg', isHero: false, productId: '1' },
    ];

    prisma.productImage.findMany = jest.fn().mockResolvedValue(mockImages);

    const req = {
      query: { productId: '1' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await getAllProductImages(req, res, next);

    expect(prisma.productImage.findMany).toHaveBeenCalledWith({
      where: { productId: '1' },
      orderBy: { isHero: 'desc' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product images fetched successfully',
      data: mockImages,
    });
  });

  it('should return 404 if no images are found', async () => {
    prisma.productImage.findMany = jest.fn().mockResolvedValue([]);

    const req = {
      query: { productId: '1' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await getAllProductImages(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No product images found' });
  });
});
// test: delete product-images
describe('deleteProductImage Controller', () => {
  it('should delete a product image successfully', async () => {
    const mockProductImage = { id: '1', imageUrl: 'https://example.com/image.jpg' };

    // Mock Prisma methods
    prisma.productImage.findUnique = jest.fn().mockResolvedValue(mockProductImage);
    prisma.productImage.delete = jest.fn().mockResolvedValue(mockProductImage);

    // Mock request, response, and next
    const req = { params: { id: '1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    await deleteProductImage(req, res, next);

    expect(prisma.productImage.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(prisma.productImage.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product image deleted successfully from the database.',
    });
  });

  it('should return 404 if the product image is not found', async () => {
    prisma.productImage.findUnique = jest.fn().mockResolvedValue(null);

    const req = { params: { id: 'nonexistent-id' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    await deleteProductImage(req, res, next);

    expect(prisma.productImage.findUnique).toHaveBeenCalledWith({ where: { id: 'nonexistent-id' } });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product image not found' });
  });

  it('should handle errors by calling next', async () => {
    const error = new Error('Database error');
    prisma.productImage.findUnique = jest.fn().mockRejectedValue(error);

    const req = { params: { id: '1' } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    await deleteProductImage(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
// test: get product variant details
describe('getProductVariantDetails Controller', () => {
  it('should return product variant details when found', async () => {
    // Mock the database response
    const mockProductVariantDetails = {
      id: '1',
      product: { id: '10', category: { id: '20', name: 'Category A' }, images: [] },
      attributes: [],
    };
    (prisma.product_Variant.findUnique as jest.Mock).mockResolvedValue(mockProductVariantDetails);

    const req = {
      params: { productVariantId: '1' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await getProductVariantDetails(req, res, next);

    expect(prisma.product_Variant.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        product: { include: { category: true, images: true } },
        attributes: {
          include: {
            attributeValue: { include: { attribute: true } },
          },
        },
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProductVariantDetails);
  });

  it('should return a 404 error if the product variant is not found', async () => {
    // Mock the database response
    (prisma.product_Variant.findUnique as jest.Mock).mockResolvedValue(null);

    const req = {
      params: { productVariantId: '1' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await getProductVariantDetails(req, res, next);

    expect(prisma.product_Variant.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        product: { include: { category: true, images: true } },
        attributes: {
          include: {
            attributeValue: { include: { attribute: true } },
          },
        },
      },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product variant not found' });
  });

  it('should handle database errors and return a 500 response', async () => {
    // Mock a database error
    const error = new Error('Database error');
    (prisma.product_Variant.findUnique as jest.Mock).mockRejectedValue(error);

    const req = {
      params: { productVariantId: '1' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const next = jest.fn();

    await getProductVariantDetails(req, res, next);

    expect(prisma.product_Variant.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: {
        product: { include: { category: true, images: true } },
        attributes: {
          include: {
            attributeValue: { include: { attribute: true } },
          },
        },
      },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});