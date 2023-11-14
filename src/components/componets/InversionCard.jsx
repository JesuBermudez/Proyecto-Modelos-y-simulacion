import "./inversionCard.css";
import { useState } from "react";
import { BsArrowLeftShort } from "react-icons/bs";

export default function InversionCard({ company, prediction, onClose }) {
  const [inversion, setInversion] = useState(false);
  const [acciones, setAcciones] = useState(1);
  const min = parseFloat(
    company.data.last.split(".").join("").split(",").join(".")
  );
  const [monto, setMonto] = useState(
    parseFloat(company.data.last.split(".").join("").split(",").join("."))
  );

  const handleMonto = (value) => {
    let accionesCount = Math.trunc(value / min);
    accionesCount < 1 ? setMonto(min) : setMonto(min * accionesCount);
    setAcciones(accionesCount);
  };

  const handleAcciones = (value) => {
    setAcciones(value);
    setMonto(min * value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setInversion(true);
  };

  return (
    <article className="inversion">
      <div className="inversion-content">
        <div className="inversion__title">
          <h2>{company.name}</h2>
          <span onClick={() => onClose()}>
            <BsArrowLeftShort />
          </span>
        </div>
        {!inversion ? (
          <>
            <p className="inversion-subtitle">
              ¿Cuanto quiere invertir en la empresa?
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="montoInput" style={{ fontSize: "20px" }}>
                $
              </label>
              <input
                id="montoInput"
                type="number"
                min={min}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                onBlur={(e) => handleMonto(e.target.value)}
              />
              <div className="inversion__acciones">
                <label htmlFor="accionesInput">Acciones</label>
                <button
                  type="button"
                  className="acciones-button"
                  onClick={() => acciones > 1 && handleAcciones(acciones - 1)}
                >
                  -
                </button>
                <input
                  id="accionesInput"
                  type="number"
                  min={1}
                  step={1}
                  value={acciones}
                  onChange={(e) => handleAcciones(e.target.value)}
                />
                <button
                  type="button"
                  className="acciones-button"
                  onClick={() => handleAcciones(acciones + 1)}
                >
                  +
                </button>
              </div>
              <div className="inversion-total">
                <p>Total a invertir</p>
                <p>${new Intl.NumberFormat("de-DE").format(monto)}</p>
              </div>
              <button className="inversion__submit-button" type="submit">
                Invertir
              </button>
            </form>
          </>
        ) : (
          <p className="final-conclusion">
            Si invierte en <strong>{acciones}</strong> acciones, es decir,{" "}
            <strong>${new Intl.NumberFormat("de-DE").format(monto)}</strong> en{" "}
            <strong>"{company.name}"</strong>, lo mas probable es que{" "}
            {min > prediction ? "pierda" : "gane"} aproximadamente: $
            <strong>
              {Math.abs(min * acciones - prediction * acciones).toFixed(2)}
            </strong>
            . <br />
            Por lo tanto,{" "}
            {min > prediction
              ? "no deberia invertir en esta empresa por el momento."
              : "no hay problema si esta pensando en invertir en esta empresa."}
          </p>
        )}
      </div>
    </article>
  );
}
