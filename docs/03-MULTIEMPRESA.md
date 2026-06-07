# 03 — Multiempresa

**Versión:** 1.0.1 | **Estado:** OFICIAL

---

## 1. Principio fundamental

**Empresa es la única unidad de aislamiento de datos y branding.**

| Concepto | Estado |
|----------|--------|
| Unidad de aislamiento | **Empresa** |
| Discriminador en BD | **`empresa_id`** |
| Instancias | Una app, una BD |

Terminología oficial en documentación y código nuevo: **empresa**, **multiempresa**, **empresa_id**, **EmpresaContext**.

---

## 2. Reglas de aislamiento

1. Toda **tabla de negocio** tiene `empresa_id NOT NULL` (desde Fase 3).
2. Todo **SELECT/UPDATE/DELETE** filtra por `empresa_id` del contexto JWT.
3. Todo **INSERT** asigna `empresa_id` desde `EmpresaContext` (backend) o JWT.
4. **SUPER_ADMIN** opera en `/api/admin/**` sin datos operativos de empresas clientes (Fase 4).
5. Recurso de otra empresa → **404** (no 403).

---

## 3. EmpresaContext (backend)

```java
public final class EmpresaContext {
    private static final ThreadLocal<Long> EMPRESA_ID = new ThreadLocal<>();
    public static void setEmpresaId(Long id) { EMPRESA_ID.set(id); }
    public static Long getEmpresaId() { return EMPRESA_ID.get(); }
    public static void clear() { EMPRESA_ID.remove(); }
}
```

Poblado por `EmpresaContextFilter` post-JWT con claim `empresaId`.

---

## 4. Clase base JPA (Fase 3)

```java
@MappedSuperclass
public abstract class EmpresaAwareEntity {
    @Column(name = "empresa_id", nullable = false)
    private Long empresaId;

    @PrePersist
    void asignarEmpresa() {
        if (empresaId == null) {
            empresaId = EmpresaContext.getEmpresaId();
        }
    }
}
```

Evaluar Hibernate `@Filter(name = "empresaFilter")` en Fase 3.

---

## 5. Empresa — singleton → multi-registro

| Fase | Comportamiento |
|------|----------------|
| Actual | `findFirstByOrderByIdEmpresa()` — una fila |
| Fase 1 | Branding ampliado; puede seguir una empresa |
| Fase 3+ | `/api/empresa` = empresa del JWT |
| Fase 4 | CRUD empresas en `/api/admin/empresas` |

Backfill legacy: `empresa_id = 1` para datos existentes.

---

## 6. Unicidad compuesta (Fase 3)

| Tabla | Constraint |
|-------|------------|
| `clientes` | `UNIQUE(empresa_id, dni)` |
| `usuarios` | `UNIQUE(empresa_id, username)` |
| `proveedores` | `UNIQUE(empresa_id, numero_documento)` |
| `empresa` | `UNIQUE(slug)` |

---

## 7. White-label y branding

| Campo | Uso |
|-------|-----|
| `nombre_comercial` / `nombreEmpresa` (API) | UI, tickets |
| `razon_social` | Documentos fiscales |
| `ruc`, `direccion`, `telefono`, `email` | Config + impresión |
| `logo_path` | Layout, login |
| `color_primario`, `color_secundario` | CSS variables |

### Frontend — EmpresaContext

Post-login: cargar config → `EmpresaContext` → Layout, Login, `document.title`.

---

## 8. JWT (Fase 2+)

```json
{
  "sub": "jperez",
  "empresaId": 42,
  "roles": ["MANAGER"],
  "permisos": ["ventas.salidas.crear"],
  "superAdmin": false
}
```

---

## 9. Deuda legacy en código (no en diseño objetivo)

El inventario de clases y propiedades obsoletas a eliminar en Fase 1 está en [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md) (PR **1.6**).

Objetivo documentado:

- `EmpresaStorageResolver` desde JWT
- Rutas `storage/empresa-{id}/`
- Sin segmentos compartidos entre empresas

---

## 10. Tests obligatorios (Fase 3)

- Empresa A no accede datos de Empresa B.
- `crearProducto` asigna `empresa_id` del contexto.
