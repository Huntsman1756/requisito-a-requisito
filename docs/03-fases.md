# Fases — índice y calendario (05/10 → 16/10/2026)

Cada fase tiene un fichero propio en `phases/` con objetivo, tareas, pruebas que
escribir, comandos de verificación, **puerta de salida** y evidencia. Un agente
abre **solo** el fichero de la fase activa.

| Fase | Fichero | Fechas | Depende de | Revisión humana |
|---|---|---|---|---|
| F0 Preparación y decisiones | `phases/F0-preparacion.md` | 05–06/10 | — | D-1 vehículo, consulta |
| F1 Fuentes, esquemas y gates | `phases/F1-fuentes-esquemas-gates.md` | 06–07/10 | F0-4 | — |
| F2 Motor de evaluación | `phases/F2-motor-evaluacion.md` | 06–08/10 | F1-1 | — |
| F3 Reglas del vertical + golden | `phases/F3-reglas-vertical.md` | 07–10/10 | F0-5, F1 | **Daniel: lotes de reglas y golden** |
| F4 Diseño y frontend | `phases/F4-diseno-frontend.md` | 07–11/10 | F2 (datos reales) | **Daniel: wireframes** |
| F5 QA transversal | `phases/F5-qa-transversal.md` | 10–12/10 | F4 | **Daniel: checklist manual** |
| F6 Infraestructura y demo | `phases/F6-infra-demo.md` | 11–13/10 | F5 | **Daniel: D-3 y autorización de despliegue** |
| F8 Piloto real (evidencia de impacto) | `phases/F8-piloto-impacto.md` | 10–14/10 | F3 lote 1, F4 mínimo, demo | **Daniel: contactos y sesiones** |
| F9 Frescura continua (job diario) | `phases/F9-frescura-continua.md` | 10–11/10 y en marcha hasta el 05/11 | F6-0 | — |
| **F10 Cierre de la candidatura (activa)** | `phases/F10-cierre-candidatura.md` | 08–14/10 | F3–F8 | **Daniel: muestreo de olas, sesiones del piloto, D-10..12 y firma** |
| F7 Impacto, memoria y entrega | `phases/F7-impacto-memoria-entrega.md` | 06–14/10 | F0-3; cifras de F3–F6 | **Daniel: memoria, D-2, firma y presentación** |

```
            L05 M06 X07 J08 V09 S10 D11 L12 M13 X14 J15 V16
F0          ███ ██
F1              ███ ███
F2              ███ ███ ███
F3                  ███ ███ ███ ███
F4                  ░░░ ███ ███ ███ ███        (░ wireframes con fixtures)
F5                                  ███ ███ ███
F6                                      ███ ███ ███
F7              ░░░ ░░░ ░░░ ░░░ ░░░ ███ ███ ███ ███ (░ recogida de evidencia)
Presentación                                         ███  ⚑ límite
```

## Prioridades (MoSCoW) para el 16/10

| Must | Should | Could | Won't (ahora) |
|---|---|---|---|
| Motor con Kleene sobre intervalos e invariantes I1–I10 · gates de citas · ≥ 20 programas en el nivel 1 (objetivo 30–40) y todo el universo apto en el nivel 2 · ≥ 12 personas golden · cuestionario + resultados + «qué te falta» · ejemplos en portada · eventos vitales · matriz requisito a requisito · plan de acción · Observatorio · estado de acceso (incl. recurrentes) · privacidad · axe AA en verde · Chromium, Firefox y WebKit + 2 móviles emulados · catálogo importado con procedencia (nivel 2) · repo público · **demo desplegada** · **piloto con 3–10 sesiones reales** · vídeo · memoria verificada | Elegibilidad futura · interfaz en inglés · regresión visual · estimación de esfuerzo · datos abiertos publicados · 15–25 ayudas | Telemetría desplegada · traducción del contenido de reglas · impresión pulida | LLM explicativo · otros verticales · API dinámica · cuentas o alertas |

Recortes, en el orden de `docs/12-forma-de-trabajo.md` §5.
