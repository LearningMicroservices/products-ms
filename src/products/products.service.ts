import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient, Prisma } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    this.$connect();
    Logger.log('Connected to the database', 'ProductsService');
  }

  async create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.product.count({ where: { avaliable: true } });
    const lastPage = Math.ceil(total / limit);
    if (page > lastPage) {
      return {
        data: [],
        meta: {
          total,
          page,
          lastPage,
        },
      };
    }

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          avaliable: true,
        },
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    try {
      const product = await this.product.findFirst({
        where: { id, avaliable: true },
      });
      if (!product) {
        throw new RpcException({
          message: `Product #${id} not found`,
          status: 'Bad request',
          code: 400,
        });
      }
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new RpcException({
            message: `Product #${id} not found`,
            status: 'Bad request',
            code: 400,
          });
        }
      } else if (error instanceof RpcException) {
        throw error;
      }
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: __, ...data } = updateProductDto;

      return await this.product.update({
        where: { id, avaliable: true },
        data: data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new RpcException({
            message: `Product #${id} not found`,
            status: 'Bad request',
            code: 400,
          });
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // return await this.product.delete({
      //   where: { id, avaliable: true },
      // });
      const product = await this.product.update({
        where: { id, avaliable: true },
        data: { avaliable: false },
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new RpcException({
            message: `Product #${id} not found`,
            status: 'Bad Request',
            code: 400,
          });
        }
      }
      throw error;
    }
  }
}
