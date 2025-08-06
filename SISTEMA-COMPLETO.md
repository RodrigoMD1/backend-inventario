# 🚀 GUÍA COMPLETA: SISTEMA DE INVENTARIO CON API PÚBLICA

## 📋 Resumen del Sistema

Este sistema permite a los usuarios:
1. **Registrarse** y crear una cuenta
2. **Pagar suscripción** para activar su cuenta
3. **Crear tiendas** y agregar productos
4. **Generar API Keys** para mostrar productos en sus sitios web
5. **Integrar la API** en sus páginas para mostrar productos en tiempo real

## 🔄 Flujo Completo del Usuario

### 1. **Registro y Autenticación**
```http
POST /auth/register
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

### 2. **Inicio de Sesión**
```http
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

### 3. **Crear Tienda** (después de pagar suscripción)
```http
POST /stores
Authorization: Bearer {jwt_token}
{
  "name": "Mi Tienda Online"
}
```

### 4. **Agregar Productos**
```http
POST /products
Authorization: Bearer {jwt_token}
{
  "name": "Producto Ejemplo",
  "price": 99.99,
  "stock": 50,
  "category": "Electrónicos",
  "description": "Descripción del producto",
  "storeId": "uuid-de-la-tienda"
}
```

### 5. **Generar API Key**
```http
POST /api-keys/{storeId}
Authorization: Bearer {jwt_token}
{
  "name": "API Key para mi sitio web",
  "description": "Para mostrar productos en mitienda.com",
  "allowedDomains": ["mitienda.com", "www.mitienda.com"]
}
```

### 6. **Usar API Pública en el Sitio Web**
```javascript
// En el sitio web del usuario
const response = await fetch(
  'http://localhost:3000/public/products?api_key=sk_abc123...'
);
const data = await response.json();
```

## 🌍 Endpoints Disponibles

### **Endpoints Privados (Requieren JWT)**
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /stores` - Ver tiendas del usuario
- `POST /stores` - Crear tienda
- `GET /products` - Ver productos del usuario
- `POST /products` - Crear producto
- `PUT /products/{id}` - Actualizar producto
- `DELETE /products/{id}` - Eliminar producto
- `POST /api-keys/{storeId}` - Crear API Key
- `GET /api-keys/{storeId}` - Ver API Keys de una tienda
- `DELETE /api-keys/{id}` - Eliminar API Key
- `PATCH /api-keys/{id}/toggle` - Activar/desactivar API Key

### **Endpoints Públicos (Solo requieren API Key)**
- `GET /public/products` - Ver productos de una tienda
- `GET /public/product/{id}` - Ver un producto específico
- `GET /public/categories` - Ver categorías de productos
- `GET /public/store-info` - Información de la tienda

## 🛡️ Seguridad y Validaciones

### **Validación de Dominios**
- Las API Keys pueden restringirse a dominios específicos
- Se valida el header `Origin` o `Referer`
- Usar `["*"]` permite cualquier dominio (no recomendado)

### **Límites de Uso**
- Máximo 100 productos por página
- Tracking de uso por API Key
- Posibilidad de desactivar API Keys

### **Autenticación Multi-nivel**
- JWT para usuarios internos
- API Keys para acceso público
- Validación de propiedad de recursos

## 🎨 Personalización y Casos de Uso

### **Caso 1: Tienda Básica**
```javascript
// Mostrar todos los productos
fetch('/public/products?api_key=sk_abc123')
  .then(response => response.json())
  .then(data => mostrarProductos(data.products));
```

### **Caso 2: Filtrar por Categoría**
```javascript
// Mostrar solo productos de una categoría
fetch('/public/products?api_key=sk_abc123&category=Electrónicos')
  .then(response => response.json())
  .then(data => mostrarProductos(data.products));
```

### **Caso 3: Paginación**
```javascript
// Mostrar productos con paginación
fetch('/public/products?api_key=sk_abc123&page=2&limit=10')
  .then(response => response.json())
  .then(data => {
    mostrarProductos(data.products);
    actualizarPaginacion(data.pagination);
  });
```

### **Caso 4: Información de Tienda**
```javascript
// Mostrar información de la tienda
fetch('/public/store-info?api_key=sk_abc123')
  .then(response => response.json())
  .then(data => {
    document.getElementById('storeName').textContent = data.store.name;
    document.getElementById('totalProducts').textContent = data.stats.totalProducts;
  });
```

## 📱 Implementación Responsive

### **HTML Base**
```html
<div id="productos" class="productos-grid"></div>
<div id="paginacion" class="paginacion"></div>
```

### **CSS Responsive**
```css
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .productos-grid {
    grid-template-columns: 1fr;
  }
}
```

### **JavaScript Dinámico**
```javascript
class ProductManager {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.currentPage = 1;
    this.limit = 20;
  }

  async loadProducts(category = '', page = 1) {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      page: page.toString(),
      limit: this.limit.toString()
    });

    if (category) params.append('category', category);

    const response = await fetch(`${this.baseUrl}/public/products?${params}`);
    return response.json();
  }

  renderProducts(products) {
    const container = document.getElementById('productos');
    container.innerHTML = products.map(product => `
      <div class="producto-card">
        <h3>${product.name}</h3>
        <p class="precio">$${product.price}</p>
        <p class="stock">Stock: ${product.stock}</p>
        <p class="descripcion">${product.description}</p>
        <span class="categoria">${product.category}</span>
      </div>
    `).join('');
  }
}
```

## 🔧 Configuración del Proyecto

### **Dependencias Necesarias**
```bash
npm install @nestjs/common @nestjs/core @nestjs/typeorm typeorm
npm install class-validator class-transformer
npm install @nestjs/jwt @nestjs/passport passport-jwt
```

### **Variables de Entorno**
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/inventario
JWT_SECRET=tu_jwt_secret_aqui
PORT=3000
```

### **Configuración CORS**
```typescript
// main.ts
app.enableCors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Referer'],
  credentials: false
});
```

## 📊 Monitoreo y Analytics

### **Métricas por API Key**
- Número total de requests
- Última vez usado
- Productos más consultados
- Dominios de origen

### **Estadísticas de Tienda**
- Total de productos activos
- Categorías disponibles
- Uso de API Keys
- Rendimiento de endpoints

## 🚀 Despliegue y Producción

### **Preparación para Producción**
1. Configurar variables de entorno
2. Configurar base de datos PostgreSQL
3. Configurar dominios específicos en API Keys
4. Implementar rate limiting
5. Configurar HTTPS
6. Configurar logging y monitoreo

### **Comando de Despliegue**
```bash
npm run build
npm run start:prod
```

## 🎯 Próximas Mejoras

### **Funcionalidades Avanzadas**
- [ ] Webhook para notificaciones de cambios
- [ ] Cache para mejorar rendimiento
- [ ] Búsqueda avanzada de productos
- [ ] Filtros por precio, stock, etc.
- [ ] Imágenes de productos
- [ ] Categorías jerárquicas
- [ ] Productos relacionados
- [ ] Reseñas y calificaciones

### **Mejoras de Seguridad**
- [ ] Rate limiting por API Key
- [ ] Logging detallado de accesos
- [ ] Detección de uso anómalo
- [ ] Rotación automática de API Keys
- [ ] Encriptación de datos sensibles

### **Optimizaciones**
- [ ] CDN para imágenes
- [ ] Cache Redis
- [ ] Compresión de respuestas
- [ ] Paginación más eficiente
- [ ] Índices de base de datos optimizados

Este sistema proporciona una base sólida para que los usuarios puedan mostrar sus productos de inventario en cualquier sitio web de forma segura y eficiente.
