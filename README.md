# GreonTrack — Frontend

GreonTrack es un sistema para entender y reducir el consumo energético del hogar. Este repositorio contiene la aplicación web que usan las personas usuarias.

## Qué hace

Cada persona se registra, inicia sesión y da de alta sus dispositivos electrónicos indicando su potencia y cuánto tiempo los usa. Con esos datos GreonTrack estima el consumo en kWh, el costo eléctrico y la huella de carbono en CO₂. Todo se presenta en un dashboard con gráficas por periodo y por dispositivo, de modo que es fácil ver qué aparato pesa más en el recibo.

A partir de ese consumo la app genera recomendaciones de ahorro personalizadas y permite exportar la información como reporte en PDF o como archivo CSV. La sección «Mi casa» reúne el panorama del hogar y los dispositivos registrados en un solo lugar. La app incluye un aviso de privacidad que explica qué datos se guardan y para qué, y la persona puede eliminar su cuenta y sus datos desde la configuración, lo cual se resuelve con la edge function `delete-account`. La edge function `greon-voice` aporta la voz de la mascota Greon dentro de la experiencia.

## Arquitectura

El frontend es una aplicación de una sola página hecha con React 18, TypeScript y Vite, con React Router para la navegación y Recharts para las gráficas. Habla directamente con Supabase (autenticación y Postgres) desde el navegador; la seguridad de los datos no depende de esconder la clave del cliente sino de las políticas de Row Level Security, que garantizan que cada persona solo lea y escriba sus propias filas. Las operaciones que necesitan privilegios, como borrar una cuenta, pasan por edge functions de Supabase.

Alrededor del frontend hay otros componentes que viven en repositorios separados. El Agente corre en segundo plano en la laptop de la persona y reporta cuánto tiempo estuvo encendido el equipo; ese reporte viaja al Backend, que lo valida y lo escribe en Supabase, de modo que las horas de uso se capturan sin intervención manual. El Sniffer escanea la red local, identifica los dispositivos conectados por el fabricante de su MAC y sube sugerencias a la cuenta, que se revisan y se agregan con un clic desde la web. Finalmente, la app móvil es de administración: solo entran cuentas con rol de administrador y muestra métricas agregadas leyendo la misma base de datos.

## Cómo correrlo

Se necesita Node.js 20 o superior y un proyecto de Supabase. Se instalan las dependencias con `npm ci`, se copia `.env.example` a `.env` y se completan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL del proyecto y su clave publishable. Después `npm run dev` levanta el servidor de desarrollo.

Para producción, `npm run build` hace la verificación de tipos con `tsc -b` y genera la carpeta `dist`; `npm run preview` la sirve localmente. `npm run lint` revisa el código con ESLint. El despliegue a GitHub Pages lo hace el workflow `deploy-pages.yml` en cada push a `main`, y el workflow `ci.yml` valida tipos y revisa dependencias en cada pull request.

El registro de usuarios requiere confirmación por correo, configurada en Supabase Auth; si se necesita desactivarla para una demo, se ajusta desde el dashboard de Supabase y no desde este código.
