# Documentación oficial — Plataforma SaaS Multiempresa

**Versión documental:** 1.0.1  
**Estado:** OFICIAL — Fuente única de verdad  
**Última actualización:** 2026-06-03  

## Índice de documentos

| # | Documento | Descripción |
|---|-----------|-------------|
| 1 | [01-ARQUITECTURA-SAAS.md](./01-ARQUITECTURA-SAAS.md) | Modular Monolith, capas, paquetes |
| 2 | [02-CONVENCIONES-DESARROLLO.md](./02-CONVENCIONES-DESARROLLO.md) | Nombres, DTOs, servicios |
| 3 | [03-MULTIEMPRESA.md](./03-MULTIEMPRESA.md) | Aislamiento por `empresa_id` |
| 4 | [04-IDENTIDAD-PERMISOS.md](./04-IDENTIDAD-PERMISOS.md) | Roles, JWT, RBAC |
| 5 | [05-BASE-DE-DATOS.md](./05-BASE-DE-DATOS.md) | Schema, Flyway |
| 6 | [06-STORAGE.md](./06-STORAGE.md) | Almacenamiento `empresa-{id}/` |
| 7 | [07-ROADMAP-TECNICO.md](./07-ROADMAP-TECNICO.md) | Fases 1–6; PRs 1.x canónicos |
| 8 | [08-DECISIONES-CONGELADAS.md](./08-DECISIONES-CONGELADAS.md) | D01–D20 |
| — | [ARQUITECTURA-MAESTRA.md](./ARQUITECTURA-MAESTRA.md) | Índice ejecutivo |
| — | [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md) | Estado del código |
| — | [INFORME-AUDITORIA-DOCUMENTACION.md](./INFORME-AUDITORIA-DOCUMENTACION.md) | Validación docs v1.0.1 |

## Glosario (términos oficiales)

| Término | Significado |
|---------|-------------|
| **Empresa** | Unidad de aislamiento de datos y branding. Tabla raíz `empresa`. |
| **empresa_id** | Columna discriminadora en tablas de negocio. |
| **EmpresaContext** | Contexto frontend (branding) y backend (ThreadLocal empresa activa). |
| **domain/platform** | Dominio Super Admin (gestión de empresas). No confundir con otra unidad de aislamiento. |
| **Modular Monolith** | Un deploy; paquetes por dominio de negocio. |
| **ID 1.x / PR-1.x** | Misma numeración; ver `07-ROADMAP-TECNICO.md` §2. |

## Principios inmutables

1. **Modular Monolith** por dominios.
2. **Empresa** = única unidad de aislamiento.
3. Toda tabla de negocio con **`empresa_id`**.
4. Sistema **white-label** desde configuración de empresa.
5. Storage: **`storage/empresa-{id}/`**.

## Reglas Cursor y Skill

- `.cursor/rules/`
- `.cursor/skills/saas-platform-architecture/SKILL.md`
