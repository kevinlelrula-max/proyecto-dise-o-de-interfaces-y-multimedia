import { useEffect, useState } from "react";

export default function Caja({ token }) {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const fetchCaja = async () => {
      try {
        const res = await fetch("${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/ventas/empresa", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        const lista = Array.isArray(data)
          ? data
          : data.ventas || data.data || [];

        // 📅 solo HOY (igual que antes)
        const hoy = new Date();
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

        const filtradas = lista.filter(v => {
          const fecha = new Date(v.created_at || v.fecha);
          return fecha >= inicio;
        });

        setVentas(filtradas);

      } catch (err) {
        console.error("Error caja:", err);
        setVentas([]);
      }
    };

    fetchCaja();
  }, [token]);

  // 🔥 cálculos como en tu original
  const totalDia = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
  const totalVentas = ventas.length;
  const promedio = totalVentas ? totalDia / totalVentas : 0;

  const porMetodo = ventas.reduce((acc, v) => {
    const m = v.metodo_pago || "Otro";
    acc[m] = (acc[m] || 0) + Number(v.total || 0);
    return acc;
  }, {});

  return (
    <div className="caja-wrap">

      <div className="caja-stats">
        <div className="caja-stat">
          <div className="caja-stat-label">Ventas hoy</div>
          <div className="caja-stat-val">${totalDia.toLocaleString("es-CO")}</div>
        </div>

        <div className="caja-stat">
          <div className="caja-stat-label">Transacciones</div>
          <div className="caja-stat-val">{totalVentas}</div>
        </div>

        <div className="caja-stat">
          <div className="caja-stat-label">Promedio</div>
          <div className="caja-stat-val verde">
            ${promedio.toLocaleString("es-CO")}
          </div>
        </div>
      </div>

      <div className="caja-metodos">
        <h3>Métodos de pago</h3>

        {Object.entries(porMetodo).map(([metodo, valor]) => (
          <div key={metodo} className="metodo-row">
            <div className="metodo-row-label">{metodo}</div>
            <div className="metodo-row-val">
              ${valor.toLocaleString("es-CO")}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}