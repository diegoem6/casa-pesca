export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="foot-inner">
        <div>
          <div className="foot-brand"><span className="mark">◆</span> EL LOCU VIEJO</div>
          <p className="foot-desc">Tienda de artículos de pesca en Colonia del Sacramento, Uruguay. Pasión de amigos.</p>
        </div>
        <div>
          <h4>Tienda</h4>
          <ul>
            <li><a href="/">Cañas</a></li>
            <li><a href="/">Reeles</a></li>
            <li><a href="/">Señuelos</a></li>
            <li><a href="/">Líneas y trenzas</a></li>
            <li><a href="/">Accesorios</a></li>
          </ul>
        </div>
        <div>
          <h4>Club</h4>
          <ul>
            <li><a href="#nosotros">Nosotros</a></li>
            <li><a href="#nosotros">Las lanchas</a></li>
            <li><a href="#nosotros">Concurso 2026</a></li>
            <li><a href="#nosotros">Galería</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">Av. del Río 1234, Colonia</a></li>
            <li><a href="#">hola@ellocuviejo.uy</a></li>
            <li><a href="#">Lun–Sáb · 9–19h</a></li>
          </ul>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} EL LOCU VIEJO · COLONIA · UY</span>
        <span>Amigos, pesca y truco</span>
      </div>
    </footer>
  );
}
