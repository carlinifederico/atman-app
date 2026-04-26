export const metadata = {
  title: "Disclaimer de Criptoactivos — ATMAN",
};

export default function DisclaimerCriptoPage() {
  return (
    <>
      <h1>Disclaimer de Criptoactivos</h1>
      <p className="text-sm">Vigencia: borrador del 26 de abril de 2026.</p>

      <h2>1. ATMAN no es custodio</h2>
      <p>
        ATMAN <strong>no almacena claves privadas ni frases semilla</strong>. El usuario es el único
        titular de sus criptoactivos. Lo que ATMAN almacena son <em>instrucciones cifradas</em>{" "}
        sobre cómo acceder o transferir esos activos, que serán entregadas a los herederos
        designados cuando se cumpla la condición de activación configurada.
      </p>

      <h2>2. Sin asesoramiento financiero</h2>
      <p>
        El contenido de la plataforma, incluyendo las opciones sugeridas de wallets, blockchains y
        métodos de activación, no constituye asesoramiento financiero, fiscal, legal ni de
        inversión. El usuario debe consultar a profesionales antes de tomar decisiones materiales.
      </p>

      <h2>3. Riesgos inherentes a los criptoactivos</h2>
      <ul>
        <li>
          <strong>Volatilidad extrema:</strong> el valor de los criptoactivos puede caer
          drásticamente sin previo aviso.
        </li>
        <li>
          <strong>Pérdida irreversible:</strong> errores en direcciones, frases semilla
          comprometidas, o ataques pueden resultar en pérdida total y permanente.
        </li>
        <li>
          <strong>Riesgo regulatorio:</strong> los marcos legales sobre criptoactivos varían por
          país y pueden cambiar de forma adversa.
        </li>
        <li>
          <strong>Riesgo de smart contracts y protocolos:</strong> bugs, exploits o cambios en
          protocolos DeFi pueden afectar los activos.
        </li>
        <li>
          <strong>Riesgo de exchange:</strong> las plataformas centralizadas pueden quebrar o
          congelar fondos.
        </li>
      </ul>

      <h2>4. No respaldo gubernamental</h2>
      <p>
        Los criptoactivos no son moneda de curso legal en la mayoría de las jurisdicciones LATAM y
        no están respaldados por bancos centrales ni esquemas de seguro de depósitos. La pérdida no
        es recuperable por vía estatal.
      </p>

      <h2>5. Activación y herederos</h2>
      <p>
        Las condiciones de activación (inactividad, manual, multifirma) dependen de información
        provista por el usuario y por terceros (herederos). ATMAN ejecuta la lógica configurada,
        pero no garantiza que la transferencia efectiva de los criptoactivos ocurra: eso depende del
        cumplimiento de los herederos y del estado de la blockchain.
      </p>

      <h2>6. Cumplimiento sucesorio</h2>
      <p>
        El uso de ATMAN no exime al usuario ni a los herederos de cumplir con las leyes sucesorias,
        fiscales y de declaración patrimonial aplicables. ATMAN puede ser un complemento, nunca un
        sustituto, de los procesos sucesorios formales en cada jurisdicción.
      </p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        ATMAN no es responsable por: pérdidas derivadas de claves perdidas o comprometidas por el
        usuario, decisiones de inversión, fluctuaciones de mercado, fallos en blockchains de
        terceros, o incumplimiento de los herederos.
      </p>

      <h2>8. Recomendaciones</h2>
      <ul>
        <li>Mantenga copias de seguridad de sus frases semilla en lugares físicos seguros.</li>
        <li>Verifique la jurisdicción que aplica a usted y a sus herederos.</li>
        <li>
          Considere combinar ATMAN con instrumentos sucesorios formales (testamento, fideicomiso).
        </li>
      </ul>
    </>
  );
}
