# Plan de Proyecto - Cerraduras Tucumán

## 🏗️ Estado de la Infraestructura
- [x] Migración de archivos al root (Hoisting)
- [x] Limpieza de archivos legacy y carpetas innecesarias
- [x] Configuración de Next.js 16 y React 19
- [x] Configuración de Docker (Dockerfile y docker-compose.yml)
- [x] Integración con Supabase (Auth & DB)
- [x] Integración con Mercado Pago

## 📱 Funcionalidades del Aplicativo
### Dashboard (Panel de Control)
- [x] Dashboard de Administrador (KPIs de ventas, alertas de stock, reportes)
- [x] Dashboard de Empleado (Gestión de visitas y tareas pendientes)
- [x] Dashboard de Cliente (Historial de compras)
- [x] Sistema de Roles y Redirección Automática

### Tienda Pública (Modern UI - Shadcn/UI)
- [x] Catálogo de productos activo con modo oscuro/claro
- [x] Sistema de Carrito de Compras persistente
- [x] Proceso de Checkout y Pago integrado con Mercado Pago
- [x] Generación de Comprobantes dinámicos (PDF/Canvas)

### Gestión de Datos e Interfaz
- [x] Implementación de componentes con Shadcn/UI y Radix UI
- [x] Gestión de Productos, Categorías y Stock
- [x] Sistema de Visitas Técnicas coordinadas
- [x] Reportes Visuales con Recharts

## 🚀 Despliegue (Coolify)
- [ ] Configuración final de variables de entorno (`.env`)
- [ ] Verificación de `.dockerignore` y `.gitignore`
- [ ] Build de producción exitoso
- [ ] Despliegue en servidor via Coolify
- [ ] Configuración de dominio y SSL
