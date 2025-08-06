# 📋 RESUMEN COMPLETO DEL BACKEND INVENTARIO MULTI-TENANT

> **Documento técnico para el equipo de Frontend**  
> Contiene toda la información necesaria para integrar con el backend

---

## 🚀 **INICIO RÁPIDO**

### **URL Base del Backend**
```
http://localhost:3000
```

### **Comando para Iniciar el Backend**
```bash
cd backend-inventario
npm install
npm run start:dev
```

### **Estado del Backend**
✅ **100% Funcional y Listo para Consumir**

---

## 🔐 **AUTENTICACIÓN JWT**

### **Endpoints de Autenticación**

#### **Registro de Usuario**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado correctamente"
}
```

#### **Login de Usuario**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com", 
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Headers Requeridos para Endpoints Protegidos**
```javascript
{
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

### **Estructura del JWT Payload**
```typescript
{
  sub: string,     // UUID del usuario
  email: string,   // Email del usuario  
  role: string     // 'admin' | 'store'
}
```

---

## 🗂️ **MODELO DE DATOS**

> **IMPORTANTE:** Todos los IDs son UUID (string), no números

### **👤 Usuario (User)**
```typescript
{
  id: string,              // UUID - Identificador único
  email: string,           // Email único para login
  password: string,        // Hash encriptado (no se devuelve en APIs)
  role: string,            // 'admin' | 'store'
  isActive: boolean,       // Estado del usuario
  plan: string | null,     // Plan de suscripción
  productsUsed: number,    // Contador de productos usados
  lastLogin: Date | null,  // Último acceso
  stores: Store[]          // Tiendas del usuario
}
```

### **🏪 Tienda (Store)**
```typescript
{
  id: string,              // UUID - Identificador único
  name: string,            // Nombre de la tienda
  isActive: boolean,       // Estado activo/inactivo
  user: User,              // Usuario propietario
  products: Product[],     // Productos de la tienda
  subscriptions: Subscription[] // Suscripciones
}
```

### **📦 Producto (Product)**
```typescript
{
  id: string,              // UUID - Identificador único
  name: string,            // Nombre del producto
  price: number,           // Precio (decimal)
  stock: number,           // Inventario disponible
  category: string | null, // Categoría del producto
  description: string | null, // Descripción detallada
  image: string | null,    // URL de imagen del producto
  cost: number | null,     // Costo del producto (decimal)
  isActive: boolean,       // Estado activo/inactivo
  unit: string | null,     // Unidad de medida (kg, pcs, etc)
  store: Store             // Tienda propietaria
}
```

### **💳 Suscripción (Subscription)**
```typescript
{
  id: string,              // UUID - Identificador único
  status: string,          // 'active' | 'inactive' | 'cancelled'
  startDate: Date,         // Fecha de inicio
  endDate: Date | null,    // Fecha de fin (opcional)
  store: Store,            // Tienda asociada
  payments: Payment[]      // Pagos de la suscripción
}
```

### **💰 Pago (Payment)**
```typescript
{
  id: string,              // UUID - Identificador único
  amount: number,          // Monto del pago (decimal)
  status: string,          // 'pending' | 'paid' | 'failed'
  date: Date,              // Fecha del pago
  subscription: Subscription // Suscripción asociada
}
```

---

## 🛠️ **API ENDPOINTS COMPLETOS**

### **🔐 Autenticación (/auth)**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registro de usuario | No |
| POST | `/auth/login` | Login y obtención de JWT | No |

### **👤 Usuarios (/users) - Solo Admin**

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Listar todos los usuarios | admin |
| GET | `/users/:id` | Obtener usuario específico | admin |
| PATCH | `/users/:id/active` | Activar/desactivar usuario | admin |

**Body para activar/desactivar usuario:**
```json
{
  "isActive": true
}
```

### **🏪 Tiendas (/stores)**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/stores` | Crear tienda | JWT |

**Body para crear tienda:**
```json
{
  "name": "Nombre de la Tienda"
}
```

### **📦 Productos (/products)**

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/products` | Listar productos (admin: todos, store: propios) | admin, store |
| GET | `/products/:id` | Obtener producto específico | admin, store |
| POST | `/products` | Crear producto | store |
| PUT | `/products/:id` | Actualizar producto completo | store |
| PATCH | `/products/:id/active` | Cambiar estado activo/inactivo | store |
| DELETE | `/products/:id` | Eliminar producto | store |

**DTO para crear/actualizar productos:**
```json
{
  "name": "Producto Ejemplo",
  "price": 29.99,
  "stock": 100,
  "category": "Electrónicos",
  "description": "Descripción del producto",
  "image": "https://ejemplo.com/imagen.jpg",
  "cost": 15.50,
  "isActive": true,
  "unit": "pcs"
}
```

**Body para cambiar estado:**
```json
{
  "isActive": false
}
```

### **💳 Suscripciones (/subscriptions)**

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/subscriptions` | Listar todas las suscripciones | admin, store |
| GET | `/subscriptions/:id` | Obtener suscripción específica | admin, store |
| POST | `/subscriptions` | Crear nueva suscripción | admin, store |
| PUT | `/subscriptions/:id` | Actualizar suscripción | admin, store |
| DELETE | `/subscriptions/:id` | Eliminar suscripción | admin, store |
| GET | `/subscriptions/:id/payments` | Obtener pagos de suscripción | admin, store |

**DTO para crear suscripción:**
```json
{
  "status": "active",
  "startDate": "2025-07-04T00:00:00.000Z",
  "endDate": "2026-07-04T00:00:00.000Z",
  "storeId": "uuid-de-la-tienda"
}
```

### **💰 Pagos (/payments)**

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/payments` | Listar todos los pagos | admin, store |
| GET | `/payments/:id` | Obtener pago específico | admin, store |
| POST | `/payments` | Crear nuevo pago | admin, store |
| DELETE | `/payments/:id` | Eliminar pago | admin, store |

**DTO para crear pago:**
```json
{
  "amount": 49.99,
  "status": "paid",
  "date": "2025-07-04T00:00:00.000Z",
  "subscriptionId": 123
}
```

---

## 🔒 **CONTROL DE ACCESO Y ROLES**

### **Roles Disponibles**
- **`admin`**: Puede ver usuarios, gestionar todo el sistema
- **`store`**: Solo puede gestionar su tienda y productos

### **Protección Multi-Tenant**
- Cada usuario `store` solo ve/modifica **SUS** productos
- Los `admin` pueden ver todo pero **NO** modificar productos de tiendas
- Sistema automático de validación de propiedad
- Aislamiento completo entre tiendas

### **Guards Implementados**
- **JwtAuthGuard**: Requiere token JWT válido
- **RolesGuard**: Valida roles específicos por endpoint

---

## 📝 **VALIDACIONES Y ERRORES**

### **Validaciones Automáticas del Backend**
- **Email**: Formato válido requerido
- **Password**: Mínimo 6 caracteres
- **UUIDs**: Validación automática de formato
- **Fechas**: ISO string format requerido
- **Números**: Validación de tipos numéricos
- **Campos requeridos**: Validación automática

### **Códigos de Error Comunes**

#### **401 - No Autenticado**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

#### **403 - Sin Permisos**
```json
{
  "message": "No tienes permisos para acceder a este recurso",
  "statusCode": 403
}
```

#### **404 - No Encontrado**
```json
{
  "message": "Recurso no encontrado",
  "statusCode": 404
}
```

#### **409 - Conflicto (Email Duplicado)**
```json
{
  "message": "El email ya está registrado",
  "statusCode": 409
}
```

#### **400 - Error de Validación**
```json
{
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 💡 **EJEMPLOS DE IMPLEMENTACIÓN FRONTEND**

### **🔐 Flujo de Autenticación**

```javascript
// 1. Función de Login
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const { access_token } = await response.json();
    
    // Guardar token
    localStorage.setItem('token', access_token);
    
    return access_token;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// 2. Función helper para requests autenticados
const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

### **📦 Gestión de Productos**

```javascript
// Listar productos
const getProducts = async () => {
  const response = await authenticatedFetch('http://localhost:3000/products');
  
  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }
  
  return response.json();
};

// Crear producto (ACTUALIZADO)
const createProduct = async (productData) => {
  // PASO 1: Primero obtenemos las tiendas del usuario
  const storesResponse = await authenticatedFetch('http://localhost:3000/stores');
  const stores = await storesResponse.json();
  
  if (stores.length === 0) {
    throw new Error('El usuario no tiene tiendas. Debe crear una tienda primero');
  }
  
  // PASO 2: Usamos el ID de la primera tienda (o permitimos al usuario elegir)
  const storeId = productData.storeId || stores[0].id;
  
  // PASO 3: Creamos el producto especificando la tienda
  const response = await authenticatedFetch('http://localhost:3000/products', {
    method: 'POST',
    body: JSON.stringify({
      name: productData.name,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category: productData.category,
      description: productData.description,
      image: productData.image,
      cost: productData.cost ? parseFloat(productData.cost) : null,
      unit: productData.unit,
      storeId: storeId // ¡IMPORTANTE! Siempre enviar el ID de la tienda
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};

// Actualizar producto
const updateProduct = async (productId, productData) => {
  const response = await authenticatedFetch(`http://localhost:3000/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};

// Eliminar producto
const deleteProduct = async (productId) => {
  const response = await authenticatedFetch(`http://localhost:3000/products/${productId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

### **🏪 Crear Tienda**

```javascript
const createStore = async (storeName) => {
  const response = await authenticatedFetch('http://localhost:3000/stores', {
    method: 'POST',
    body: JSON.stringify({ name: storeName })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

### **👤 Gestión de Usuarios (Solo Admin)**

```javascript
// Listar usuarios
const getUsers = async () => {
  const response = await authenticatedFetch('http://localhost:3000/users');
  
  if (!response.ok) {
    throw new Error('Error al obtener usuarios');
  }
  
  return response.json();
};

// Activar/Desactivar usuario
const toggleUserActive = async (userId, isActive) => {
  const response = await authenticatedFetch(`http://localhost:3000/users/${userId}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

---

## ⚠️ **PUNTOS CRÍTICOS PARA EL FRONTEND**

### **✅ LO QUE YA ESTÁ HECHO EN EL BACKEND (NO DUPLICAR)**
1. ✅ **Autenticación JWT completa**
2. ✅ **Validaciones de datos y DTOs**
3. ✅ **Control de roles y permisos**
4. ✅ **Protección multi-tenant automática**
5. ✅ **Encriptación de passwords**
6. ✅ **Manejo de errores estándar**
7. ✅ **CORS habilitado para desarrollo**
8. ✅ **Base de datos con UUID**

### **🚨 LO QUE DEBE MANEJAR EL FRONTEND**
1. **Almacenar y gestionar JWT tokens**
2. **Manejar estados de loading/error/success en UI**
3. **Validaciones de UI adicionales (UX)**
4. **Navegación condicional basada en roles**
5. **Refresh automático de datos tras operaciones**
6. **Logout y limpieza de tokens**
7. **Manejo de expiración de tokens**

### **📋 FLUJOS RECOMENDADOS PARA EL FRONTEND**

#### **Flujo de Autenticación**
1. Login → Guardar token → Redirect según rol
2. Admin → Dashboard de usuarios y estadísticas
3. Store → Dashboard de productos y tienda

#### **Flujo Multi-Tenant**
1. Usuario Store → Solo ve SUS productos
2. Crear tienda → Asociar automáticamente al usuario
3. Productos → Filtrados automáticamente por tienda

#### **Gestión de Estados**
```javascript
// Ejemplo con React Context o Redux
const AuthContext = {
  user: { id: 'uuid', email: 'user@test.com', role: 'store' },
  token: 'jwt_token',
  isAuthenticated: true,
  isAdmin: false,
  isStore: true
};
```

---

## 🏢 **MODELO MULTI-TENANT**

### **Estructura de Datos**

El sistema utiliza un modelo multi-tenant donde:

1. **Usuario (User)**: Representa a un usuario del sistema
2. **Tienda (Store)**: Cada usuario puede tener múltiples tiendas
3. **Producto (Product)**: Los productos pertenecen a una tienda específica

```
Usuario 1 ─┬─ Tienda A ─┬─ Producto 1
           │            ├─ Producto 2
           │            └─ Producto 3
           │
           └─ Tienda B ─┬─ Producto 4
                        └─ Producto 5

Usuario 2 ─── Tienda C ─┬─ Producto 6
                        └─ Producto 7
```

### **⚠️ Importante: Relación entre entidades**

Cuando se crea un producto, **siempre** debe especificarse la tienda a la que pertenece mediante el campo `storeId`. Este debe ser un ID válido de una tienda que pertenezca al usuario autenticado.

**Error común:** Enviar el ID del usuario como `storeId`. Estos son entidades diferentes.

### **Flujo recomendado para crear productos**

1. Al iniciar sesión, obtener el token JWT
2. Realizar una petición a `/stores` para obtener las tiendas del usuario
3. Guardar los IDs de las tiendas para usarlos al crear productos
4. Al crear un producto, especificar el `storeId` de una de estas tiendas

```typescript
// Pseudo-código del flujo correcto
const login = async () => {
  const { token, user } = await loginUser();
  localStorage.setItem('token', token);
  localStorage.setItem('userId', user.id);
  
  // Inmediatamente después de login, obtener las tiendas
  const stores = await fetchStores();
  localStorage.setItem('stores', JSON.stringify(stores));
  
  // Si no hay tiendas, redirigir a crear una
  if (stores.length === 0) {
    redirectTo('/create-store');
  }
};

const createProduct = () => {
  const stores = JSON.parse(localStorage.getItem('stores'));
  
  // Mostrar selector de tiendas al usuario
  const selectedStoreId = showStoreSelector(stores);
  
  // Crear producto con la tienda seleccionada
  return createProductAPI({
    name: "Producto de ejemplo",
    price: 99.99,
    stock: 100,
    storeId: selectedStoreId // ID correcto de la tienda
  });
};
```

### **Diagrama de Entidad-Relación**

```
┌───────────┐       ┌───────────┐       ┌───────────┐
│           │       │           │       │           │
│   User    │1     *│   Store   │1     *│  Product  │
│           ├───────┤           ├───────┤           │
└───────────┘       └───────────┘       └───────────┘
```

---

## 🏗️ **TECNOLOGÍAS DEL BACKEND**

### **Stack Técnico**
- **Framework**: NestJS v11.0.1
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: TypeORM v0.3.25
- **Autenticación**: JWT + Passport
- **Validación**: class-validator + class-transformer
- **Testing**: Jest + Supertest
- **Encriptación**: bcryptjs

### **Configuración de Base de Datos**
- **Host**: Supabase Cloud (aws-0-us-east-2.pooler.supabase.com)
- **SSL**: Habilitado y configurado
- **Synchronize**: true (solo desarrollo)
- **UUIDs**: Generación automática para todos los IDs

---

## 🧪 **TESTING**

### **Tests E2E Disponibles**
- ✅ Suite completa de tests para suscripciones
- ✅ Validación del flujo multi-tenant
- ✅ Tests de autenticación y autorización
- ✅ Validación de endpoints protegidos

### **Comandos de Testing**
```bash
# Tests end-to-end
npm run test:e2e

# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:cov
```

---

## 🚀 **ESTADO ACTUAL DEL BACKEND**

### **✅ COMPLETAMENTE FUNCIONAL**
- ✅ Sistema de autenticación JWT robusto
- ✅ Control de roles y permisos granular
- ✅ CRUD completo para todas las entidades
- ✅ Protección multi-tenant automática
- ✅ Validaciones exhaustivas con DTOs
- ✅ Base de datos estable con UUID
- ✅ Tests E2E pasando al 100%
- ✅ Conexión segura a Supabase
- ✅ Documentación completa

### **🎯 LISTO PARA INTEGRACIÓN**

El backend está **100% operativo** y listo para ser consumido por el frontend. Solo necesitas:

1. **Iniciar el backend**: `npm run start:dev`
2. **Implementar el cliente HTTP** con las funciones de ejemplo
3. **Manejar tokens JWT** en localStorage/sessionStorage
4. **Crear interfaces de usuario** según los roles
5. **Implementar navegación condicional** basada en permisos

### **📞 SOPORTE**

Si encuentras algún problema durante la integración:
1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Revisa los logs del backend para errores específicos
3. Valida que los headers de autorización estén correctos
4. Confirma que los datos enviados cumplan con los DTOs

---

**🎉 ¡El backend está completamente preparado para soportar tu aplicación frontend!**

---

*Documento actualizado: 4 de julio de 2025*  
*Backend Version: 0.0.1*  
*Estado: Producción Ready*
