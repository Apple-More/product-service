import { PrismaClient } from '@prisma/client';

// Mock the entire PrismaClient with jest.fn() for methods
const prisma = {
  product_Attribute: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  product_Attribute_Value: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  product_Variant_Attribute: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  product_Variant:{
    deleteMany: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  },
  productImage:{
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  category:{
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  }
} as unknown as PrismaClient; // Typecast it as PrismaClient

export default prisma;