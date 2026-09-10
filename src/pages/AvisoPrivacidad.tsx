import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

export function AvisoPrivacidad() {
  // Si ya tienes sesión (llegaste aquí desde Configuración o desde el
  // candado de aceptación), "volver" debe regresarte a la app, no mandarte
  // a la pantalla de registro — de lo contrario se siente como si te
  // hubiera cerrado la sesión.
  const { session } = useAuth();

  return (
    <div className="legal-page">
      <div className="legal-page-inner">
        {session ? (
          <Link to="/" className="legal-back-link">
            <ArrowLeftIcon /> Volver a la app
          </Link>
        ) : (
          <Link to="/registro" className="legal-back-link">
            <ArrowLeftIcon /> Volver al registro
          </Link>
        )}

        <div className="card legal-card">
          <span className="form-eyebrow">Aviso de privacidad</span>
          <h1>Cómo usamos y protegemos tus datos</h1>
          <p className="muted">Última actualización: septiembre de 2026. Aplica a todas las cuentas de GreonTrack.</p>

          <section>
            <h2>0. Responsable</h2>
            <p>
              GreonTrack es un proyecto académico de monitoreo de consumo eléctrico y huella de carbono.
              Quien administra el proyecto es responsable del tratamiento de tus datos personales conforme
              a este aviso.
            </p>
          </section>

          <section>
            <h2>1. ¿Qué datos recabamos?</h2>
            <p>Separamos lo que recabamos en tres grupos:</p>
            <ul>
              <li>
                <strong>Datos de tu cuenta:</strong> nombre, correo electrónico y contraseña (guardada
                cifrada, nunca en texto plano).
              </li>
              <li>
                <strong>Datos de tus dispositivos y consumo:</strong> nombre, tipo, marca y año que tú
                captures, consumo estimado en watts, tus horas de uso registradas, y —si usas el
                GreonTrack Sniffer— la IP y MAC de los equipos detectados en tu propia red.
              </li>
              <li>
                <strong>Datos técnicos del registro:</strong> sistema operativo, navegador, resolución de
                pantalla y una IP pública aproximada del equipo desde el que te registraste, únicamente
                para poder identificar tus propios registros con más precisión.
              </li>
            </ul>
          </section>

          <section>
            <h2>2. ¿Para qué los usamos?</h2>
            <p>
              <strong>Finalidades necesarias</strong> (sin ellas, la app no funciona): crear y mantener tu
              cuenta, calcular tu consumo eléctrico, tu costo estimado y tu huella de carbono, y mostrarte
              tus estadísticas.
            </p>
            <p>
              <strong>Finalidades secundarias</strong> (mejoran tu experiencia, pero puedes seguir usando
              GreonTrack sin ellas): generarte recomendaciones personalizadas de ahorro, y que Greon
              —nuestro asistente con inteligencia artificial— responda tus preguntas usando tu información
              real (tus dispositivos, tu consumo, tu racha y tu huella).
            </p>
            <p>No vendemos ni compartimos tus datos personales con terceros con fines publicitarios.</p>
          </section>

          <section>
            <h2>3. Uso de inteligencia artificial</h2>
            <p>
              Cuando le escribes a Greon, el texto de tu pregunta junto con un resumen de tus datos de
              consumo se envía a <strong>OpenAI</strong> para generar la respuesta de texto; si activas la
              voz narrada (en el Espacio de Greon o en Accesibilidad → Leer esta página), ese texto se
              envía además a <strong>ElevenLabs</strong> para convertirlo en audio. Ninguno de los dos
              proveedores queda autorizado a usar tu información para entrenar sus modelos ni para ningún
              otro fin fuera de responderte a ti en ese momento.
            </p>
            <p>
              Además, como cualquier consulta a un modelo de IA, generar cada respuesta implica un
              procesamiento en servidores que consume electricidad y, con ello, genera una pequeña huella
              de carbono propia — te lo señalamos directamente dentro del Espacio de Greon, con la misma
              transparencia con la que te mostramos la huella de tus dispositivos.
            </p>
          </section>

          <section>
            <h2>4. ¿Con quién compartimos tus datos?</h2>
            <p>
              Solo con los proveedores que hacen posible que GreonTrack funcione, y solo lo necesario para
              ese fin: <strong>Supabase</strong> (base de datos, autenticación y funciones del servidor),{' '}
              <strong>OpenAI</strong> y <strong>ElevenLabs</strong> (respuestas de Greon, según la sección
              anterior). No transferimos tus datos a nadie más, y no los usamos con fines comerciales
              ajenos a GreonTrack.
            </p>
          </section>

          <section>
            <h2>5. Almacenamiento, seguridad y conservación</h2>
            <p>
              Tus datos se guardan cifrados en tránsito (HTTPS/TLS) y en reposo, con reglas de acceso a
              nivel de fila que hacen que solo tu cuenta pueda leer tu propia información — ni otros
              usuarios ni, en el flujo normal de la app, un administrador pueden ver tus datos sin pasar
              por esos controles — eso incluye la firma que dibujas al aceptar este aviso: se guarda solo
              como evidencia de tu propia aceptación, y nadie más que tú puede leerla. Conforme a la Ley
              Federal de Protección de Datos Personales en Posesión
              de los Particulares (LFPDPPP) y su Reglamento —que exigen medidas de seguridad reforzadas
              para datos personales de personas en México—, resguardamos tu información bajo esos
              estándares y evitamos su tratamiento fuera de las finalidades de este aviso. Conservamos tus
              datos mientras tu cuenta exista; si la cancelas, los eliminamos salvo que la ley nos obligue
              a conservar algún registro por más tiempo.
            </p>
          </section>

          <section>
            <h2>6. Tus derechos (ARCO)</h2>
            <p>
              En cualquier momento puedes <strong>A</strong>cceder a tus datos, <strong>R</strong>ectificar
              los que estén incorrectos, solicitar la <strong>C</strong>ancelación de tu cuenta y tus
              datos, u <strong>O</strong>ponerte a un tratamiento específico (por ejemplo, dejar de usar a
              Greon sin perder el resto de la app). Puedes ejercerlos directamente desde{' '}
              <strong>Configuración</strong> dentro de la app (editar tus datos, cambiar tu contraseña o
              cerrar tu cuenta) o escribiéndonos para pedir ayuda con cualquiera de estos derechos.
            </p>
          </section>

          <section>
            <h2>7. Cookies y almacenamiento local</h2>
            <p>
              GreonTrack no usa cookies de rastreo ni de publicidad. Sí guarda algunas preferencias en el{' '}
              <em>localStorage</em> de tu navegador (por ejemplo, tus ajustes de accesibilidad o si ya
              cerraste un aviso) — esa información vive solo en tu dispositivo, nunca se envía a nuestros
              servidores, y puedes borrarla limpiando los datos del sitio desde tu navegador.
            </p>
          </section>

          <section>
            <h2>8. Menores de edad</h2>
            <p>
              GreonTrack está pensado para uso general (personal, familiar o escolar) y no recaba
              a propósito datos de menores de edad sin el consentimiento de sus padres o tutores.
            </p>
          </section>

          <section>
            <h2>9. Cambios a este aviso</h2>
            <p>
              Si actualizamos este aviso de forma relevante, te lo notificaremos dentro de la app y te
              pediremos aceptarlo de nuevo antes de que siga aplicando a tu cuenta.
            </p>
          </section>

          <section>
            <h2>10. Contacto</h2>
            <p>
              Para dudas sobre este aviso o para ejercer tus derechos ARCO, escríbenos desde el correo con
              el que te registraste a través de la sección de Configuración de la app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
