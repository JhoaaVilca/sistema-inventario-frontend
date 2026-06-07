# 06 — Storage Local Multiempresa

**Versión:** 1.0.1 | **Estado:** OFICIAL

---

## 1. Principios

1. Un directorio por empresa: `storage/empresa-{id}/`.
2. Nunca mezclar archivos entre empresas.
3. Resolver segmento desde JWT (`empresaId`) vía `EmpresaStorageResolver`.
4. Servir archivos vía API autenticada.
5. White-label: logos en storage, no en `public/` del frontend.

---

## 2. Estructura

```
{APP_STORAGE_ROOT_PATH}/
├── empresa-1/
│   ├── logos/
│   ├── facturas/
│   └── documentos/
├── empresa-2/
│   └── ...
```

---

## 3. Categorías (StorageCategory)

| Enum | Carpeta |
|------|---------|
| `LOGOS` | logos/ |
| `FACTURAS` | facturas/ |
| `DOCUMENTOS` | documentos/ |

---

## 4. EmpresaStorageResolver

```java
@Component
public class EmpresaStorageResolver {
    public String resolveStorageKey() {
        Long empresaId = EmpresaContext.getEmpresaId();
        if (empresaId == null) {
            throw new IllegalStateException("empresaId requerido para storage");
        }
        return "empresa-" + empresaId;
    }
}
```

**Fase 1 (pre-JWT empresaId):** fallback `empresa-1` solo con `app.multiempresa.enabled=false`.

---

## 5. FileStorageService

Parámetro oficial: `empresaKey` (formato `empresa-{id}`), no alias genéricos de segmento.

---

## 6. Endpoints

| Método | Ruta |
|--------|------|
| PUT | `/api/empresa/logo` |
| GET | `/api/empresa/logo` |
| POST/GET | `/api/entradas/{id}/factura` |

Requieren JWT con `empresaId` válido (Fase 2+).

---

## 7. Migración Fase 1 (PR 1.6)

| Acción | Detalle |
|--------|---------|
| Introducir | `EmpresaStorageResolver` |
| Migrar archivos | `default/` y `uploads/facturas/` → `empresa-1/` |
| Eliminar | `FileStorageConfig` (rutas estáticas legacy) |
| Eliminar propiedad | Segmento storage legacy en properties (PR 1.6) |

Detalle de código legacy: [INFORME-CUMPLIMIENTO-ARQUITECTURA.md](./INFORME-CUMPLIMIENTO-ARQUITECTURA.md).

---

## 8. Seguridad

- Sanitizar segmentos de ruta.
- Validar path bajo `{root}/empresa-{id}/`.
- Whitelist de extensiones.

---

## 9. Eliminación empresa (Fase 4)

Soft delete por defecto; hard delete con limpieza de `storage/empresa-{id}/`.
