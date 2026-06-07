# Documento Maestro de Arquitectura SaaS

**Versión:** 1.0.1 | **Estado:** OFICIAL | **Fecha:** 2026-06-03

Este documento es el **índice ejecutivo**. El detalle vive en la suite `docs/`.

---

## Suite documental oficial

| Documento | Contenido |
|-----------|-----------|
| [README.md](./README.md) | Índice general y glosario |
| [01-ARQUITECTURA-SAAS.md](./01-ARQUITECTURA-SAAS.md) | Modular Monolith, capas, paquetes BE/FE |
| [02-CONVENCIONES-DESARROLLO.md](./02-CONVENCIONES-DESARROLLO.md) | Nombres, DTOs, servicios, excepciones |
| [03-MULTIEMPRESA.md](./03-MULTIEMPRESA.md) | empresa_id, white-label, EmpresaContext |
| [04-IDENTIDAD-PERMISOS.md](./04-IDENTIDAD-PERMISOS.md) | 5 roles, JWT, matriz RBAC |
| [05-BASE-DE-DATOS.md](./05-BASE-DE-DATOS.md) | Schema, Flyway, índices |
| [06-STORAGE.md](./06-STORAGE.md) | Storage local `empresa-{id}/` |
| [07-ROADMAP-TECNICO.md](./07-ROADMAP-TECNICO.md) | Fases 1–6; secuencia canónica PR 1.x |
| [08-DECISIONES-CONGELADAS.md](./08-DECISIONES-CONGELADAS.md) | 20 decisiones D01–D20 |
| [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md) | Gap código vs objetivo |
| [INFORME-AUDITORIA-DOCUMENTACION.md](./INFORME-AUDITORIA-DOCUMENTACION.md) | Validación documental v1.0.1 |

---

## Decisión arquitectónica principal

**Modular Monolith (B)** — un deploy, dominios aislados (`inventory`, `sales`, `identity`…), no monolito plano por capas.

---

## Principios inmutables

1. Una instancia + una BD MySQL compartida.
2. **Empresa** = única unidad de aislamiento (`empresa_id` en negocio).
3. Toda tabla de negocio con **`empresa_id`** (Fase 3).
4. Sistema **white-label** — branding desde configuración de empresa.
5. Storage: **`storage/empresa-{id}/`**
6. Roles: **SUPER_ADMIN, EMPRESA_ADMIN, MANAGER, CAJERO, OPERADOR**

---

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Spring Boot 3.5, Java 17, JPA, Security, JWT |
| Frontend | React 19, Vite 7, Bootstrap 5, Axios |
| BD | MySQL 8, Flyway |
| Storage | Disco local |

---

## Reglas Cursor y Skill

- Reglas: `.cursor/rules/`
- Skill: `.cursor/skills/saas-platform-architecture/SKILL.md`

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-06-03 | Suite documental inicial |
| 1.0.1 | 2026-06-03 | A1–A4: numeración Fase 1 unificada; léxico multiempresa; referencias corregidas |
