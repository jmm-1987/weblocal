# Optimización SEO local — 6 de octubre de 2026

## Auditoría previa

Sitio estático HTML/CSS/JavaScript, sin package.json, compilación ni suite de pruebas. Se revisaron los 13 HTML, CSS compartidos, scripts, recursos, navegación, contacto, sitemap, robots y las dos configuraciones de rutas. Dominio canónico existente: https://www.jm2-tech.es; rutas sin extensión y sin barra final, salvo directorios del producto y privacidad.

- La home priorizaba el acompañamiento tecnológico, sin identificar el desarrollo de software ni la ubicación en su title/H1.
- Las páginas comerciales tenían title, description, canonical y tarjetas sociales. No había un esquema de negocio. El producto tenía SoftwareApplication, que se ha conservado.
- Base digital y Sobre mí apuntaban a plan-base2.html y sobremi.html, archivos ausentes. Apache tampoco resolvía automatizacion-tareas y enviaba varias rutas antiguas a la home, mientras _redirects las enviaba al servicio.
- El Autónomo Eficiente conserva dos archivos con la misma intención y canonical; se conserva la copia antigua y su redirección. Su botón #demo no tenía destino.
- La presentación comercial tenía dos H1 y carecía de canonical y tarjetas sociales.
- Todos los img tenían alt. Las copias decorativas de logos mantienen alt vacío. Se añadieron dimensiones nativas cuando faltaban ambas dimensiones; se respetaron medidas ya declaradas. Lazy loading se limita a imágenes del footer, logos de confianza y retrato inferior; no se aplica al hero.
- Dirección contradictoria: texto y enlace Maps indican Calle Pamplona 34, iframe y etiqueta del mapa indican 38. Código postal 06800 confirmado por el usuario. Dirección confirmada: Calle Pamplona 38, 06800 Mérida. Texto y mapa unificados.

## Archivos y cambios

Nuevos: desarrollo-software-merida.html, local-software.css y este informe.

Modificados: index.html, base-digital.html, sobre-mi.html, contacto.html, automatizacion-tareas.html, digitalizar-documentos.html, presupuestos-facturacion-rapida.html, presentacion-empresas.html, elautonomoeficiente/index.html, elautonomoeficiente/elautonomoeficiente.html, elautonomoeficiente/privacidad/index.html (dimensiones del logo), .htaccess, _redirects y sitemap.xml.

El PDF presentacion-empresas.pdf ya tenía cambios antes de comenzar; no se modificó en esta tarea.

### Home

- Title anterior: JM2 Tech Studio | Partner tecnológico para autónomos y pymes
- Title nuevo: Desarrollo de software y aplicaciones a medida en Mérida | JM2 Tech Studio
- H1 anterior: Acompañamiento tecnológico cercano para autónomos y pymes
- H1 nuevo: Software y aplicaciones a medida para empresas. La localidad se conserva en metadata, datos estructurados y landing.
- Meta description (156 caracteres): Desarrollo de software y aplicaciones a medida en Mérida para empresas, autónomos y pymes. Automatiza procesos y simplifica la gestión diaria de tu negocio.
- Introducción breve que explica herramientas adaptadas al trabajo real, público y beneficios. Se mantiene el acompañamiento como propuesta comercial.
- OG y Twitter reflejan title/description nuevos y conservan la imagen existente.

### Landing y arquitectura

/desarrollo-software-merida reutiliza header, footer, menú, CSS y sistema de contacto existentes. Incluye aplicaciones, administración, automatización, OCR, integraciones, dashboards, agendas y reservas como posibilidades de desarrollo, sin presentarlas todas como proyectos realizados.

Ejemplos documentados: presupuestos/facturación, digitalización documental y El Autónomo Eficiente. No se inventan clientes ni resultados. Enlaces hacia estos servicios/producto, automatización, base digital, sobre mí y contacto. Enlaces de retorno desde pies de páginas comerciales, producto y párrafos contextuales de los tres servicios. La home enlaza también desde su CTA secundario.

### Datos estructurados

LocalBusiness y WebSite con identificadores estables compartidos, evitando crear una Organization contradictoria. La landing añade Service enlazado al proveedor. SoftwareApplication conserva sus datos e incorpora creator vinculado al estudio.

Nombre, dominio, logo, teléfono +34625433667 y email jomma.tech@gmail.com proceden del proyecto. Ubicación: Mérida, Badajoz, España; área de servicio: Mérida, Badajoz y Extremadura. Código postal confirmado: 06800. No se añaden sameAs, coordenadas, horarios, reseñas o datos sin documentación. No se utiliza ProfessionalService porque Schema.org lo marca como obsoleto: https://schema.org/ProfessionalService.

### Rutas, sitemap y robots

Se reparan destinos de base digital/sobre mí, se incorpora automatización a Apache y se añade la landing y presentación en ambas configuraciones. Se normalizan aliases .html, barras finales y index.html del producto/privacidad con 301. No se eliminan contenidos ni se crean redirecciones masivas nuevas. Las rutas históricas de automatización conservan la intención del destino ya utilizado en _redirects.

Sitemap: 11 URLs canónicas, incluyendo landing, presentación y privacidad pública. Las páginas modificadas usan lastmod 2026-10-06; privacidad no declara fecha sin necesidad. talleres.html conserva noindex y 410.html conserva noindex; ninguna se incluye. No se incluyen login, aplicaciones externas o parámetros.

robots.txt revisado y conservado: Allow: / y referencia correcta al sitemap. CSS, JavaScript e imágenes no están bloqueados. No se bloquean páginas noindex, para que los robots puedan leer esa directiva.

## Validación

- 541 comprobaciones estáticas sin incidencias: enlaces internos y fragmentos, recursos, URLs del sitemap, JSON-LD parseable, JavaScript inline/externo sintácticamente válido y un H1/canonical en páginas públicas.
- sitemap.xml parseado como XML: 11 entradas.
- Navegación en Chromium: 10 páginas a anchos 375, 768 y 1440 px. Respuestas locales 200, un H1, sin errores JavaScript, sin imágenes inmediatas rotas y sin desbordamiento horizontal. Capturas de la landing revisadas. Menú móvil y apertura del modal/contacto comprobados; cuatro campos obligatorios conservados.
- Servidor local de comprobación reproduce las reglas _redirects. No equivale a ejecutar Apache ni al hosting de producción. Las peticiones externas se bloquearon durante las pruebas, por lo que no se valida el envío real de EmailJS, analítica, fuentes o Maps.
- git diff --check sin errores. No existe build/test propio del proyecto.

## Pendientes y acciones externas

- Dirección confirmada por el usuario y publicada en Schema: Calle Pamplona 38, 06800 Mérida.
- El archivo CNAME apunta al dominio, pero el repositorio contiene reglas de Apache y _redirects. Confirmar qué hosting sirve producción: GitHub Pages no interpreta ninguna de esas dos configuraciones. Si se usa Pages, las rutas limpias requerirán una adaptación específica antes de desplegar.
- Comprobar en producción 301, cabeceras, canonical con parámetros, HTTP/HTTPS y www, usando el hosting real. No se ha desplegado.
- Verificar la propiedad en Search Console, enviar el sitemap y solicitar indexación de home y landing. Revisar consultas e impresiones para medir resultados; no hay acceso a esos datos y no se puede afirmar posicionamiento previo.
- Revisar Perfil de Empresa en Google y coherencia de nombre/dirección/teléfono una vez confirmada la dirección.
- Validar el marcado en Schema Markup Validator y Rich Results Test tras publicar. La validación local fue sintáctica y de referencias; no acredita elegibilidad de resultados enriquecidos.
- Hay PNG de hasta 2,5 MB y vídeos de hasta 31 MB. Valorar formatos modernos y compresión con revisión visual antes de sustituirlos. No se modifican imágenes comerciales ni vídeos en esta tarea. No se atribuyen mejoras numéricas de LCP/CLS sin mediciones en producción; medir Core Web Vitals con datos reales.
- Se conserva la carga existente de analítica, fuentes y EmailJS para evitar cambios funcionales. El @import de fuentes en site-theme.css y las grandes hojas de estilos son candidatos a una optimización separada.
