import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  @MessagePattern('createProduct')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern('findAllProducts')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  // @Get(':id')
  @MessagePattern('findOneProduct')
  findOne(@Payload('id') id: string) {
    if (isNaN(+id)) {
      console.log(id);

      throw new RpcException('Invalid id');
    }
    return this.productsService.findOne(+id);
  }

  // @Patch(':id')
  @MessagePattern('updateProduct')
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  // @Delete(':id')
  @MessagePattern('removeProduct')
  remove(@Payload('id') id: string) {
    if (isNaN(+id)) {
      throw new RpcException('Invalid id');
    }
    return this.productsService.remove(+id);
  }

  @MessagePattern('validateProducts')
  validateProduct(@Payload() ids: number[]) {
    return this.productsService.validateProducts(ids);
  }
}
