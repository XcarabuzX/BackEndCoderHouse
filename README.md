# Backend CoderHouse — E-commerce API (Entrega Final)

API REST de ecommerce con arquitectura profesional en capas: **DAO + DTO + Repository + Service + Controller**, manejo de roles y autorización, recuperación de contraseña por correo y proceso de compra con generación de tickets.

## Stack

- Node.js + Express 5
- MongoDB + Mongoose
- Passport (estrategia JWT `current`) + JWT en cookie httpOnly
- Nodemailer (recuperación de contraseña)
- Handlebars (vistas) + Socket.io (productos en tiempo real)
- dotenv (variables de entorno)

## Arquitectura

El servidor sigue una arquitectura por capas con separación de responsabilidades:

```
src/
├── config/         Configuración centralizada (env vars), Mongo y Passport
├── models/         Esquemas de Mongoose (Product, Cart, User, Ticket)
├── dao/            Data Access Objects — acceso puro a la base de datos
├── dto/            Data Transfer Objects — datos no sensibles entre capas
├── repositories/   Patrón Repository — desacopla negocio del acceso a datos
├── services/       Lógica de negocio (productos, carritos, compra, usuarios)
├── controllers/    Adaptadores HTTP ↔ servicios
├── middlewares/    Autenticación (passportCall) y autorización por roles
├── routes/         Definición de rutas
└── utils/          Hashing, mailing, errores de aplicación
```

**Flujo de una petición:** `Route → Middleware (auth) → Controller → Service → Repository → DAO → Mongoose`

- **DAO**: única capa que conoce Mongoose. Operaciones CRUD puras.
- **Repository**: recibe el DAO por inyección de dependencias. Si cambia el motor de persistencia, solo cambian los DAOs (en `repositories/index.js`).
- **DTO**: la ruta `/current` y los listados de productos devuelven DTOs, evitando exponer datos sensibles (password, tokens de recuperación).
- **Service**: concentra la lógica de negocio y lanza `AppError` con código HTTP semántico.

## Requisitos

- Node.js 18+
- MongoDB corriendo en `localhost:27017`

## Instalación

```bash
npm install
cp .env.example .env   # ajustar valores (incluido el SMTP de mailing)
npm run dev
```

Servidor en `http://localhost:8080`

## Variables de entorno (`.env`)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor |
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar los JWT |
| `JWT_COOKIE_NAME` | Nombre de la cookie que guarda el token |
| `JWT_EXPIRES_IN` | Expiración del token de sesión |
| `RESET_PASSWORD_EXPIRES_MIN` | Minutos de validez del enlace de recuperación (60 = 1 h) |
| `CLIENT_URL` | URL base para armar el enlace del correo |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` / `MAIL_FROM` | Configuración SMTP de Nodemailer |

> Para Gmail usar una **Contraseña de aplicación**, no la contraseña de la cuenta.

## Roles y autorización

La autorización se resuelve con el middleware `authorize(...roles)`, que trabaja **junto a la estrategia `current`** (`passportCall('current')`):

- **admin**: único rol que puede **crear, actualizar y eliminar productos**.
- **user**: único rol que puede **agregar productos a su carrito** y **finalizar la compra** (de su propio carrito).

## Endpoints

### Sesiones / Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/sessions/register` | Registrar usuario (crea carrito asociado) |
| POST | `/api/sessions/login` | Login → JWT en cookie |
| GET | `/api/sessions/current` | Datos del usuario autenticado (**DTO sin datos sensibles**) |
| POST | `/api/sessions/logout` | Cerrar sesión |
| POST | `/api/sessions/forgot-password` | Enviar correo de recuperación (`{ email }`) |
| POST | `/api/sessions/reset-password` | Restablecer contraseña (`{ token, password }`) |

### Productos
| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | `/api/products` | público | Listar (`?limit`, `?page`, `?sort=asc\|desc`, `?query`) |
| GET | `/api/products/:pid` | público | Obtener producto |
| POST | `/api/products` | **admin** | Crear producto |
| PUT | `/api/products/:pid` | **admin** | Actualizar producto |
| DELETE | `/api/products/:pid` | **admin** | Eliminar producto |

### Carritos
| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/api/carts` | — | Crear carrito |
| GET | `/api/carts/:cid` | autenticado | Ver carrito (con populate) |
| POST | `/api/carts/:cid/product/:pid` | **user** | Agregar producto |
| PUT | `/api/carts/:cid/products/:pid` | **user** | Actualizar cantidad (`{ quantity }`) |
| PUT | `/api/carts/:cid` | **user** | Reemplazar productos (`{ products }`) |
| DELETE | `/api/carts/:cid/products/:pid` | **user** | Eliminar producto del carrito |
| DELETE | `/api/carts/:cid` | **user** | Vaciar carrito |
| POST | `/api/carts/:cid/purchase` | **user** | **Finalizar compra** y generar ticket |

## Proceso de compra (`/api/carts/:cid/purchase`)

1. Recorre los productos del carrito y verifica el **stock** de cada uno.
2. Los productos con stock suficiente se compran: se **descuenta el stock** y se suman al monto.
3. Los productos sin stock suficiente **permanecen en el carrito**.
4. Se genera un **Ticket** (`code`, `purchase_datetime`, `amount`, `purchaser`).
5. La respuesta incluye el ticket y la lista de productos que **no** se pudieron comprar.

De este modo se manejan correctamente las compras **completas** e **incompletas**.

## Recuperación de contraseña

1. `POST /api/sessions/forgot-password` con `{ email }` → genera un token único, lo guarda con **expiración de 1 hora** y envía un correo con un **botón** de restablecimiento.
2. El correo enlaza a `CLIENT_URL/reset-password?token=...`.
3. `POST /api/sessions/reset-password` con `{ token, password }`:
   - Rechaza tokens **inexistentes o expirados**.
   - Impide establecer **la misma contraseña anterior**.

## Vistas
| Ruta | Descripción |
|------|-------------|
| `/` | Lista de productos |
| `/products` | Productos con paginación |
| `/carts/:cid` | Vista de carrito |
| `/realtimeproducts` | Productos en tiempo real (Socket.io) |
