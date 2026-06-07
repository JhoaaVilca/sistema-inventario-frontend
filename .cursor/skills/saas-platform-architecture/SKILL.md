---

name: saas-platform-architecture

description: >-

  Applies official SaaS multiempresa architecture for inventario platform.

  Use when implementing features, refactoring, reviewing PRs, or planning

  migrations for inventario-backend or inventario-frontend. Covers Modular

  Monolith, empresa_id isolation, white-label branding, RBAC roles, Flyway,

  and storage per empresa. Read docs/ARQUITECTURA-MAESTRA.md first.

---



# Plataforma SaaS Multiempresa — Skill de Arquitectura



**Versión documental:** 1.0.1



## Antes de escribir código



1. Leer `docs/ARQUITECTURA-MAESTRA.md` (índice).

2. Consultar documento del dominio en `docs/01-` … `08-`.

3. Verificar fase y PR en `docs/07-ROADMAP-TECNICO.md` §2 (Fase 1 canónico).

4. No violar `docs/08-DECISIONES-CONGELADAS.md`.

5. Validar alineación doc: `docs/INFORME-AUDITORIA-DOCUMENTACION.md`.



## Decisiones no negociables



- **Modular Monolith** por dominios — NO monolito plano.

- **Empresa** = única unidad de aislamiento; discriminador **`empresa_id`**.

- Toda tabla de negocio: **empresa_id** (Fase 3+).

- **White-label:** cero hardcodes de negocio en código.

- Branding: **EmpresaContext** + tabla `empresa`.

- Storage: `storage/empresa-{id}/{logos|facturas|documentos}/`

- Roles: SUPER_ADMIN, EMPRESA_ADMIN, MANAGER, CAJERO, OPERADOR

- Controllers: solo HTTP + DTOs. Lógica en services.

- Backend autoriza con `@PreAuthorize`; frontend solo oculta UI.



## Estructura backend objetivo



```

tienda.inventario

├── domain/{platform,identity,settings,inventory,purchases,sales,customers,suppliers,finance,reports}

├── application/

├── api/

├── infrastructure/{persistence,storage,security,integration,config}

└── shared/{dto,exception,event,util}

```



## Estructura frontend objetivo



```

src/modules/{identity,settings,inventory,purchases,sales,customers,suppliers,reports,platform,billing}

src/shared/{api,contexts,hooks,ui,routes,styles}

```



## Checklist PR



- [ ] Sin lógica de negocio en controller

- [ ] DTOs en frontera API (no entidades JPA)

- [ ] Sin hardcodes YOLI/yamisa/branding

- [ ] Léxico: Empresa, empresa_id, EmpresaContext en código nuevo

- [ ] Flyway para cambios de schema

- [ ] Checklist regresión (`docs/07-ROADMAP-TECNICO.md` §8)

- [ ] Secuencia Fase 1 respetada (§2)



## Referencias rápidas



| Tema | Documento |

|------|-----------|

| Arquitectura | docs/01-ARQUITECTURA-SAAS.md |

| Convenciones | docs/02-CONVENCIONES-DESARROLLO.md |

| Multiempresa | docs/03-MULTIEMPRESA.md |

| RBAC | docs/04-IDENTIDAD-PERMISOS.md |

| BD | docs/05-BASE-DE-DATOS.md |

| Storage | docs/06-STORAGE.md |

| Roadmap | docs/07-ROADMAP-TECNICO.md |

| Gap código | docs/INFORME-CUMPLIMIENTO-ARQUITECTURA.md |

| Validación doc | docs/INFORME-AUDITORIA-DOCUMENTACION.md |

