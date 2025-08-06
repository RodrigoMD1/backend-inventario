# SOLUCIÓN AL ERROR DE CLAVE FORÁNEA DE TIENDA EN PRODUCTOS

## Problema Identificado

Se detectó un error de violación de clave foránea al crear productos en el sistema:

```
Error: insert or update on table "product" violates foreign key constraint "FK_32eaa54ad96b26459158464379a"
Detail: Key (storeId)=(8efc03a2-f607-4b49-9373-47dba85f86c6) is not present in table "store"
```

## Causas del Problema

El análisis identificó las siguientes causas:

1. **Confusión entre userId y storeId**: El backend estaba usando el ID del usuario (userId) como si fuera el ID de la tienda (storeId), cuando en realidad son entidades diferentes.

2. **Falta de soporte para storeId en DTO**: El DTO de creación de productos no incluía un campo para especificar explícitamente la tienda.

3. **Relaciones incompletas**: El servicio no cargaba correctamente las relaciones anidadas `store.user` lo que causaba problemas en la validación de propiedad.

4. **Lógica incorrecta de validación**: Se estaba comparando `product.store.id` con `user.userId`, cuando lo correcto es `product.store.user.id` con `user.userId`.

## Solución Implementada

### 1. Actualización del DTO de Producto

Se agregó el campo `storeId` al DTO de creación de productos:

```typescript
export class CreateProductDto {
  // ...campos existentes...
  
  @IsUUID('4', { message: 'storeId debe ser un UUID válido' })
  @IsOptional()
  storeId?: string;
}
```

### 2. Mejora en el Servicio de Productos

Se modificó el servicio para manejar adecuadamente el storeId:

```typescript
async create(data: Partial<Product> & { storeId?: string }) {
  // Si se proporciona un storeId explícito, usarlo
  if (data.storeId) {
    console.log('Usando storeId proporcionado por el frontend:', data.storeId);
    const store = await this.storeRepository.findOne({ where: { id: data.storeId } });
    if (!store) {
      throw new NotFoundException(`La tienda con ID ${data.storeId} no existe`);
    }
    
    // Usar la tienda encontrada
    const product = this.productRepository.create({
      ...data,
      store: store
    });
    return this.productRepository.save(product);
  } else {
    // Comportamiento original si no hay storeId específico
    console.log('Usando store proporcionado por el controller');
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }
}
```

### 3. Corrección en el Controlador

Se actualizó el controlador para validar correctamente la propiedad de la tienda:

```typescript
@Post()
@Roles('store')
async create(@Body() data: CreateProductDto, @Req() req: { user: JwtUser }) {
  this.logger.log(`Creating product: ${JSON.stringify(data)}`);
  
  // Si viene un storeId en el DTO, verificar que la tienda pertenezca al usuario
  if (data.storeId) {
    const store = await this.storeRepository.findOne({
      where: { id: data.storeId },
      relations: ['user']
    });
    
    if (!store) {
      throw new Error(`La tienda con ID ${data.storeId} no existe`);
    }
    
    if (store.user.id !== req.user.userId) {
      throw new Error(`No tienes permisos para crear productos en esta tienda`);
    }
    
    return this.productsService.create(data);
  } else {
    // Si no viene storeId, buscar la tienda del usuario
    const stores = await this.storeRepository.find({
      where: { user: { id: req.user.userId } }
    });
    
    if (!stores || stores.length === 0) {
      throw new Error('El usuario no tiene tiendas asociadas');
    }
    
    // Usar la primera tienda del usuario
    const storeId = stores[0].id;
    
    return this.productsService.create({
      ...data,
      storeId
    });
  }
}
```

### 4. Corrección en las Validaciones de Propiedad

Se modificaron todos los métodos protegidos para cargar y comparar correctamente:

```typescript
async findOneProtected(id: string, user: JwtUser) {
  const product = await this.productRepository.findOne({ 
    where: { id }, 
    relations: ['store', 'store.user'] // Cargar la relación anidada
  });
  if (!product) throw new NotFoundException('Producto no encontrado');
  if (user.role !== 'admin' && product.store.user.id !== user.userId) {
    throw new ForbiddenException('No tienes acceso a este producto');
  }
  return product;
}
```

### 5. Detección Inteligente de Error Común

Se ha implementado una detección automática para el caso común donde el frontend envía el ID del usuario como si fuera el ID de la tienda:

```typescript
// Detectar si el frontend está enviando el userId como storeId (error común)
if (data.storeId === req.user.userId) {
  this.logger.warn(`El frontend está enviando el userId como storeId. Buscando tiendas del usuario...`);
  
  // Buscar las tiendas del usuario
  const stores = await this.storeRepository.find({
    where: { user: { id: req.user.userId } }
  });
  
  // Usar la primera tienda del usuario y mostrar advertencia
  const storeId = stores[0].id;
  this.logger.log(`Corrigiendo automáticamente: usando la tienda ${storeId} del usuario`);
  
  return this.productsService.create({
    ...data,
    storeId
  });
}
```

### 6. Mensajes de Error Mejorados

El sistema ahora proporciona mensajes de error más descriptivos que incluyen la lista de tiendas disponibles cuando se detecta un problema:

```
Error: La tienda con ID 8efc03a2-f607-4b49-9373-47dba85f86c6 no existe. Debe proporcionar un ID de tienda válido.

Tiendas disponibles para este usuario:
- Mi Tienda: 58dd31af-d2a9-49a7-b006-e03ce01503d4
- Segunda Tienda: 3f9be4ab-1198-421c-8931-d98a611abcde
```

## Resultado

Con estas modificaciones:

1. El frontend ahora puede enviar explícitamente el `storeId` al crear productos
2. El backend valida correctamente que el usuario sea propietario de la tienda
3. Se mantiene la compatibilidad con el código existente
4. La lógica de autorización funciona correctamente

## Instrucciones para el Frontend

El frontend ahora puede crear productos de dos maneras:

### Opción 1: Especificando la tienda

```javascript
// El frontend debe incluir el storeId en la petición
const response = await fetch('http://localhost:3000/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Nuevo Producto",
    price: 99.99,
    stock: 100,
    storeId: "4b74cbdf-20f6-416d-97d8-5645ea4d5c3b" // ID de la tienda específica
  })
});
```

### Opción 2: Usando la tienda predeterminada

```javascript
// El backend usará la primera tienda del usuario
const response = await fetch('http://localhost:3000/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Nuevo Producto",
    price: 99.99,
    stock: 100
    // No incluir storeId, el backend lo determinará automáticamente
  })
});
```

## Instrucciones para Corregir el Frontend

Si el frontend está enviando el ID del usuario como storeId, debe modificar su implementación:

1. **Obtener primero las tiendas del usuario**: Realizar una petición a `/stores` para obtener todas las tiendas del usuario autenticado

2. **Seleccionar la tienda adecuada**: Usar el ID de una de estas tiendas como `storeId` al crear productos

3. **Implementación recomendada**: Mostrar al usuario un selector de tiendas si tiene más de una

```javascript
// 1. Obtener las tiendas del usuario
const storesResponse = await fetch('http://localhost:3000/stores', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const stores = await storesResponse.json();

// 2. Usar el ID de la primera tienda (o permitir selección)
const storeId = stores[0].id;

// 3. Crear el producto con la tienda correcta
const response = await fetch('http://localhost:3000/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Nuevo Producto",
    price: 99.99,
    stock: 100,
    storeId: storeId // ID correcto de la tienda
  })
});
```

## Diagnóstico para Futuros Problemas

En caso de futuros problemas, el backend ahora proporciona mensajes de error más detallados y registra información de diagnóstico en los logs.
