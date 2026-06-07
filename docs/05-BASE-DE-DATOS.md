# 05 — Base de Datos

**Versión:** 1.0.1 | **Estado:** OFICIAL

---

## 1. Estrategia

| Atributo | Valor |
|----------|-------|
| Motor | MySQL 8 |
| Modelo | Shared database, shared schema |
| Aislamiento | **`empresa_id`** |
| Unidad lógica | **Empresa** |
| Migraciones | **Flyway** (Fase 1) |
| ddl-auto prod/dev (post-Fase 1) | `validate` |

---

## 2. Tabla `empresa`

Ver schema en v1.0.0; campos branding en migración V2 (Fase 1).

**Nota API:** mantener `nombreEmpresa` en DTOs si se renombra columna a `nombre_comercial` — documentar en PR 1.5.

---

## 3–7. Tablas identidad, negocio, sucursal, comercial, índices

Sin cambios de fondo respecto a v1.0.0. Todas las tablas de negocio reciben `empresa_id` en Fase 3.

---

## 8. Flyway

```
V1__baseline.sql
V2__empresa_branding.sql      # Fase 1
V3__identidad_rbac.sql        # Fase 2
V4a/b__empresa_id_*.sql       # Fase 3
V5__unicidad_compuesta.sql    # Fase 3
V6__sucursales.sql            # Fase 5
V7__planes_suscripcion.sql    # Fase 6
```

---

## 9. Reglas

- Ninguna tabla de negocio nueva sin `empresa_id`.
- Seeds de negocio solo en SQL Flyway, no en Java.
- Unicidad siempre compuesta con `empresa_id` donde aplique.
