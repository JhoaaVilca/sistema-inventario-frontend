# 08 — Decisiones Congeladas

**Versión:** 1.0.1 | **Estado:** OFICIAL

---

## 1. Decisiones D01–D20

| # | Decisión | Valor |
|---|----------|-------|
| D01 | Estilo | **Modular Monolith** por dominios |
| D02 | Despliegue | **Una** instancia |
| D03 | Base de datos | **Una** MySQL compartida |
| D04 | Aislamiento | **`empresa_id`**; unidad **Empresa** |
| D05 | Capa intermedia de aislamiento | **No existe** — solo Empresa |
| D06 | Autenticación | JWT stateless |
| D07 | Migraciones | **Flyway** |
| D08 | Storage | `storage/empresa-{id}/` |
| D09 | Roles | SUPER_ADMIN, EMPRESA_ADMIN, MANAGER, CAJERO, OPERADOR |
| D10 | Permisos | `{modulo}.{recurso}.{accion}` |
| D11 | Controllers | Solo HTTP |
| D12 | API | DTOs; no entidades JPA expuestas |
| D13 | Paquete raíz | `tienda.inventario` |
| D14 | Frontend | React 19 + Vite 7 |
| D15 | BD | MySQL 8 |
| D16 | White-label | Branding desde empresa |
| D17 | Fases | 1→2→3→4→5→6 secuencial |
| D18 | SUPER_ADMIN | Plataforma; no opera ventas clientes (Fase 4) |
| D19 | Autorización | Backend decide; frontend oculta UI |
| D20 | Microservicios | No prematuros |

---

## 2. Anti-patrones prohibidos

| Anti-patrón | Correcto |
|-------------|----------|
| Monolito plano | Modular Monolith |
| Segunda unidad de aislamiento en BD | Solo Empresa + empresa_id |
| ddl-auto=update en prod | Flyway |
| Lógica en controllers | Services |
| Branding hardcodeado | EmpresaContext |
| Storage mezclado | empresa-{id}/ |
| Permisos solo en UI | @PreAuthorize |
| Username global único | UNIQUE(empresa_id, username) |

---

## 3. Change control

Actualizar versión en todos los `docs/` afectados + `.cursor/rules/` + skill + changelog en `ARQUITECTURA-MAESTRA.md`.

---

## 4. Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-06-03 | Inicial |
| 1.0.1 | 2026-06-03 | D05 redacción; alineación A1–A4 |
