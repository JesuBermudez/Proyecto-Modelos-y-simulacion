import "./charts/chart.css";
import { useState } from "react";
import { HorizontalButton } from "./componets/Buttons";
import TipChart from "./charts/TipChart";
import DolarChart from "./charts/DolarChart";
import PibCorrienteChart from "./charts/PibCorrienteChart";
import PibConstanteChart from "./charts/PibConstanteChart";
import DesempleoChart from "./charts/DesempleoChart";
import InflacionChart from "./charts/InflacionChart";

export default function Macro() {
  const [selected, setSelected] = useState("tip");
  const components = {
    tip: <TipChart />,
    dolar: <DolarChart />,
    pibCorriente: <PibCorrienteChart />,
    pibConstante: <PibConstanteChart />,
    desempleo: <DesempleoChart />,
    inflacion: <InflacionChart />,
  };

  return (
    <>
      <div className="horizontal-buttons">
        <HorizontalButton
          text={"TIP"}
          onTap={() => setSelected("tip")}
          className={selected == "tip" && "horizontal-button__selected"}
        />
        <HorizontalButton
          text={"Dolar"}
          onTap={() => setSelected("dolar")}
          className={selected == "dolar" && "horizontal-button__selected"}
        />
        <HorizontalButton
          text={"PIB Corriente"}
          onTap={() => setSelected("pibCorriente")}
          className={
            selected == "pibCorriente" && "horizontal-button__selected"
          }
        />
        <HorizontalButton
          text={"PIB Constante"}
          onTap={() => setSelected("pibConstante")}
          className={
            selected == "pibConstante" && "horizontal-button__selected"
          }
        />
        <HorizontalButton
          text={"Desempleo"}
          onTap={() => setSelected("desempleo")}
          className={selected == "desempleo" && "horizontal-button__selected"}
        />
        <HorizontalButton
          text={"Inflacion"}
          onTap={() => setSelected("inflacion")}
          className={selected == "inflacion" && "horizontal-button__selected"}
        />
      </div>
      {components[selected]}
    </>
  );
}
