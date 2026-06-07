# 07 — Roadmap Técnico

**Versión:** 1.0.1 | **Estado:** OFICIAL

---

## 1. Visión general

| Fase | Nombre | Duración est. | Habilita |
|------|--------|---------------|----------|
| **1** | Fundamentos | 2–3 semanas | Schema versionado, white-label, capas limpias |
| **2** | Identidad | 3–4 semanas | Usuarios, RBAC, JWT con empresaId |
| **3** | Multiempresa | 4–6 semanas | Aislamiento real, segundo cliente |
| **4** | Super Admin | 3–4 semanas | Onboarding empresas |
| **5** | Sucursales | 2–3 semanas | Multi-sede |
| **6** | Comercial | 8+ semanas | Planes, billing, límites |

**Regla:** fases secuenciales. Fase 3 requiere Fase 2 completada.

---

## 2. Fase 1 — Secuencia canónica (ID = PR)

**Fuente única de verdad para numeración:** los IDs `1.x` coinciden con `PR-1.x`.  
Detalle de implementación: [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md) §8.

| ID / PR | Entregable | Repo | Riesgo | Depende de |
|---------|------------|------|--------|------------|
| **1.1** | Flyway + V1 baseline | BE | Bajo | — |
| **1.2** | GlobalExceptionHandler + ApiErrorResponse | BE | Bajo | 1.1 |
| **1.3** | CORS unificado; quitar @CrossOrigin y endpoint test proveedores | BE | Bajo | — |
| **1.4** | Eliminar hardcodes comerciales; seed por env; `.env.example` | BE+FE | Bajo | — |
| **1.5** | V2 schema branding empresa (razón social, colores, slug, logo_path) | BE | Medio | 1.1 |
| **1.6** | EmpresaStorageResolver; API logo; migrar storage a `empresa-1/` | BE | Medio | 1.5 |
| **1.7** | EmpresaContext + branding UI (Layout, Login, CSS variables) | FE | Medio | 1.5 |
| **1.8** | LoteService (extraer LoteControlador) | BE | Medio | — |
| **1.9** | DTOs Entrada + mapper | BE | Medio | — |
| **1.10** | DTOs Proveedor + mapper | BE | Bajo-Medio | — |
| **1.11** | ProductoService.registrarConStockInicial *(opcional)* | BE | Alto | — |
| **1.12** | KardexExportService *(opcional)* | BE | Bajo | — |
| **1.13** | Usuario autenticado en movimientos caja/salida | BE | Bajo | — |

### Orden de merge obligatorio

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.10 → 1.13 → 1.12 → 1.11
```

- **1.1** desbloquea migraciones (1.5, 1.6).
- **1.7** depende de **1.5** (campos branding en API).
- **1.6** depende parcialmente de **1.5**.
- **1.11** y **1.12** al final por mayor riesgo de regresión.

### Criterios de done Fase 1

- Flyway activo; `ddl-auto=validate` en dev.
- Cero hardcodes de negocio en código fuente.
- Branding dinámico visible en shell UI.
- Checklist regresión (§8) verde tras cada PR.

---

## 3. Fase 2 — Identidad

| ID | Entregable |
|----|------------|
| 2.1 | V3 tablas rol, permiso, usuario_rol |
| 2.2 | usuario.empresa_id + migración legacy |
| 2.3 | JWT: empresaId, roles, permisos |
| 2.4 | CRUD /api/usuarios |
| 2.5 | @PreAuthorize por permiso |
| 2.6 | AuthContext + RoleRoute (FE) |
| 2.7 | Menú filtrado por rol |
| 2.8 | Seed SUPER_ADMIN |

---

## 4. Fase 3 — Multiempresa

| ID | Entregable |
|----|------------|
| 3.1 | empresa_id en 14 tablas (V4a/b/c) |
| 3.2 | Unicidad compuesta (V5) |
| 3.3 | EmpresaContextFilter (backend) |
| 3.4 | Repositorios filtrados por empresa_id |
| 3.5 | Storage `empresa-{id}` desde JWT |
| 3.6 | Tests aislamiento inter-empresa |
| 3.7 | Fin singleton EmpresaServicio |

---

## 5. Fase 4 — Super Admin

| ID | Entregable |
|----|------------|
| 4.1 | /api/admin/empresas CRUD |
| 4.2 | Onboarding empresa + admin inicial |
| 4.3 | Panel /admin (FE) |
| 4.4 | AdminLayout separado |

---

## 6. Fase 5 — Sucursales

| ID | Entregable |
|----|------------|
| 5.1 | Tabla sucursal (V6) |
| 5.2 | caja_diaria.sucursal_id |
| 5.3 | Selector sucursal UI |

---

## 7. Fase 6 — Comercial

| ID | Entregable |
|----|------------|
| 6.1 | plan, suscripcion (V7) |
| 6.2 | Feature gating por plan |
| 6.3 | UI suscripción |
| 6.4 | Facturación SaaS |

---

## 8. Checklist regresión (obligatorio cada PR)

```
[ ] Login
[ ] Dashboard KPIs
[ ] CRUD producto
[ ] Entrada + factura
[ ] Venta contado → stock → kardex
[ ] Venta crédito
[ ] Apertura/cierre caja
[ ] Pago crédito
[ ] Ajuste kardex (rol con permiso)
[ ] Ticket PDF con datos empresa dinámicos
[ ] Configuración empresa GET/PUT
```

---

## 9. Métricas de éxito por fase

| Fase | Métrica |
|------|---------|
| 1 | Cero hardcodes; Flyway activo; branding dinámico visible |
| 2 | 5 roles funcionando; CRUD usuarios; JWT con empresaId |
| 3 | Tests aislamiento verdes; 2 empresas de prueba aisladas |
| 4 | Super Admin crea empresa + admin en < 2 min |
| 5 | Caja independiente por sucursal |
| 6 | Límite plan bloquea creación recursos |

---

## 10. Validación documental

Correcciones A1–A4: [INFORME-AUDITORIA-DOCUMENTACION.md](./INFORME-AUDITORIA-DOCUMENTACION.md)  
Estado código vs objetivo: [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md)
