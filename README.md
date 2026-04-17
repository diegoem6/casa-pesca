# 🎣 Casa de Pesca - Tienda virtual

Aplicación web completa de e-commerce para casa de pesca. Stack: **React + Vite** (frontend) + **Node.js + Express** (backend) + **PostgreSQL** (base de datos) + **dLocal Go** (procesador de pagos).

## ✨ Funcionalidades

- 🛍️ Catálogo de productos con filtros por categoría y búsqueda
- 👤 Autenticación con JWT (clientes y admin)
- 🛒 Carrito persistente por usuario
- 💳 Checkout integrado con dLocal Go (checkout hospedado)
- 📦 Gestión de stock con descuento transaccional al comprar
- 📋 Historial de pedidos del usuario
- ⚓ Panel de administración: CRUD de productos + gestión de pedidos
- 🖼️ Upload de imágenes de productos
- 🔔 Webhook de dLocal para actualización automática del estado del pago

## 📁 Estructura del proyecto

```
casa-pesca/
├── backend/
│   ├── migrations/         → SQL del esquema
│   ├── src/
│   │   ├── config/         → Conexión a DB
│   │   ├── controllers/    → Lógica de endpoints
│   │   ├── middleware/     → Auth, validaciones, upload
│   │   ├── routes/         → Definición de rutas
│   │   ├── services/       → Integración con dLocal
│   │   ├── utils/          → Migraciones y seed
│   │   └── server.js
│   ├── uploads/            → Imágenes subidas (se crea solo)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/     → Navbar, Footer, ProductoCard, PrivateRoute
    │   ├── context/        → AuthContext, CarritoContext
    │   ├── pages/          → Catalogo, Carrito, Checkout, Admin, etc.
    │   ├── services/       → Cliente HTTP (axios)
    │   ├── styles/         → CSS global con paleta océano
    │   ├── utils/          → Helpers
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## 🚀 Setup paso a paso

### 1. Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- (Opcional) Cuenta en [dLocal Go](https://dlocalgo.com) para pagos reales

### 2. Crear la base de datos

```bash
psql -U postgres
CREATE DATABASE casa_pesca;
\q
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL y dLocal
npm run migrate    # Crea las tablas
npm run seed       # Crea admin + 15 productos de ejemplo
npm run dev        # Inicia el servidor en http://localhost:4000
```

**Credenciales de admin** (definidas en `.env`):
- Email: `admin@casapesca.com`
- Password: `admin123`

### 4. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev        # Inicia Vite en http://localhost:5173
```

Abrí http://localhost:5173 en el navegador.

## 💳 Configuración de dLocal Go

1. Crear cuenta en https://dlocalgo.com
2. Obtener `API_KEY` y `SECRET_KEY` desde el dashboard
3. Configurar las URLs en `.env`:
   - `DLOCAL_NOTIFICATION_URL`: tu backend público (en producción) - debe ser HTTPS
   - `DLOCAL_SUCCESS_URL`: `https://tudominio.com/checkout/success`
   - `DLOCAL_BACK_URL`: `https://tudominio.com/checkout/cancel`

**Para desarrollo local**, podés usar [ngrok](https://ngrok.com) para exponer el webhook:
```bash
ngrok http 4000
# Usar la URL https que te da ngrok como DLOCAL_NOTIFICATION_URL
```

### Flujo de pago

1. Usuario completa formulario de checkout
2. Backend crea el pedido (estado: `pendiente`) y descuenta stock
3. Backend llama a dLocal `POST /payments` y obtiene un `redirect_url`
4. Frontend redirige al usuario a esa URL (checkout hospedado de dLocal)
5. Usuario paga en dLocal Go
6. dLocal redirige a `/checkout/success` o `/checkout/cancel`
7. dLocal envía webhook a `/api/pedidos/webhook` con el estado real
8. Backend actualiza el estado del pedido (y restituye stock si fue rechazado)

## 🗂️ Categorías de productos

`canas`, `reeles`, `lineas`, `anzuelos`, `plomos`, `senuelos`, `accesorios`, `otros`

## 🔐 Endpoints principales

### Auth
- `POST /api/auth/registro` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Datos del usuario logueado

### Productos
- `GET /api/productos?categoria=&busqueda=` - Listar (público)
- `GET /api/productos/:id` - Detalle (público)
- `POST /api/productos` - Crear (admin, multipart)
- `PUT /api/productos/:id` - Editar (admin)
- `DELETE /api/productos/:id` - Desactivar (admin)

### Carrito (requieren login)
- `GET /api/carrito`
- `POST /api/carrito/items` - body: `{ producto_id, cantidad }`
- `PUT /api/carrito/items/:itemId` - body: `{ cantidad }`
- `DELETE /api/carrito/items/:itemId`
- `DELETE /api/carrito`

### Pedidos
- `POST /api/pedidos/checkout` - Crear pedido + iniciar pago
- `GET /api/pedidos/mis-pedidos` - Historial del usuario
- `GET /api/pedidos/:id` - Detalle
- `POST /api/pedidos/webhook` - Webhook dLocal (público)
- `GET /api/pedidos` - Listar todos (admin)
- `PATCH /api/pedidos/:id/estado` - Cambiar estado (admin)

## 🛠️ Para producción

- Cambiar `JWT_SECRET` por uno largo y aleatorio
- Cambiar credenciales del admin (email + password)
- Habilitar verificación de firma del webhook en `pedidosController.js` (descomentar `verificarFirmaWebhook`)
- Servir frontend con `npm run build` y un servidor estático (nginx)
- Usar HTTPS para todas las URLs (requerido por dLocal)
- Considerar mover uploads a S3 o similar
- Agregar rate limiting (express-rate-limit)
- Configurar backups de PostgreSQL

## 📜 Licencia

MIT
