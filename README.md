<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Backend Inventario - Global Office

Sistema de inventario multi-tenant para tiendas, desarrollado con NestJS y PostgreSQL (Supabase).

## Características principales

- **Registro y login de usuarios** con autenticación JWT.
- **Roles:**
  - `admin`: puede ver y gestionar usuarios, pero no modificar productos/stock de tiendas.
  - `store`: gestiona solo su tienda y productos.
- **Gestión de productos:**
  - CRUD completo (crear, listar, editar, eliminar, activar/desactivar)
  - Validaciones con DTOs y `class-validator`
  - Solo el dueño puede modificar sus productos
- **Gestión de usuarios (admin):**
  - Listar usuarios, ver detalles, activar/desactivar cuentas
  - Ver email, rol, estado, plan, productos usados, último login
- **Protección de endpoints** con guards y decoradores de roles
- **Conexión segura a Supabase/PostgreSQL** con SSL

## Estructura de carpetas

```
src/
  ├── auth/         # Autenticación y JWT
  ├── common/       # Decoradores y guards de roles
  ├── config/       # Configuración TypeORM
  ├── entities/     # Entidades TypeORM
  ├── products/     # CRUD de productos
  ├── stores/       # Tiendas (multi-tenant)
  ├── subscriptions/# Suscripciones (futuro)
  └── users/        # Gestión de usuarios
```

## Instalación y uso

1. Clona el repositorio y entra a la carpeta del backend.
2. Instala dependencias:
   ```
   npm install
   ```
3. Configura el archivo `.env` con los datos de tu base de datos Supabase:
   ```
   DB_HOST=...
   DB_PORT=...
   DB_USER=...
   DB_PASS=...
   DB_NAME=...
   JWT_SECRET=supersecret
   ```
4. Ejecuta el backend:
   ```
   npm run start:dev
   ```

## Endpoints principales

- **Auth:**
  - `POST /auth/register` — registro de usuario
  - `POST /auth/login` — login y obtención de JWT
- **Productos:**
  - `GET /products` — listar productos (admin ve todos, store solo los suyos)
  - `POST /products` — crear producto (solo store)
  - `PUT /products/:id` — editar producto (solo dueño)
  - `PATCH /products/:id/active` — activar/desactivar producto (solo dueño)
  - `DELETE /products/:id` — eliminar producto (solo dueño)
- **Usuarios (admin):**
  - `GET /users` — listar usuarios
  - `GET /users/:id` — ver usuario
  - `PATCH /users/:id/active` — activar/desactivar usuario
- **API Keys:**
  - `POST /api-keys/:storeId` — crear nueva API key para una tienda
  - `GET /api-keys/:storeId` — listar API keys de una tienda
  - `DELETE /api-keys/:apiKeyId` — eliminar una API key
  - `PATCH /api-keys/:apiKeyId/toggle` — activar/desactivar API key
  - `GET /api-keys/:apiKeyId/stats` — obtener estadísticas de uso
  - `PATCH /api-keys/:apiKeyId/rate-limit` — actualizar límite de velocidad
- **Endpoints Públicos (requieren API key):**
  - `GET /public/products?apiKey=xxx` — obtener productos para sitios externos
  - `GET /public/product/:id?apiKey=xxx` — obtener producto específico
  - `GET /public/categories?apiKey=xxx` — obtener categorías
  - `GET /public/store-info?apiKey=xxx` — obtener información de la tienda

## Notas
- El admin no puede modificar productos ni stock de tiendas.
- El sistema es multi-tenant: cada tienda gestiona solo sus productos.
- Puedes extender la lógica para suscripciones, reportes, pagos, etc.

---

## 🔑 Sistema de API Keys - Guía para Frontend

### Resumen
El sistema de API Keys permite que los usuarios muestren sus productos de inventario en sitios web externos. Cada API key está asociada a una tienda específica y proporciona acceso controlado a los endpoints públicos.

### Flujo de Trabajo
1. **Usuario crea API key** → Panel de administración de su tienda
2. **Usuario obtiene la key** → Copia el token generado
3. **Usuario usa la key** → En su sitio web externo para mostrar productos
4. **Sistema rastrea uso** → Métricas, rate limiting, seguridad

### Endpoints para el Frontend

#### 1. Gestión de API Keys (Panel Admin)

**Crear nueva API key:**
```http
POST /api-keys/:storeId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Mi tienda online",
  "description": "API key para mostrar productos en mi sitio web"
}
```

**Listar API keys de una tienda:**
```http
GET /api-keys/:storeId
Authorization: Bearer <jwt-token>
```

**Eliminar API key:**
```http
DELETE /api-keys/:apiKeyId
Authorization: Bearer <jwt-token>
```

**Activar/Desactivar API key:**
```http
PATCH /api-keys/:apiKeyId/toggle
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "isActive": true
}
```

**Obtener estadísticas de uso:**
```http
GET /api-keys/:apiKeyId/stats
Authorization: Bearer <jwt-token>
```

**Actualizar límite de velocidad:**
```http
PATCH /api-keys/:apiKeyId/rate-limit
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "rateLimit": 100
}
```

#### 2. Endpoints Públicos (Para sitios externos)

**Obtener productos:**
```http
GET /public/products?apiKey=your-api-key-here&page=1&limit=10&category=electronics
```

**Obtener producto específico:**
```http
GET /public/product/product-id?apiKey=your-api-key-here
```

**Obtener categorías:**
```http
GET /public/categories?apiKey=your-api-key-here
```

**Obtener información de la tienda:**
```http
GET /public/store-info?apiKey=your-api-key-here
```

### Respuestas de la API

#### API Key creada exitosamente:
```json
{
  "id": "api-key-uuid",
  "key": "ak_1234567890abcdef...",
  "name": "Mi tienda online",
  "description": "API key para mostrar productos en mi sitio web",
  "isActive": true,
  "rateLimit": 100,
  "createdAt": "2025-01-14T10:30:00.000Z",
  "store": {
    "id": "store-uuid",
    "name": "Mi Tienda"
  }
}
```

#### Lista de productos público:
```json
{
  "products": [
    {
      "id": "product-uuid",
      "name": "Producto 1",
      "price": 29.99,
      "category": "electronics",
      "description": "Descripción del producto",
      "image": "https://example.com/image.jpg",
      "stock": 50,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### Estadísticas de API key:
```json
{
  "apiKeyId": "api-key-uuid",
  "totalRequests": 1547,
  "requestsToday": 23,
  "requestsThisMonth": 890,
  "lastUsed": "2025-01-14T10:30:00.000Z",
  "lastDomain": "mi-tienda.com",
  "lastIP": "192.168.1.100",
  "rateLimit": 100,
  "isActive": true
}
```

### Implementación en Frontend

#### 1. Panel de API Keys (React ejemplo)
```jsx
import React, { useState, useEffect } from 'react';

const ApiKeysPanel = ({ storeId }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKeys();
  }, [storeId]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`/api-keys/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (name, description) => {
    try {
      const response = await fetch(`/api-keys/${storeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      });
      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      return newKey;
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const toggleApiKey = async (apiKeyId, isActive) => {
    try {
      await fetch(`/api-keys/${apiKeyId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      fetchApiKeys(); // Refresh list
    } catch (error) {
      console.error('Error toggling API key:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="api-keys-panel">
      <h2>API Keys</h2>
      
      <button onClick={() => createApiKey('Nueva API Key', 'Descripción')}>
        Crear API Key
      </button>

      <div className="api-keys-list">
        {apiKeys.map(key => (
          <div key={key.id} className="api-key-item">
            <h3>{key.name}</h3>
            <p>{key.description}</p>
            <code>{key.key}</code>
            <div>
              <span>Requests hoy: {key.requestsToday || 0}</span>
              <span>Límite: {key.rateLimit}/hora</span>
            </div>
            <button onClick={() => toggleApiKey(key.id, !key.isActive)}>
              {key.isActive ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeysPanel;
```

#### 2. Uso en sitio web externo (JavaScript)
```javascript
// En el sitio web del usuario
class ProductsWidget {
  constructor(apiKey, containerSelector) {
    this.apiKey = apiKey;
    this.container = document.querySelector(containerSelector);
    this.apiUrl = 'https://tu-backend.com/public';
  }

  async loadProducts(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${this.apiUrl}/products?apiKey=${this.apiKey}&page=${page}&limit=${limit}`
      );
      const data = await response.json();
      this.renderProducts(data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  renderProducts(products) {
    this.container.innerHTML = products.map(product => `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="price">$${product.price}</span>
        <span class="stock">${product.stock} disponibles</span>
      </div>
    `).join('');
  }
}

// Uso
const widget = new ProductsWidget('ak_1234567890abcdef...', '#products-container');
widget.loadProducts();
```

### Seguridad y Consideraciones

1. **Rate Limiting**: Cada API key tiene un límite de requests por hora (configurable)
2. **Tracking**: Se rastrea la IP y dominio de origen de cada request
3. **Activación/Desactivación**: Las API keys pueden ser desactivadas en cualquier momento
4. **Métricas**: Se recopilan estadísticas detalladas de uso
5. **CORS**: Configurado para permitir requests desde dominios externos

### Errores Comunes

#### API Key inválida:
```json
{
  "statusCode": 401,
  "message": "API key inválida o inactiva"
}
```

#### Rate limit excedido:
```json
{
  "statusCode": 429,
  "message": "Rate limit excedido. Intente nuevamente más tarde."
}
```

#### Tienda no encontrada:
```json
{
  "statusCode": 404,
  "message": "Tienda no encontrada"
}
```

### Próximos Pasos

1. **Implementar panel de API keys** en el dashboard de tienda
2. **Agregar métricas visuales** con gráficos de uso
3. **Crear documentación** para usuarios finales
4. **Agregar más endpoints públicos** según necesidades
5. **Implementar webhooks** para notificaciones en tiempo real

---

Desarrollado con ❤️ usando NestJS, TypeORM y Supabase.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
