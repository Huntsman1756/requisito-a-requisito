# prestamos-personal-publico-cm

## Análisis

1. **`personal-laboral-cm` (hard)** — `employmentStatus eq "empleado-publico"`.
   - **Ámbito real más amplio que el label**: la fuente de la sede (trámite 88194) incluye, además del «personal laboral fijo»: «Personal laboral temporal, si la duración prevista del contrato es superior a 3 meses. Personal eventual, si la duración prevista del nombramiento es superior a 3 meses. Altos cargos» y, por el Acuerdo Sectorial: «Personal funcionario de carrera. Personal funcionario interino, si la duración prevista del nombramiento es superior a 3 meses. Personal funcionario en prácticas». El label dice «el Convenio regula este derecho para el personal laboral fijo; el funcionario dispone de acuerdos sectoriales propios» — correcto pero incompleto: omite laboral temporal, eventuales, altos cargos, interinos y funcionarios en prácticas. En la práctica no produce F (todos responderían «Empleo público» → T), pero el texto declara menos de lo que la norma admite.
   - **Posible falso negativo por autoadscripción**: un laboral fijo de la CM es «trabajador por cuenta ajena»; si elige «Trabajo por cuenta ajena» en vez de «Empleo público» → F hard → `no_cumple` pese a estar cubierto. Depende de cómo se interprete la opción «Empleo público» (un laboral puede no identificarse como tal). Riesgo real pero condicionado a la interpretación del usuario.
   - **Dirección contraria (no es FN pero conviene anotarlo)**: «Empleo público» también lo eligen empleados de otras administraciones (Estado, ayuntamientos, empresas públicas de la CM ajenas al Convenio) → T indebido; la norma solo cubre la Administración de la CM (Convenio laboral + Acuerdo Sectorial de admón y servicios).
   - Requisito adicional de la sede no declarado en `uncoveredRequirements`: «No tener pendiente de devolución un anticipo o préstamo anterior concedido por la Comunidad de Madrid».

2. **`uncoveredRequirements`** — El gasto imprevisto justificado con factura/presupuesto («será documento justificativo suficiente la presentación de factura y/o presupuesto suficientemente detallado», art. 139.2) y la dependencia de la dotación presupuestaria están honestamente declarados. Falta el requisito de no tener otro préstamo/anticipo pendiente.

3. **Cuantía/plazo** — «cuantía máxima de 5.000 euros … treinta y seis mensualidades» verificado en el Convenio (art. 139.2). La sede además limita para personal temporal/interino: «importe máximo del sueldo líquido de 1 mes … plazo máximo … la duración del contrato o nombramiento» — matiz no declarado.

## Riesgos

| requisito | riesgo | cita | propuesta |
|---|---|---|---|
| personal-laboral-cm | bajo | Posible F hard si un laboral fijo responde «Trabajo por cuenta ajena» en lugar de «Empleo público» (opción genérica); la norma cubre laboral fijo/temporal/eventual/altos cargos y funcionarios admón y servicios | Aceptar también `asalariado` con label «solo si trabajas para la Administración de la CM» o matizar el label («personal laboral o funcionario de la Administración de la Comunidad de Madrid») |
| personal-laboral-cm (label) | bajo | Sede: «Personal laboral temporal … eventuales … Altos cargos … funcionario interino … en prácticas» — el label solo menciona laboral fijo | Ampliar el label o añadir `uncoveredRequirement` con el catálogo completo de colectivos y la limitación para temporales (máx. 1 mes de sueldo, plazo = duración del contrato) |
| (falta en uncovered) | bajo | Sede: «No tener pendiente de devolución un anticipo o préstamo anterior concedido por la Comunidad de Madrid» | Añadir a `uncoveredRequirements` |
