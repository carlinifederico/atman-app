export const metadata = {
  title: "Términos y Condiciones — ATMAN",
};

export default function TerminosPage() {
  return (
    <>
      <h1>Términos y Condiciones</h1>
      <p className="text-sm">Vigencia: borrador del 26 de abril de 2026.</p>

      <h2>1. Aceptación</h2>
      <p>
        Al acceder o utilizar la plataforma ATMAN (&ldquo;la plataforma&rdquo;), el usuario acepta
        estos términos. Si no está de acuerdo, debe abstenerse de usar el servicio.
      </p>

      <h2>2. Naturaleza del servicio</h2>
      <p>
        ATMAN es un servicio de software que permite organizar y dejar instrucciones cifradas
        relativas a activos digitales para herederos designados. La plataforma NO actúa como
        custodio de claves privadas ni de fondos. La transferencia efectiva de activos depende de
        que los herederos sigan las instrucciones recibidas.
      </p>

      <h2>3. Cuentas y autenticación</h2>
      <ul>
        <li>El usuario es responsable de mantener la confidencialidad de sus credenciales.</li>
        <li>
          ATMAN puede suspender cuentas que violen estos términos, leyes aplicables, o representen
          riesgo para terceros.
        </li>
      </ul>

      <h2>4. Limitación de responsabilidad</h2>
      <p>
        ATMAN no garantiza la recuperación de activos digitales en caso de pérdida de claves del
        usuario, fallos de blockchains de terceros, o incumplimiento por parte de herederos. La
        responsabilidad de la plataforma se limita al monto pagado por el servicio en los últimos 12
        meses.
      </p>

      <h2>5. Activos digitales y riesgos</h2>
      <p>
        El usuario reconoce los riesgos inherentes a los criptoactivos: volatilidad, ataques,
        pérdida irreversible de claves, cambios regulatorios. Ver{" "}
        <a href="/disclaimer-cripto">disclaimer cripto</a> para detalle.
      </p>

      <h2>6. Modificaciones</h2>
      <p>
        ATMAN puede modificar estos términos. Los cambios se notificarán por email y por la
        plataforma con al menos 30 días de anticipación cuando sean materiales.
      </p>

      <h2>7. Jurisdicción y ley aplicable</h2>
      <p>
        [PENDIENTE — definir según jurisdicción de constitución de la sociedad ATMAN. Probable
        Argentina o Uruguay con cláusula arbitral por país del usuario en LATAM.]
      </p>

      <h2>8. Contacto</h2>
      <p>
        Consultas sobre estos términos: <a href="mailto:legal@atman.io">legal@atman.io</a>.
      </p>
    </>
  );
}
