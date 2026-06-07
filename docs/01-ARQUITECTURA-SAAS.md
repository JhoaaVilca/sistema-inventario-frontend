# 01 — Arquitectura SaaS Multiempresa

**Versión:** 1.0.1 | **Estado:** OFICIAL

---

## 1. Declaración arquitectónica

| Atributo | Valor oficial |
|----------|---------------|
| Estilo | **Modular Monolith (opción B)** |
| Instancias | **Una** aplicación |
| Base de datos | **Una** MySQL compartida |
| Aislamiento | Columna **`empresa_id`** en tablas de negocio |
| Unidad de aislamiento | **Empresa** (tabla `empresa`) |
| Frontend | React 19 + Vite 7 SPA white-label |
| Backend | Spring Boot 3.5 + Java 17 |
| Auth | JWT stateless |
| Schema | Flyway (desde Fase 1) |

### Modular Monolith vs Monolito tradicional

**Monolito tradicional (rechazado):** paquetes planos sin fronteras de dominio.

**Modular Monolith (aprobado):** un JAR/deploy, dominios aislados, reglas de dependencia entre capas.

---

## 2. Modelo lógico

```
Empresa (raíz de aislamiento)
├── Usuarios + Roles + Permisos
├── [Fase 5] Sucursales
├── Productos, Categorías, Clientes, Proveedores
├── Compras, Ventas, Créditos, Caja, Kardex
├── Branding (nombre, logo, colores, datos fiscales)
└── [Fase 6] Suscripción / Plan
```

---

## 3. Capas y paquetes

Ver estructura completa en secciones 5–6. Reglas: `api` → `application` → `domain` ← `infrastructure`.

---

## 4. White-label

Sin nombres comerciales ni colores de cliente en código. Branding desde tabla `empresa` + `EmpresaContext`. Ver [03-MULTIEMPRESA.md](./03-MULTIEMPRESA.md).

---

## 5. Estructura backend (objetivo)

**Raíz:** `tienda.inventario`

```
tienda.inventario
├── domain/{platform,identity,settings,inventory,purchases,sales,customers,suppliers,finance,reports}
├── application/
├── api/
├── infrastructure/{persistence,storage,security,integration,config}
└── shared/{dto,exception,event,util}
```

`domain/platform` = Super Admin (Fase 4), no es otra raíz de datos.

---

## 6. Estructura frontend (objetivo)

```
src/modules/{identity,settings,inventory,purchases,sales,customers,suppliers,reports,platform,billing}
src/shared/{api,contexts,hooks,ui,routes,styles}
```

Legacy: `src/modulos/` → migrar gradualmente.

---

## 7. Referencias

- [03-MULTIEMPRESA.md](./03-MULTIEMPRESA.md)
- [07-ROADMAP-TECNICO.md](./07-ROADMAP-TECNICO.md)
- [08-DECISIONES-CONGELADAS.md](./08-DECISIONES-CONGELADAS.md)
