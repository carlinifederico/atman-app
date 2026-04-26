export const metadata = {
  title: "Política de Privacidad — ATMAN",
};

export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p className="text-sm">Vigencia: borrador del 26 de abril de 2026.</p>

      <h2>1. Datos que recolectamos</h2>
      <ul>
        <li>
          <strong>Identificación:</strong> nombre, email, datos de contacto provistos por el
          usuario.
        </li>
        <li>
          <strong>Datos de billeteras:</strong> direcciones públicas y notas cifradas. Las claves
          privadas o frases semilla NUNCA son almacenadas en ATMAN.
        </li>
        <li>
          <strong>Herederos designados:</strong> nombre, email, relación. ATMAN puede contactar a
          herederos cuando se cumple la condición de activación.
        </li>
        <li>
          <strong>Datos de uso:</strong> logs de actividad, fechas de check-in, dirección IP,
          dispositivo.
        </li>
      </ul>

      <h2>2. Para qué los usamos</h2>
      <ul>
        <li>Operar la plataforma y autenticar al usuario.</li>
        <li>Notificar a herederos según la configuración de activación.</li>
        <li>Mejorar el servicio (analytics agregados y anónimos).</li>
        <li>Cumplir obligaciones legales y prevenir fraude.</li>
      </ul>

      <h2>3. Compartición con terceros</h2>
      <p>
        ATMAN no vende datos personales. Compartimos datos únicamente con proveedores
        subcontratistas que ejecutan funciones críticas del servicio (hosting, email transaccional,
        autenticación), siempre con acuerdo de confidencialidad. Lista de subprocesadores
        principales:
      </p>
      <ul>
        <li>Supabase Inc. — base de datos y autenticación.</li>
        <li>Vercel Inc. — hosting y CDN.</li>
        <li>[Pendiente] proveedor de email transaccional (Resend / Postmark).</li>
        <li>[Pendiente] proveedor de SMS (Twilio).</li>
      </ul>

      <h2>4. Derechos del titular</h2>
      <p>
        El usuario tiene derecho a acceder, rectificar, suprimir, portar y oponerse al tratamiento
        de sus datos. Para ejercerlos: <a href="mailto:privacy@atman.io">privacy@atman.io</a>.
      </p>

      <h2>5. Retención</h2>
      <p>
        Mantenemos los datos por el plazo necesario para el cumplimiento del servicio y las
        obligaciones legales. Al cerrar la cuenta, los datos se eliminan dentro de 30 días, salvo
        información que la ley exija conservar.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Cifrado en tránsito (TLS) y en reposo (donde corresponda). Las notas sobre billeteras se
        almacenan cifradas; ATMAN no tiene acceso a claves privadas. Las dependencias se monitorean
        por vulnerabilidades.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Usamos cookies estrictamente necesarias para la autenticación. No empleamos cookies de
        publicidad de terceros.
      </p>

      <h2>8. Jurisdicción</h2>
      <p>
        [PENDIENTE — definir según jurisdicción de constitución y normativa aplicable: Ley 25.326
        Argentina, LGPD Brasil, GDPR si hay usuarios en EEA.]
      </p>

      <h2>9. Contacto</h2>
      <p>
        Consultas: <a href="mailto:privacy@atman.io">privacy@atman.io</a>.
      </p>
    </>
  );
}
