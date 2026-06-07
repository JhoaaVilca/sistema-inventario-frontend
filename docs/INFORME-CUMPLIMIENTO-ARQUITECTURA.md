# Informe de Cumplimiento Arquitectónico

**Versión:** 1.0.1  
**Fecha:** 2026-06-03  
**Baseline código:** inventario-backend + inventario-frontend (estado actual)  
**Validación documental:** [INFORME-AUDITORIA-DOCUMENTACION.md](./INFORME-AUDITORIA-DOCUMENTACION.md) (v1.0.1)

---

## 1. Verificación de puntos críticos

Compara **documentación oficial v1.0.1** contra **código en ejecución**. La documentación fue alineada en correcciones A1–A4 (ver informe de auditoría).

| Punto | Documentación oficial | Código actual | Estado |
|-------|:---------------------:|:-------------:|:------:|
| Modular Monolith | Cumple | Monolito plano por capas | **INCUMPLE** |
| Empresa = único aislamiento | Cumple | Singleton empresa | **PARCIAL** |
| empresa_id en negocio | Cumple (Fase 3) | No existe en entidades | **INCUMPLE** |
| White-label | Cumple (Fase 1) | Hardcodes comerciales FE+BE | **INCUMPLE** |
| Branding desde empresa | Cumple | Solo ticket + página config | **PARCIAL** |
| Storage por empresa | Cumple `empresa-{id}/` | Segmento fijo `default` en storage | **PARCIAL** |
| 5 roles oficiales | Cumple (Fase 2) | ADMIN, USER (2 roles) | **INCUMPLE** |

---

## 2. Qué ya cumple la arquitectura

### Backend

| Área | Evidencia | Notas |
|------|-----------|-------|
| Stack aprobado | Spring Boot 3.5, Java 17, MySQL | Alineado |
| JWT stateless | `JwtUtil`, `SecurityConfig` | Falta empresaId en claims |
| Capa servicios parcial | 15 servicios + interfaces `I*` | Inconsistente |
| DTOs parciales | 33 DTOs en salidas, productos, clientes | Entrada/Proveedor sin DTO |
| Entidad Empresa | `modelo/Empresa.java` | Falta branding ampliado |
| API configuración empresa | `GET/PUT /api/empresa` | Singleton, no multi |
| Storage abstraído | `FileStorageService`, `LocalFileStorageService` | Parámetro de segmento incorrecto (no usa `empresa-{id}`) |
| Validación Bean | DTOs con `@Valid` parcial | Expandir |
| open-in-view=false | application.properties | Correcto |
| Integración RUC/DNI | `ApiConsultaService` | Correcto |

### Frontend

| Área | Evidencia | Notas |
|------|-----------|-------|
| Stack aprobado | React 19, Vite 7, Axios | Alineado |
| Módulos por dominio (parcial) | `src/modulos/{productos, Salidas...}` | No `src/modules/` aún |
| empresaService | `servicios/empresaService.js` | Solo config page + ticket |
| ConfiguracionEmpresa | CRUD datos fiscales | Sin logo/colores |
| Ticket dinámico | `TicketSalida80.jsx` usa API empresa | Parcialmente white-label |
| PrivateRoute | Verifica token | Sin roles/permisos |
| Paginación server-side | Listados con page/size | Patrón correcto |
| Tema CSS base | `bootstrap-olive.css` | Variables no conectadas a empresa |

---

## 3. Qué incumple la arquitectura

### Crítico (bloqueante SaaS)

| # | Incumplimiento | Ubicación | Fase |
|---|----------------|-----------|------|
| C1 | Sin `empresa_id` en tablas negocio | 16 entidades JPA | 3 |
| C2 | Empresa singleton | `EmpresaRepositorio.findFirstByOrderByIdEmpresa()` | 1→3 |
| C3 | Hardcode "COMERCIAL YOLI" | `EmpresaServicio.java:21` | 1 |
| C4 | Hardcode branding FE | Layout, Dashboard, Login, AuthLayout, index.html | 1 |
| C5 | Storage sin segmento por empresa | Resolver y propiedad legacy de storage; ruta `default/` | 1.6 |
| C6 | Solo 2 roles (ADMIN/USER) | `Usuario.rol`, `SecurityConfig` | 2 |
| C7 | Sin aislamiento datos | Todos los repositorios | 3 |

### Alto (deuda arquitectónica)

| # | Incumplimiento | Ubicación |
|---|----------------|-----------|
| A1 | Monolito plano (no dominios) | Paquetes `controlador/`, `servicios/`, `modelo/` |
| A2 | Lógica en controllers | ProductoControlador, KardexControlador, LoteControlador, SalidaControlador |
| A3 | Entidades expuestas API | Entrada, Proveedor, Lote, CajaDiaria |
| A4 | Repos en controllers | Salida, Credito, Lote, Producto controllers |
| A5 | ddl-auto=update dev | application-dev.properties |
| A6 | Sin Flyway | No existe db/migration |
| A7 | Seed credenciales código | DataInitializer tiendayamisa/123456 |
| A8 | DNI unique global | Cliente.java |
| A9 | username unique global | Usuario.java |
| A10 | CORS triplicado | SecurityConfig + @CrossOrigin × 8 controllers |
| A11 | Dos sistemas storage | FileStorageConfig uploads/ + storage/default/ |
| A12 | Sin GlobalExceptionHandler | Errores ad-hoc |
| A13 | JWT sin empresaId | JwtUtil.generateToken |
| A14 | Usuario "admin" hardcode | SalidaControlador:95 |

### Medio (frontend / calidad)

| # | Incumplimiento | Ubicación |
|---|----------------|-----------|
| M1 | Sin EmpresaContext | Todo el shell UI |
| M2 | Sin AuthContext / RBAC UI | role guardado pero no leído |
| M3 | Componentes >500 LOC | CajaDelDia 728, ListarProductos 670 |
| M4 | API inconsistente | axios directo vs services |
| M5 | salidaService.js huérfano | No importado |
| M6 | 403 → logout global | apiClient.js |
| M7 | Sin .env.example FE | Solo .env.development |
| M8 | Reglas Cursor | Corregidas en v1.0.1 (ver informe auditoría) |

---

## 4. Refactors obligatorios

| Prioridad | Refactor | Fase | PR |
|-----------|----------|------|-----|
| P0 | Flyway baseline | 1 | PR-1.1 |
| P0 | Eliminar hardcodes YOLI/yamisa | 1 | PR-1.4 |
| P0 | Empresa ampliada + branding API | 1 | PR-1.5, PR-1.6 |
| P0 | EmpresaContext FE | 1 | PR-1.7 |
| P0 | GlobalExceptionHandler | 1 | PR-1.2 |
| P1 | LoteService (extraer de controller) | 1 | PR-1.8 |
| P1 | DTOs Entrada/Proveedor | 1 | PR-1.9, PR-1.10 |
| P1 | CORS unificado | 1 | PR-1.3 |
| P1 | EmpresaStorageResolver + storage por empresa | 1 | 1.6 |
| P1 | Eliminar FileStorageConfig legacy | 1 | PR-1.6 |
| P2 | RBAC 5 roles + JWT empresaId | 2 | Fase 2 |
| P2 | empresa_id todas las tablas | 3 | Fase 3 |
| P2 | EmpresaContextFilter | 3 | Fase 3 |
| P2 | Unicidad compuesta | 3 | Fase 3 |

---

## 5. Refactors opcionales (mejora, no bloqueante Fase 1)

| Refactor | Beneficio | Cuándo |
|----------|-----------|--------|
| Renombrar `src/modulos/` → `src/modules/` | Convención doc | Fase 2 |
| ProductoService.registrarConStockInicial | Limpiar ProductoController | PR-1.11 |
| KardexExportService | Reducir KardexController | PR-1.12 |
| MapStruct vs mappers manuales | Mantenibilidad | Fase 2 |
| React Query | Cache API | Fase 2 |
| TypeScript incremental | Contratos API | Fase 3+ |
| OpenAPI/Swagger | Documentación API | Fase 4 |
| Partir componentes >500 LOC | Mantenibilidad FE | Fase 1–2 gradual |
| Eliminar endpoint test proveedores | Seguridad | PR-1.3 |

---

## 6. Riesgos abiertos

| Riesgo | Severidad | Mitigación | Estado |
|--------|-----------|------------|--------|
| Fuga datos inter-empresa | Crítica | empresa_id + tests Fase 3 | Abierto |
| Stock Producto vs Lote inconsistente | Alta | InventarioStockService | Abierto |
| Flyway baseline falla en prod | Alta | Probar en copia BD | Abierto |
| Romper FE al cambiar DTOs Entrada | Media | Mantener shape JSON | Abierto |
| JWT localStorage XSS | Media | httpOnly cookies (largo plazo) | Abierto |
| Sin tests automatizados | Alta | Suite Fase 1 smoke + Fase 3 aislamiento | Abierto |
| Credenciales default prod | Crítica | Env vars + fail-fast | Abierto |
| Regresión flujo venta→caja | Alta | Checklist manual cada PR | Abierto |

---

## 7. Estado documentación vs código

| Ámbito | Estado v1.0.1 |
|--------|----------------|
| Suite `docs/` (01–08, Maestro, README) | **Alineada** — ver [INFORME-AUDITORIA-DOCUMENTACION.md](./INFORME-AUDITORIA-DOCUMENTACION.md) |
| Reglas Cursor + Skill | **Alineadas** |
| Numeración Fase 1 (ID = PR) | **Unificada** en `07-ROADMAP-TECNICO.md` |
| Código aplicación | **Pendiente** — incumple objetivo; plan en §8 |

La documentación oficial **no contradice** el diseño aprobado. El **código** es la brecha activa.

---

## 8. Plan Fase 1 — PRs (canónico = `07-ROADMAP-TECNICO.md` §2)

Cada **ID 1.x** = **PR-1.x**. Orden de merge obligatorio en roadmap §2.

### 1.1 — Flyway baseline (BE)
- Añadir flyway-core dependency
- V1__baseline.sql desde schema actual
- ddl-auto=validate en dev
- **Riesgo:** bajo | **Rollback:** revertir pom + properties

### 1.2 — GlobalExceptionHandler (BE)
- ApiErrorResponse + handler
- Reemplazar RuntimeException genéricos gradualmente
- **Riesgo:** bajo

### 1.3 — CORS + limpieza seguridad (BE)
- Eliminar @CrossOrigin en 8 controllers
- Eliminar InventarioApplication corsConfigurer si existe
- Eliminar GET /api/proveedores/test/raw
- **Riesgo:** bajo | **Verificar:** FE en localhost:3001

### 1.4 — Eliminar hardcodes + seed por env (BE+FE)
- BE: EmpresaServicio sin YOLI; DataInitializer con env vars
- BE: V1.1__seed_empresa_legacy.sql (Flyway) opcional
- FE: reemplazar YOLI por fallbacks genéricos
- .env.example ambos repos
- **Riesgo:** bajo

### 1.5 — V2 empresa branding schema (BE)
- Migration: razon_social, logo_path, colores, slug, activo
- Actualizar Empresa entity + DTOs
- **Riesgo:** medio | **Verificar:** PUT/GET empresa

### 1.6 — Storage multiempresa (BE)
- Introducir `EmpresaStorageResolver` (reemplaza resolver legacy de storage)
- `StorageCategory.LOGOS`
- PUT/GET /api/empresa/logo
- Migrar `default/` → `empresa-1/`; eliminar `FileStorageConfig`
- Eliminar propiedad legacy de segmento fijo en `application.properties` (ver código; PR 1.6)
- **Riesgo:** medio | **Verificar:** upload factura entrada

### 1.7 — EmpresaContext + branding UI (FE)
- EmpresaContext, useEmpresa hook
- Layout, Login, Dashboard, document.title dinámicos
- ConfiguracionEmpresa: colores + logo
- Inyectar CSS variables
- **Riesgo:** medio | **Verificar:** visual en login y sidebar

### 1.8 — LoteService (BE)
- Extraer toda lógica LoteControlador
- Controller ~40 LOC
- **Riesgo:** medio | **Verificar:** alertas lotes, baja lote

### 1.9 — DTOs Entrada (BE)
- EntradaRequest/Response + mapper
- Mantener compatibilidad JSON donde sea posible
- **Riesgo:** medio | **Verificar:** CRUD entradas + facturas

### 1.10 — DTOs Proveedor (BE)
- ProveedorRequest/Response + mapper
- **Riesgo:** bajo-medio

### 1.11 — ProductoService stock inicial (BE) — OPCIONAL
- Mover lógica POST ProductoControlador
- **Riesgo:** alto | **Recomendación:** PR separado al final Fase 1

### 1.12 — KardexExportService (BE) — OPCIONAL
- Extraer CSV/PDF de KardexControlador
- **Riesgo:** bajo

### 1.13 — Usuario actual en movimientos (BE)
- SecurityContextHolder en SalidaControlador
- **Riesgo:** bajo

### Orden de merge

Ver [07-ROADMAP-TECNICO.md](./07-ROADMAP-TECNICO.md) §2 (fuente única).

---

## 9. Skill del proyecto

Recomendado: **Sí**, crear skill en `.cursor/skills/saas-platform-architecture/`.

Beneficio: el agente carga convenciones y decisiones congeladas automáticamente en tareas de desarrollo.

Ver: `.cursor/skills/saas-platform-architecture/SKILL.md`

---

## 10. Conclusión

El código actual es un **monolito tradicional funcional para una sola empresa**. La documentación oficial v1.0.1 define el **Modular Monolith multiempresa** con **Empresa** como única unidad de aislamiento (`empresa_id`).

| Ámbito | Estado |
|--------|--------|
| Documentación, reglas Cursor, skill | **Alineados** — validado en [INFORME-AUDITORIA-DOCUMENTACION.md](./INFORME-AUDITORIA-DOCUMENTACION.md) v1.0.1 |
| Código backend/frontend | **Pendiente de Fase 1+** |

**Próximo paso autorizado:** PR **1.1** Flyway baseline (`07-ROADMAP-TECNICO.md` §2).
