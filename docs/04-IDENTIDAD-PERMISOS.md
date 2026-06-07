# 04 — Identidad y Permisos

**Versión:** 1.0.0 | **Estado:** OFICIAL

---

## 1. Roles oficiales (fijos)

| Código | Nombre | empresa_id | Descripción |
|--------|--------|------------|-------------|
| `SUPER_ADMIN` | Super Administrador | NULL | Control total de la plataforma |
| `EMPRESA_ADMIN` | Administrador de Empresa | FK obligatorio | Todo dentro de su empresa |
| `MANAGER` | Gerente | FK obligatorio | Operaciones sin gestión de usuarios |
| `CAJERO` | Cajero | FK obligatorio | Ventas y caja |
| `OPERADOR` | Operador | FK obligatorio | Lectura + entradas limitadas |

**No crear roles adicionales** sin actualizar este documento y [08-DECISIONES-CONGELADAS.md](./08-DECISIONES-CONGELADAS.md).

### Migración legacy

| Rol actual | Rol nuevo |
|------------|-----------|
| `ADMIN` | `EMPRESA_ADMIN` |
| `USER` | `CAJERO` |

---

## 2. SUPER_ADMIN

- `empresa_id = NULL` en BD.
- Acceso exclusivo a `/api/admin/**` y UI `/admin/*`.
- Capacidades: CRUD empresas, métricas plataforma, planes (Fase 6).
- **Restricción Fase 4:** no opera ventas, caja ni kardex de empresas clientes.
- JWT: `{ "superAdmin": true, "empresaId": null, "roles": ["SUPER_ADMIN"] }`.

---

## 3. EMPRESA_ADMIN

- Administración completa de **su** empresa.
- Gestión de usuarios y configuración (branding, datos fiscales).
- Todos los permisos operativos de su empresa.

---

## 4. MANAGER

- CRUD productos, categorías, entradas, ventas, kardex, caja, créditos.
- Reportes y dashboard.
- **Sin:** gestión usuarios, edición config empresa (opcional: permitir solo lectura config).

---

## 5. CAJERO

- Crear ventas, operar caja, registrar clientes, cobrar créditos.
- Ver productos y stock.
- **Sin:** kardex ajustes, eliminar productos, entradas de compra, usuarios.

---

## 6. OPERADOR

- Consulta amplia (productos, stock, kardex lectura).
- Registrar entradas de compra (limitado).
- **Sin:** ventas, caja, ajustes, usuarios.

---

## 7. Formato de permisos

```
{modulo}.{recurso}.{accion}
```

Ejemplos:
- `inventario.productos.crear`
- `ventas.salidas.cancelar`
- `finanzas.caja.abrir`
- `inventario.kardex.ajustar`
- `configuracion.empresa.editar`
- `identidad.usuarios.gestionar`
- `admin.empresas.gestionar` ← solo SUPER_ADMIN

---

## 8. Matriz rol → permisos

| Permiso | SUPER_ADMIN | EMPRESA_ADMIN | MANAGER | CAJERO | OPERADOR |
|---------|:-----------:|:-------------:|:-------:|:------:|:--------:|
| `admin.empresas.gestionar` | ✓ | | | | |
| `identidad.usuarios.gestionar` | ✓ | ✓ | | | |
| `configuracion.empresa.editar` | ✓ | ✓ | | | |
| `configuracion.empresa.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `inventario.productos.crear` | ✓ | ✓ | ✓ | | |
| `inventario.productos.eliminar` | ✓ | ✓ | ✓ | | |
| `inventario.productos.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `inventario.categorias.gestionar` | ✓ | ✓ | ✓ | | |
| `inventario.kardex.ver` | ✓ | ✓ | ✓ | | ✓ |
| `inventario.kardex.ajustar` | ✓ | ✓ | ✓ | | |
| `compras.entradas.crear` | ✓ | ✓ | ✓ | | ✓ |
| `compras.entradas.ver` | ✓ | ✓ | ✓ | | ✓ |
| `ventas.salidas.crear` | ✓ | ✓ | ✓ | ✓ | |
| `ventas.salidas.cancelar` | ✓ | ✓ | ✓ | | |
| `finanzas.caja.abrir` | ✓ | ✓ | ✓ | ✓ | |
| `finanzas.caja.cerrar` | ✓ | ✓ | ✓ | ✓ | |
| `finanzas.caja.egreso` | ✓ | ✓ | ✓ | ✓ | |
| `finanzas.creditos.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `finanzas.creditos.cobrar` | ✓ | ✓ | ✓ | ✓ | |
| `clientes.gestionar` | ✓ | ✓ | ✓ | ✓ | ver |
| `proveedores.gestionar` | ✓ | ✓ | ✓ | | ver |
| `reportes.dashboard.ver` | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 9. Modelo de datos identidad (Fase 2)

```sql
CREATE TABLE rol (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE permiso (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  modulo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE rol_permiso (rol_id BIGINT, permiso_id BIGINT, PRIMARY KEY (rol_id, permiso_id));

ALTER TABLE usuarios ADD COLUMN empresa_id BIGINT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_empresa
  FOREIGN KEY (empresa_id) REFERENCES empresa(id_empresa);

CREATE TABLE usuario_rol (usuario_id BIGINT, rol_id BIGINT, PRIMARY KEY (usuario_id, rol_id));
```

**Unicidad:** `UNIQUE(empresa_id, username)` — permite mismo username en empresas distintas.

---

## 10. Autenticación JWT

### LoginResponse (Fase 2+)
```json
{
  "token": "...",
  "username": "jperez",
  "empresaId": 42,
  "nombreEmpresa": "Bodega El Sol",
  "roles": ["MANAGER"],
  "permisos": ["ventas.salidas.crear", "..."],
  "superAdmin": false
}
```

### Backend — fuente de verdad
```java
@PreAuthorize("hasAuthority('ventas.salidas.crear')")
```

### Frontend — UX solamente
```jsx
<PermisoRoute permiso="inventario.kardex.ver">
  <KardexPage />
</PermisoRoute>
```

**Regla:** frontend oculta; backend **rechaza**. Nunca confiar solo en UI.

### Manejo errores frontend
- **401** → logout y redirect login.
- **403 permiso** → mensaje; **no** logout global.

---

## 11. Endpoints identidad (Fase 2)

| Método | Ruta | Rol mínimo |
|--------|------|------------|
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |
| GET/POST/PUT/DELETE | `/api/usuarios` | EMPRESA_ADMIN |
| PUT | `/api/usuarios/{id}/activar` | EMPRESA_ADMIN |
| GET | `/api/roles` | EMPRESA_ADMIN |

---

## 12. SecurityConfig evolución

**Actual:** reglas globales `POST=ADMIN`, `GET=USER|ADMIN`.

**Objetivo:** `@PreAuthorize` por endpoint + reglas mínimas en SecurityConfig.

Transición gradual en Fase 2 manteniendo compatibilidad.
