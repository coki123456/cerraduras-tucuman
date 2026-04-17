# Pantallas del Sistema - Cerraduras Tucumán

## Documento de Inventario de Pantallas

**Fecha**: Abril 2026
**Versión**: 1.5
**Propósito**: Documentación completa de todas las pantallas/páginas del sistema para rediseño en Google Stitch

---

## 1. Pantallas Públicas (Sin Login)

### 1.1 Página Principal / Catálogo Público
- **Ruta**: `/`
- **Descripción**: Landing page con catálogo público de productos
- **Componentes clave**:
  - CabeceraPublica (header con logo y botones login/registro)
  - CatalogoPublico (listado de productos)
  - Footer
- **Roles que ven**: Todos (sin autenticar)
- **Funcionalidades**:
  - Visualizar productos activos
  - Buscar y filtrar por categoría
  - Ver precio
  - Botón "Comprar" que redirige a login (sin mostrar cartel)

### 1.2 Página de Login
- **Ruta**: `/auth/login` o `/login`
- **Descripción**: Formulario de inicio de sesión
- **Componentes clave**:
  - FormularioLogin
  - Links de registro y recuperar contraseña
- **Funcionalidades**:
  - Login con email/contraseña
  - Redirect automático a dashboard según rol
  - Validación de credenciales
  - Link a signup

### 1.3 Página de Registro
- **Ruta**: `/auth/signup` o `/signup`
- **Descripción**: Formulario de creación de nueva cuenta
- **Componentes clave**:
  - FormularioSignup
- **Funcionalidades**:
  - Registro con email/contraseña
  - Confirmación por email via Brevo
  - Validaciones
  - Link a login

---

## 2. Pantallas de Cliente Autenticado

### 2.1 Dashboard Principal
- **Ruta**: `/dashboard`
- **Descripción**: Panel de bienvenida/inicio rápido
- **Roles**: cliente, empleado, admin
- **Funcionalidades**: Resumen rápido, accesos directos

### 2.2 Mi Perfil
- **Ruta**: `/dashboard/perfil`
- **Descripción**: Gestión de datos personales
- **Componentes**:
  - FormularioPerfil (editar nombre, teléfono, dirección, ciudad, empresa)
  - FormarioCambiarContrasena (cambiar password)
- **Funcionalidades**:
  - Editar información personal
  - Cambiar contraseña
  - Mostrar/ocultar contraseña

### 2.3 Catálogo de Productos (Dashboard)
- **Ruta**: `/dashboard/productos`
- **Descripción**: Listado de productos con filtros
- **Componentes**:
  - PaginaProductosCliente
  - FiltrosProductos
  - TarjetaProducto
- **Funcionalidades**:
  - Listar productos (admin ve todos, cliente ve activos)
  - Buscar por nombre/SKU
  - Filtrar por categoría
  - Ver stock
  - Agregar al carrito (cliente)
  - Editar (admin)
  - Botón "Nuevo" (admin)

### 2.4 Detalle de Producto
- **Ruta**: `/dashboard/productos/[id]`
- **Descripción**: Vista detallada de un producto
- **Funcionalidades**:
  - Imagen del producto
  - Nombre, SKU, categoría
  - Descripción
  - Precio
  - Stock actual
  - Stock mínimo

### 2.5 Nuevo/Editar Producto (Admin)
- **Ruta**: `/dashboard/productos/nuevo` o `/dashboard/productos/[id]/edit`
- **Descripción**: Formulario CRUD para productos
- **Funcionalidades**:
  - Crear nuevo producto
  - Editar producto existente
  - Upload de imagen
  - Validaciones

### 2.6 Carrito de Compras
- **Ruta**: `/dashboard/carrito`
- **Descripción**: Visualizar carrito antes de checkout
- **Funcionalidades**:
  - Listar items del carrito
  - Modificar cantidades
  - Eliminar items
  - Ver total
  - Proceder a checkout

### 2.7 Checkout
- **Ruta**: `/dashboard/checkout`
- **Descripción**: Completar compra
- **Funcionalidades**:
  - Ingresar datos de entrega
  - Elegir método entrega (local/envío)
  - Resumen de compra
  - Ir a pago MercadoPago

### 2.8 Páginas de Retorno de Pago
- **Ruta**: `/dashboard/pago/exito`, `/dashboard/pago/fallo`, `/dashboard/pago/pendiente`
- **Descripción**: Confirmación del resultado de pago
- **Funcionalidades**:
  - Mostrar estado del pago
  - Opciones según resultado

### 2.9 Mis Compras / Historial
- **Ruta**: `/dashboard/compras`
- **Descripción**: Historial de compras del cliente
- **Funcionalidades**:
  - Listar compras realizadas
  - Ver detalles de compra
  - Seguimiento de estado
  - Descargar factura (si aplica)

### 2.10 Detalle de Compra Individual
- **Ruta**: `/dashboard/compras/[id]`
- **Descripción**: Detalles completos de una compra
- **Funcionalidades**:
  - Items comprados
  - Monto
  - Estado
  - Método entrega
  - Fecha
  - Datos de envío

---

## 3. Pantallas de Empleado

### 3.1 Dashboard Empleado
- **Ruta**: `/dashboard`
- **Descripción**: Panel de inicio de empleado
- **Funcionalidades**: Acceso a visitas y consultas

### 3.2 Gestión de Visitas
- **Ruta**: `/dashboard/visitas`
- **Descripción**: CRUD de visitas técnicas
- **Funcionalidades**:
  - Listar visitas asignadas
  - Crear nueva visita
  - Cambiar estado (pendiente/en proceso/completada)
  - Ver línea de tiempo
  - Asignar a cliente
  - Notas de visita

### 3.3 Reportes (Empleado)
- **Ruta**: `/dashboard/reportes`
- **Descripción**: Vista de reportes básicos
- **Funcionalidades**: Ver datos limitados según permiso

---

## 4. Pantallas de Admin

### 4.1 Dashboard Admin
- **Ruta**: `/dashboard`
- **Descripción**: Panel de control general
- **Funcionalidades**: Resumen, KPIs rápidos

### 4.2 Gestión Completa de Productos
- **Ruta**: `/dashboard/productos`
- **Descripción**: Admin puede ver todos los productos (activos e inactivos)
- **Funcionalidades**: Todas las del cliente + edición completa

### 4.3 Ventas Totales
- **Ruta**: `/dashboard/admin/ventas`
- **Descripción**: Historial completo de todas las ventas
- **Componentes**:
  - Tabla de ventas
  - Filtros
  - Ver detalles
- **Funcionalidades**:
  - Listar todas las ventas
  - Ver estado
  - Ver cliente
  - Fecha
  - Monto
  - Acceder a detalles

### 4.4 Ventas Pendientes de Entrega ⭐ NUEVA
- **Ruta**: `/dashboard/admin/ventas-pendientes`
- **Descripción**: Panel para gestionar entregas/envíos
- **Componentes**:
  - Tabla de pendientes
  - ActualizadorEstadoEntrega
  - Tabla de últimas entregas
- **Funcionalidades**:
  - Listar ventas pagadas pero no entregadas
  - Marcar como "Retirado en local" (si cliente eligió retirar)
  - Marcar como "Enviado" (si cliente eligió envío)
  - Ver historial de entregas
  - Filtrar por estado
  - Ver datos del cliente

### 4.5 Alertas de Stock
- **Ruta**: `/dashboard/admin/alertas-stock`
- **Descripción**: Monitoreo de stock bajo
- **Funcionalidades**:
  - Listar productos bajo stock mínimo
  - Crear alerta
  - Marcar como revisado

### 4.6 Gestión de Visitas
- **Ruta**: `/dashboard/visitas`
- **Descripción**: Admin puede ver y gestionar todas las visitas
- **Funcionalidades**: Control total de visitas técnicas

### 4.7 Reportes Avanzados
- **Ruta**: `/dashboard/reportes`
- **Descripción**: Análisis y estadísticas detalladas
- **Subpáginas**:
  - Reportes de Ventas (por período, categoría, etc.)
  - Reportes de Productos (más vendidos, con bajo stock, etc.)
  - Reportes de Clientes (nuevos, frecuentes, etc.)
- **Funcionalidades**:
  - Gráficos con Recharts
  - Filtros por fecha
  - Exportar a PDF/CSV
  - Análisis de tendencias

### 4.8 Gestión de Usuarios
- **Ruta**: `/dashboard/admin/usuarios` (no visible en exploración)
- **Descripción**: CRUD de usuarios (si existe)
- **Funcionalidades**: Crear/editar/eliminar usuarios y roles

---

## 5. Resumen de Rutas por Rol

### Cliente
- `/` (lectura)
- `/auth/login`, `/auth/signup`
- `/dashboard`
- `/dashboard/perfil`
- `/dashboard/productos`
- `/dashboard/productos/[id]`
- `/dashboard/carrito`
- `/dashboard/checkout`
- `/dashboard/pago/*`
- `/dashboard/compras`
- `/dashboard/compras/[id]`

### Empleado
- `/dashboard`
- `/dashboard/perfil`
- `/dashboard/productos` (lectura)
- `/dashboard/productos/[id]`
- `/dashboard/visitas` (CRUD)
- `/dashboard/reportes`

### Admin
- **Todas las rutas del cliente + empleado +**
- `/dashboard/productos` (CRUD completo)
- `/dashboard/productos/nuevo`
- `/dashboard/productos/[id]/edit`
- `/dashboard/admin/ventas`
- `/dashboard/admin/ventas-pendientes` ⭐
- `/dashboard/admin/alertas-stock`
- `/dashboard/reportes` (datos completos)

---

## 6. Prioridad de Rediseño (Google Stitch)

### Alta Prioridad (Usuario-Facing)
1. ✅ Página Principal (/) — landing
2. ✅ Catálogo de Productos (/dashboard/productos)
3. ✅ Detalle de Producto (/dashboard/productos/[id])
4. ✅ Carrito (/dashboard/carrito)
5. ✅ Checkout (/dashboard/checkout)
6. ✅ Perfil (/dashboard/perfil)
7. ✅ Mis Compras (/dashboard/compras)

### Media Prioridad (Admin-facing)
1. ✅ Ventas Pendientes (/dashboard/admin/ventas-pendientes)
2. ⏳ Ventas Totales (/dashboard/admin/ventas)
3. ⏳ Reportes (/dashboard/reportes)

### Baja Prioridad (Menos usado)
1. Login/Signup
2. Alertas de Stock
3. Gestión de Visitas

---

## 7. Componentes Clave Compartidos

- `TarjetaProducto` — muestra producto individual
- `FiltrosProductos` — búsqueda + categoría
- `InsigniaStock` — estado visual del stock
- `InsigniaEstadoVenta` — badge de estado
- `FormularioPerfil` — editar perfil
- `FormarioCambiarContrasena` — cambiar password
- `ActualizadorEstadoEntrega` — marcar entregada/enviada

---

## 8. Notas para el Rediseño

- **Responsive**: Todas las pantallas deben ser mobile-first
- **Colores**: Usar tema oscuro (dark mode) con amarillo (#F5C518) como primario
- **Tipografía**: Geist Sans para interfaces, Geist Mono para datos
- **Componentes**: Usar shadcn/ui como base
- **Funcionalidad**: Mantener todas las funcionalidades durante rediseño
- **Accesibilidad**: WCAG 2.1 AA como mínimo

---

## 9. Pantallas Nuevas Implementadas (v1.5)

✅ `/dashboard/perfil` — mejorada con cambio de contraseña
✅ `/dashboard/productos/[id]` — mejorada con imagen grande
✅ `/dashboard/admin/ventas-pendientes` — nueva, gestión de entregas

---

**Preparado para**: Google Stitch Wireframing
**Próximo paso**: Crear mockups de cada pantalla en Google Stitch
