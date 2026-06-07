# 02 — Convenciones de Desarrollo

**Versión:** 1.0.0 | **Estado:** OFICIAL

---

## 1. Idiomas y nomenclatura general

| Ámbito | Idioma | Ejemplo |
|--------|--------|---------|
| Dominio de negocio (clases) | Español | `Producto`, `Entrada`, `Salida` |
| Infraestructura técnica | Inglés | `Controller`, `Repository`, `Filter` |
| URLs API | Español plural | `/api/productos`, `/api/caja` |
| Columnas BD | snake_case español | `nombre_producto`, `fecha_salida` |
| Paquetes frontend | Inglés | `modules/inventory/` |
| UI visible al usuario | Español | "Agregar producto" |

---

## 2. Backend — Clases y sufijos

| Tipo | Sufijo | Ejemplo | Ubicación |
|------|--------|---------|-----------|
| REST Controller | `Controller` / `Controlador`* | `ProductoController` | `api.{dominio}` |
| Application Service | `Service` | `ProductoService` | `application.{dominio}` |
| Domain Service | `DomainService` | `InventarioStockDomainService` | `domain.{dominio}.service` |
| JPA Entity | sin sufijo** | `Producto` | `infrastructure.persistence.entity` |
| Repository | `Repository` | `ProductoRepository` | `infrastructure.persistence.repository` |
| Request DTO | `Request` | `ProductoRequest` | `shared.dto` |
| Response DTO | `Response` | `ProductoResponse` | `shared.dto` |
| Referencia DTO | `ReferenciaDTO` | `ProductoReferenciaDTO` | `shared.dto` |
| Mapper | `Mapper` | `ProductoMapper` | `infrastructure.persistence.mapper` |
| Excepción dominio | `Exception` | `StockInsuficienteException` | `shared.exception` |
| Evento dominio | `Event` | `VentaRegistradaEvent` | `shared.event` |
| Filter/Interceptor | `Filter` | `EmpresaContextFilter` | `infrastructure.security` |

\* Legacy `Controlador` aceptado durante migración; código nuevo usa `Controller`.  
\** Entidades en `modelo/` hasta migración.

---

## 3. DTOs

### Request
```java
@Data
public class ProductoRequest {
    @NotBlank @Size(max = 200)
    private String nombreProducto;
    @NotNull @Positive
    private BigDecimal precio;
}
```
- Solo campos + Bean Validation.
- Sin lógica de negocio.

### Response
- Nunca incluir entidades JPA.
- Nunca exponer `password` ni datos sensibles.

### Prohibido en API
- `Map<String, Object>` como response principal.
- Entidades JPA en body o response.

---

## 4. Servicios

```java
public interface ProductoService {
    ProductoResponse crear(ProductoRequest request);
}

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {
    private final ProductoRepository productoRepository;
    // @Transactional aquí, no en controller
}
```

- Inyección por **constructor** (preferir sobre `@Autowired` field).
- Interface para servicios públicos de dominio.
- `@Transactional` en capa application/service.

---

## 5. Repositorios

```java
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Page<Producto> findByEmpresaIdAndNombreProductoContaining(
        Long empresaId, String nombre, Pageable pageable);
}
```

- Fase 3+: métodos incluyen `empresaId`.
- Queries JPQL con `@Query` documentadas.

---

## 6. Controllers

```java
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService productoService;

    @PostMapping
    @PreAuthorize("hasAuthority('inventario.productos.crear')")
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(dto));
    }
}
```

**Prohibido en controllers:**
- `@Autowired` de repositorios.
- Lógica de negocio, generación PDF, acceso directo a BD.
- `@CrossOrigin` (CORS solo en `SecurityConfig`).

---

## 7. Excepciones y respuestas HTTP

| Excepción | HTTP | Uso |
|-----------|------|-----|
| `RecursoNoEncontradoException` | 404 | ID inexistente o no pertenece a empresa |
| `ReglaNegocioException` | 422 | Stock insuficiente, caja cerrada |
| `AccesoDenegadoException` | 403 | Sin permiso |
| `DatosInvalidosException` | 400 | Validación agregada |

```json
{
  "timestamp": "2026-06-03T10:00:00",
  "status": 422,
  "error": "Regla de negocio",
  "message": "Stock insuficiente",
  "path": "/api/salidas"
}
```

Handler: `GlobalExceptionHandler` con `@ControllerAdvice`.

---

## 8. Eventos de dominio (Fase 6+)

```java
public record VentaRegistradaEvent(Long empresaId, Long salidaId, LocalDateTime fecha) {}
```

- Publicar post-commit.
- Consumidores en mismo monolito inicialmente.

---

## 9. Frontend

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Página | `{Nombre}Page.jsx` | `ProductosPage.jsx` |
| Componente | PascalCase | `LotesModal.jsx` |
| Hook | `use{Nombre}.js` | `useProductos.js` |
| Service | `{dominio}Service.js` | `productoService.js` |
| Context | `{Nombre}Context.jsx` | `EmpresaContext.jsx` |

### Reglas
- Máximo **250 LOC** por componente página.
- HTTP solo vía `services/` del módulo.
- Sin `console.log` en código productivo.
- Branding solo desde `EmpresaContext`.

---

## 10. Git y PRs

- Una PR = un entregable de roadmap verificable.
- Mensajes commit: `feat(domain): descripción` / `fix(domain): descripción`.
- Checklist regresión obligatoria antes de merge (ver [07-ROADMAP-TECNICO.md](./07-ROADMAP-TECNICO.md)).

---

## 11. Tipos de datos

| Concepto | Tipo |
|----------|------|
| Dinero | `BigDecimal` escala 2 |
| Fechas negocio | `LocalDate` / `LocalDateTime` |
| Timezone | `America/Lima` |
| IDs API | `Long` |
| Colores | `#RRGGBB` (7 chars) |
