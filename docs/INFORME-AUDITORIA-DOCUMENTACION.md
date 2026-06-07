# Informe de Auditoría Documental

**Versión:** 1.0.1 (post-correcciones A1–A4)  
**Fecha:** 2026-06-03  
**Alcance:** Suite `docs/`, reglas `.cursor/rules/`, skill `saas-platform-architecture`  
**Repos:** inventario-backend (`inventario/docs/`) + inventario-frontend (`docs/` espejo)

---

## 1. Resumen ejecutivo

| Criterio | Estado v1.0.1 |
|----------|:-------------:|
| A1 — Numeración Fase 1 unificada (ID = PR) | **RESUELTO** |
| A2 — Referencias cruzadas y reglas → docs correctos | **RESUELTO** |
| A3 — Léxico multiempresa (solo Empresa / empresa_id / EmpresaContext) | **RESUELTO** en docs oficiales, reglas y skill |
| A4 — INFORME-CUMPLIMIENTO alineado + referencia a este informe | **RESUELTO** |
| Coherencia arquitectónica documental | **COMPLETA** |
| Código de aplicación | **Fuera de alcance** — ver [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md) |

**Veredicto:** La documentación oficial está **lista para aprobación** antes de iniciar **PR-1.1** (Flyway baseline). No se detectan contradicciones entre Maestro, suite 01–08, informes, reglas ni skill.

**Opinión:** Unificar numeración y léxico antes de código fue la decisión correcta; el riesgo principal restante no es documental sino **regresión operativa** al ejecutar 1.1 sobre una BD existente con `ddl-auto=update`.

---

## 2. Correcciones aplicadas (A1–A4)

### A1 — Secuencia canónica Fase 1

**Fuente única:** [07-ROADMAP-TECNICO.md](./07-ROADMAP-TECNICO.md) §2.

| ID / PR | Entregable |
|---------|------------|
| 1.1 | Flyway + V1 baseline |
| 1.2 | GlobalExceptionHandler |
| 1.3 | CORS unificado |
| 1.4 | Hardcodes + seed env |
| 1.5 | V2 branding empresa |
| 1.6 | EmpresaStorageResolver + logo API |
| 1.7 | EmpresaContext FE |
| 1.8 | LoteService |
| 1.9 | DTO Entrada |
| 1.10 | DTO Proveedor |
| 1.13 | Usuario en movimientos caja |
| 1.12 | KardexExport *(opc.)* |
| 1.11 | Producto stock inicial *(opc.)* |

**Orden merge:** `1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.10 → 1.13 → 1.12 → 1.11`

Referencias duplicadas con numeración distinta en INFORME-CUMPLIMIENTO §8 fueron **alineadas** (mismo ID, remisión al roadmap §2).

### A2 — Referencias rotas

| Elemento | Antes | Después |
|----------|-------|---------|
| FE `09-identidad-permisos.mdc` | `ARQUITECTURA-MAESTRA.md` §6–7 (inexistentes) | `docs/04-IDENTIDAD-PERMISOS.md` |
| BE `06-roadmap-refactorizacion.mdc` | PRs solo en informe §8 | `07-ROADMAP` §2 canónico + informe §8 detalle |
| BE `02-backend-controladores.mdc` | "tenant/empresa del JWT" | "empresa del JWT (`empresaId`)" |

### A3 — Léxico

Política v1.0.1 en documentación activa y reglas:

- **Usar:** Empresa, multiempresa, `empresa_id`, EmpresaContext, EmpresaStorageResolver, `empresa-{id}/`
- **No usar** en docs/reglas/skill: segunda unidad de aislamiento, `tenant_id`, contextos o resolvers con nombre obsoleto, frases "tenant/empresa"

Inventario de **deuda en código fuente** (nombres legacy en Java/properties): solo en [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md) §3 (C5, PR 1.6), sin replicar terminología prohibida en diseño.

### A4 — INFORME-CUMPLIMIENTO

- Versión 1.0.1
- §7 y §10 referencian este informe como validación
- Conclusión corregida: documentación alineada; código pendiente
- §8 sincronizado con IDs 1.x del roadmap

---

## 3. Matriz de consistencia (auditoría final)

| Documento | Empresa única | empresa_id | Modular Monolith | Fase 1 IDs | Sin léxico prohibido |
|-----------|:-------------:|:----------:|:----------------:|:----------:|:--------------------:|
| ARQUITECTURA-MAESTRA | ✓ | ✓ | ✓ | → 07 | ✓ |
| README + glosario | ✓ | ✓ | ✓ | ✓ | ✓ |
| 01-ARQUITECTURA-SAAS | ✓ | ✓ | ✓ | — | ✓ |
| 02-CONVENCIONES | ✓ | implícito | ✓ | — | ✓ |
| 03-MULTIEMPRESA | ✓ | ✓ | — | — | ✓ |
| 04-IDENTIDAD-PERMISOS | ✓ | ✓ | — | — | ✓ |
| 05-BASE-DE-DATOS | ✓ | ✓ | — | — | ✓ |
| 06-STORAGE | ✓ | ✓ | — | PR 1.6 | ✓ |
| 07-ROADMAP | ✓ | F3 | — | **canónico** | ✓ |
| 08-DECISIONES | ✓ D04–D05 | ✓ | ✓ D01 | — | ✓ |
| INFORME-CUMPLIMIENTO | ✓ | ✓ | gap código | ✓ | ✓* |
| Reglas BE (10) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reglas FE (8) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Skill (ambos repos) | ✓ | ✓ | ✓ | ✓ | ✓ |

\* Informe de cumplimiento menciona artefactos legacy del **código** en lenguaje neutro (resolver/propiedad obsoleta), no como diseño objetivo.

---

## 4. Reglas Cursor — estado

| Regla | Repo | Estado |
|-------|------|--------|
| 00-arquitectura-saas | BE+FE | v1.0.1, apunta a Maestro + suite |
| 01-backend-dominios | BE | EmpresaAwareEntity; prohibiciones sin léxico obsoleto |
| 02-backend-controladores | BE | Validación por empresa JWT |
| 03-frontend-modulos | FE | EmpresaContext; sin alias prohibidos |
| 04-base-datos | BE+FE | empresa_id + Flyway |
| 05-multiempresa | BE+FE | 03-MULTIEMPRESA.md |
| 06-roadmap | BE+FE | 07 §2 canónico |
| 07-convenciones | BE+FE | 02-CONVENCIONES |
| 08-decisiones | BE+FE | 08-DECISIONES |
| 09-identidad-permisos | BE+FE | 04-IDENTIDAD-PERMISOS |

---

## 5. Inconsistencias restantes

| # | Tipo | Detalle | Severidad | Acción |
|---|------|---------|-----------|--------|
| R1 | Código vs doc | Código aún usa nombres legacy en storage/JWT (informe cumplimiento) | Alta (implementación) | Fase 1 PRs 1.1–1.7 |
| R2 | Espejo FE | `docs/` debe mantenerse sincronizado con `inventario/docs/` en cada change control | Media (proceso) | Copiar en mismo PR doc o checklist release |
| R3 | ARQUITECTURA-MAESTRA histórico | Puede existir copia antigua (~930 líneas) fuera de `inventario/docs/` | Baja | Archivar o eliminar copias obsoletas manualmente |
| R4 | `domain/platform` | Nombre puede confundir con "plataforma = otra empresa" | Baja | Glosario README ✓ |

**No hay inconsistencias bloqueantes entre documentos oficiales v1.0.1.**

---

## 6. Nivel de alineación arquitectónica

| Dimensión | Nivel | Comentario |
|-----------|:-----:|------------|
| Modelo de aislamiento | **100%** | Empresa + empresa_id en toda la suite |
| Estilo arquitectónico | **100%** | Modular Monolith documentado y en reglas |
| Roadmap / PRs Fase 1 | **100%** | Una secuencia, una numeración |
| RBAC y storage | **100%** | Alineados con 04 y 06 |
| Reglas + skill | **100%** | Apuntan a docs correctos |
| Código ejecutable | **~15%** | ERP single-empresa; gap en informe cumplimiento |

**Alineación documental global: COMPLETA (v1.0.1).**  
**Alineación código vs objetivo: PENDIENTE** — inicia con PR-1.1 tras aprobación explícita.

---

## 7. Riesgos y recomendaciones (post-auditoría)

1. **PR-1.1 Flyway:** Probar baseline en copia de BD producción; riesgo de drift con schema generado por Hibernate.
2. **No mezclar PRs:** Respetar orden §2; 1.7 antes de branding API estable (1.5).
3. **Change control:** Cualquier cambio a D01–D20 exige bump de versión en Maestro + reglas + skill + ambos espejos `docs/`.
4. **Agente IA:** Con skill + reglas v1.0.1, reducir instrucciones ad-hoc en prompts; confiar en `07-ROADMAP` §2.

---

## 8. Aprobación sugerida

Checklist para el responsable de producto/arquitectura:

- [ ] Acepto secuencia Fase 1 en `07-ROADMAP-TECNICO.md` §2
- [ ] Acepto léxico Empresa / empresa_id / EmpresaContext
- [ ] Acepto que el código actual no cumple (informe cumplimiento)
- [ ] Autorizo inicio **PR-1.1 Flyway baseline**

---

## 9. Changelog de este informe

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-06-03 | Auditoría inicial; hallazgos A1–A4 |
| 1.0.1 | 2026-06-03 | Post-corrección; matriz final; veredicto listo para PR-1.1 |
