import Micro from "./Micro";
import Macro from "./Macro";
import Inversiones from "./Inversiones";

export default function Sections({ selected }) {
  const components = {
    micro: <Micro />,
    macro: <Macro />,
    inversiones: <Inversiones />,
  };

  return <section>{components[selected]}</section>;
}
