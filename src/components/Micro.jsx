import "./charts/chart.css";
import { useState } from "react";
import { HorizontalButton } from "./componets/Buttons";
import OroChart from "./charts/OroChart";
import PlataChart from "./charts/PlataChart";
import PlatinoChart from "./charts/PlatinoChart";
import IpcChart from "./charts/IpcChart";

export default function Micro() {
  const [selected, setSelected] = useState("oro");
  const components = {
    oro: <OroChart />,
    plata: <PlataChart />,
    platino: <PlatinoChart />,
    ipc: <IpcChart />,
  };

  return (
    <>
      <div className="horizontal-buttons">
        <HorizontalButton
          text={"Oro"}
          onTap={() => setSelected("oro")}
          className={selected == "oro" && "horizontal-button__selected"}
        />
        <HorizontalButton
          text={"Plata"}
          onTap={() => setSelected("plata")}
          className={selected == "plata" && "horizontal-button__selected"}
        />
        <HorizontalButton
          text={"Platino"}
          onTap={() => setSelected("platino")}
          className={selected == "platino" && "horizontal-button__selected"}
        />
        <HorizontalButton
          text={"IPC"}
          onTap={() => setSelected("ipc")}
          className={selected == "ipc" && "horizontal-button__selected"}
        />
      </div>
      {components[selected]}
    </>
  );
}
