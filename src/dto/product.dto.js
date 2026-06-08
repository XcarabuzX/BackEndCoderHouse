/**
 * DTO de Producto. Normaliza la información de producto que viaja entre capas
 * y hacia el cliente, exponiendo solo los campos relevantes.
 */
export class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.status = product.status;
    this.stock = product.stock;
    this.category = product.category;
    this.thumbnails = product.thumbnails || [];
  }
}
