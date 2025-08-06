# 🌐 API PÚBLICA PARA MOSTRAR PRODUCTOS EN SITIOS EXTERNOS

## 📋 Descripción

Este sistema permite a los usuarios mostrar sus productos de inventario en sus propias páginas web mediante una API pública segura. Los usuarios pueden generar API Keys para autenticar las peticiones desde sus sitios externos.

## 🔐 Sistema de API Keys

### 1. **Crear una API Key**

Los usuarios autenticados pueden crear API Keys para sus tiendas:

```http
POST /api-keys/{storeId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Mi Sitio Web",
  "description": "API Key para mostrar productos en mi sitio web",
  "allowedDomains": ["mitienda.com", "www.mitienda.com"]
}
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "key": "sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "name": "Mi Sitio Web",
  "description": "API Key para mostrar productos en mi sitio web",
  "allowedDomains": "[\"mitienda.com\", \"www.mitienda.com\"]",
  "isActive": true,
  "requestCount": 0,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### 2. **Listar API Keys de una tienda**

```http
GET /api-keys/{storeId}
Authorization: Bearer {jwt_token}
```

### 3. **Activar/Desactivar API Key**

```http
PATCH /api-keys/{apiKeyId}/toggle
Authorization: Bearer {jwt_token}
```

### 4. **Eliminar API Key**

```http
DELETE /api-keys/{apiKeyId}
Authorization: Bearer {jwt_token}
```

## 🌍 Endpoints Públicos

### 1. **Obtener productos**

```http
GET /public/products?api_key={api_key}&category={category}&limit={limit}&page={page}
```

**Parámetros:**
- `api_key` (requerido): La API Key generada
- `category` (opcional): Filtrar por categoría
- `limit` (opcional): Número de productos por página (máximo 100, default 20)
- `page` (opcional): Número de página (default 1)

**Respuesta:**
```json
{
  "products": [
    {
      "id": "product-uuid",
      "name": "Producto Ejemplo",
      "price": 99.99,
      "stock": 50,
      "category": "Electrónicos",
      "description": "Descripción del producto",
      "image": "https://example.com/image.jpg",
      "unit": "pz",
      "storeName": "Mi Tienda"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "store": {
    "id": "store-uuid",
    "name": "Mi Tienda"
  }
}
```

### 2. **Obtener un producto específico**

```http
GET /public/product/{productId}?api_key={api_key}
```

### 3. **Obtener categorías**

```http
GET /public/categories?api_key={api_key}
```

**Respuesta:**
```json
{
  "categories": ["Electrónicos", "Ropa", "Hogar"],
  "store": {
    "id": "store-uuid",
    "name": "Mi Tienda"
  }
}
```

### 4. **Obtener información de la tienda**

```http
GET /public/store-info?api_key={api_key}
```

**Respuesta:**
```json
{
  "store": {
    "id": "store-uuid",
    "name": "Mi Tienda",
    "isActive": true
  },
  "stats": {
    "totalProducts": 25,
    "totalCategories": 3
  }
}
```

## 🔧 Implementación en el Frontend

### Ejemplo con JavaScript vanilla:

```javascript
class TiendaAPI {
  constructor(apiKey, baseUrl = 'http://localhost:3000') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async obtenerProductos(categoria = '', limite = 20, pagina = 1) {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      limit: limite.toString(),
      page: pagina.toString()
    });

    if (categoria) {
      params.append('category', categoria);
    }

    const response = await fetch(`${this.baseUrl}/public/products?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  }

  async obtenerProducto(productId) {
    const response = await fetch(
      `${this.baseUrl}/public/product/${productId}?api_key=${this.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  }

  async obtenerCategorias() {
    const response = await fetch(
      `${this.baseUrl}/public/categories?api_key=${this.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  }
}

// Uso
const tienda = new TiendaAPI('sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6');

// Mostrar productos en el sitio web
tienda.obtenerProductos('Electrónicos', 10, 1)
  .then(data => {
    const productosContainer = document.getElementById('productos');
    data.products.forEach(producto => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="producto">
          <h3>${producto.name}</h3>
          <p>Precio: $${producto.price}</p>
          <p>Stock: ${producto.stock}</p>
          <p>${producto.description}</p>
        </div>
      `;
      productosContainer.appendChild(div);
    });
  })
  .catch(error => console.error('Error:', error));
```

### Ejemplo con React:

```jsx
import React, { useState, useEffect } from 'react';

const ProductosComponent = ({ apiKey }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/public/products?api_key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }
        
        const data = await response.json();
        setProductos(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [apiKey]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="productos-grid">
      {productos.map(producto => (
        <div key={producto.id} className="producto-card">
          <h3>{producto.name}</h3>
          <p className="precio">${producto.price}</p>
          <p className="stock">Stock: {producto.stock}</p>
          <p className="descripcion">{producto.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductosComponent;
```

## 🛡️ Seguridad

### Restricciones de Dominio
- Las API Keys pueden configurarse para trabajar solo en dominios específicos
- Se valida el header `Origin` o `Referer` de las peticiones
- Use `["*"]` para permitir cualquier dominio (no recomendado para producción)

### Límites de Uso
- Máximo 100 productos por página
- Se registra el número de peticiones y última vez usada
- Las API Keys pueden ser desactivadas en cualquier momento

### Mejores Prácticas
1. **Nunca exponer la API Key en el código fuente público**
2. **Usar HTTPS en producción**
3. **Configurar dominios específicos en lugar de usar `*`**
4. **Monitorear el uso de las API Keys regularmente**
5. **Rotar las API Keys periódicamente**

## 🚀 Casos de Uso

### 1. **Catálogo en Sitio Web**
Mostrar todos los productos de una tienda en el sitio web corporativo.

### 2. **Widget de Productos**
Crear un widget que muestre productos destacados en cualquier página.

### 3. **Aplicación Móvil**
Desarrollar una app móvil que consuma los productos via API.

### 4. **Marketplace Personal**
Crear un marketplace personalizado con productos de múltiples tiendas.

### 5. **Comparador de Precios**
Desarrollar un comparador que muestre productos de diferentes tiendas.

## 🔄 Flujo Completo

1. **Usuario se registra** en el sistema de inventario
2. **Paga su suscripción** y crea su tienda
3. **Agrega productos** a su inventario
4. **Genera una API Key** para su tienda
5. **Configura dominios permitidos** (opcional)
6. **Integra la API** en su sitio web/aplicación
7. **Muestra productos** en tiempo real desde su inventario

Este sistema permite a los usuarios tener un catálogo dinámico en sus sitios web que se actualiza automáticamente cuando modifican su inventario.
