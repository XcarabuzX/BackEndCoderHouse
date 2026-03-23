# Backend CoderHouse — E-commerce API

API REST para gestión de productos y carritos con persistencia en MongoDB.

## Stack

- Node.js + Express 5
- MongoDB + Mongoose
- Handlebars (vistas)
- Socket.io (productos en tiempo real)

## Requisitos

- Node.js 18+
- MongoDB corriendo en `localhost:27017`

## Instalación

```bash
npm install
npm run dev
```

Servidor en `http://localhost:8080`

## Endpoints

### Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos (soporta `?limit`, `?page`, `?sort=asc\|desc`, `?query`) |
| GET | `/api/products/:pid` | Obtener producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:pid` | Actualizar producto |
| DELETE | `/api/products/:pid` | Eliminar producto |

### Carritos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/carts` | Crear carrito |
| GET | `/api/carts/:cid` | Ver carrito (con populate) |
| POST | `/api/carts/:cid/product/:pid` | Agregar producto |
| PUT | `/api/carts/:cid/products/:pid` | Actualizar cantidad (`{ quantity: N }`) |
| PUT | `/api/carts/:cid` | Reemplazar productos (`{ products: [...] }`) |
| DELETE | `/api/carts/:cid/products/:pid` | Eliminar producto del carrito |
| DELETE | `/api/carts/:cid` | Vaciar carrito |

### Vistas
| Ruta | Descripción |
|------|-------------|
| `/` | Lista de productos |
| `/products` | Productos con paginación |
| `/carts/:cid` | Vista de carrito |
| `/realtimeproducts` | Productos en tiempo real (Socket.io) |
