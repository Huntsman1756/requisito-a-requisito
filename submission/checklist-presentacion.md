# Checklist de presentación — Global Tech Leaders Awards 2026

Persona: **Daniel** (candidatura en nombre propio, art. 11.5).
Categoría: **Global Tech Impact** (ADR-028). La Subdirección confirmó que una persona
física puede concurrir a Impact si lidera o impulsa la iniciativa
(`evidence/2026-10-05-consulta/respuesta-subdireccion.md`). Guarda el correo
original en PDF o .eml.
Plazo: **16/10/2026** · Recomendado: presentar el **15/10**.

## 1. Qué presenta (art. 12.1)

- [ ] **Formulario** normalizado de la sede (impreso 4050F1) — relleno y
      firmado en la sede electrónica.
- [ ] **Memoria descriptiva**: `submission/memoria.pdf`
      (fuente: `submission/memoria.md`; **regenerar** si cambia alguna cifra
      con `npm run memoria:pdf`. Es un borrador hasta incorporar el piloto
      y las cifras de la release realmente aprobada).
- [ ] **Acreditación de personalidad**: DNI/NIE (la sede lo pide en el
      propio formulario).
- [ ] Consentimiento: N/A — candidatura en nombre propio.
- [ ] **Anexos** (adjuntar al registro; se regeneran el 14/10 con `npm run anexos`,
      que borra antes cualquier fichero de esas dos carpetas que no vaya a
      regenerar y **falla si el recuento no cuadra**: 32 capturas + 2 vídeos):
  - `submission/anexos/video/recorrido-desktop.webm`
  - `submission/anexos/video/recorrido-movil.webm`
  - **comprobar que no queda ningún otro `.webm`** en `video/`: los
    `desktop-oscuro-recorrido.webm` y `movil-claro-recorrido.webm` del 06/10 se
    borran (además de la carpeta, ya no están en el repo desde el 08/10)
  - **comprobar que en `capturas/` no quedan capturas con la numeración antigua**
    (`*-03-resultados`, `*-04-ficha`, `*-05-explorar`, `*-06-observatorio`): son
    del generador de F6 y no se regeneran
  - una selección de `submission/anexos/capturas/` (6–8, claro y oscuro,
    **regeneradas con la release estricta del 14/10**, F10-MEM-3)
  - URL de la demo en la memoria: https://huntsman1756.github.io/requisito-a-requisito/
  - URL del repo: https://github.com/Huntsman1756/requisito-a-requisito/

## 2. Cómo presentar

- **Electrónico** (recomendado): Registro Electrónico General vía la sede
  de la convocatoria (P105). Requiere certificado electrónico
  (Cl@ve/certificado FNMT/identificador certificado del navegador).
- **Presencial** (alternativa para personas físicas, art. 12.3.a):
  Registro General de la Comunidad (C/ Gran Vía 52 o cualquier registro
  oficial de asistencia en materia de registros), con la documentación en
  papel o soporte.

## 3. Antes de pulsar «enviar»

- [ ] Memoria revisada y aprobada por ti (F7: tuya la firma del contenido).
- [ ] Todas las cifras de la memoria cuadran con `evidence/2026-10-08-F10/veracidad.json` y `submission/cifras.json` (0 sin evidencia).
- [ ] Nombre correcto en el formulario = titular del DNI.
- [ ] La categoría marcada es **Global Tech Impact**.
- [ ] La demo sirve la release estricta (solo reglas `approved`, ADR-050).
- [ ] Si adjuntas testimonios del piloto: cada uno tiene su consentimiento firmado (`evidence/2026-10-06-F8/kit/consentimiento.md`).
- [ ] Descarga el **justificante del registro** (es la prueba de fecha).

## 4. Después

- Guarda el justificante en `submission/` (escaneado o PDF del registro).
- Resolución: máximo 15 días tras el cierre; silencio = desestimación.
- Entrega de premios: durante Madrid Tech Week (28 oct–5 nov), según sede.
