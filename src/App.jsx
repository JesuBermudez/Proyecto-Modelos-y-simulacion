import { useEffect, useState } from "react";
import Sections from "./components/Sections";
import { SectionButton } from "./components/componets/Buttons";
import Card from "./components/componets/Card";

export default function App() {
  const [selected, setSelected] = useState("micro");
  const array = [1, 2, 3];

  useEffect(() => {
    array.sort(() => Math.random() - 0.5);
  }, []);

  return (
    <>
      <h1>Monitor financiero</h1>
      <div className="content">
        <div className="content-buttons">
          <SectionButton
            text={"Indices Microeconomicos"}
            onTap={() => setSelected("micro")}
            className={selected != "micro" && "section-button__unselected"}
          />
          <SectionButton
            text={"Indices Macroeconomicos"}
            onTap={() => setSelected("macro")}
            className={selected != "macro" && "section-button__unselected"}
          />
          <SectionButton
            text={"Inversiones"}
            onTap={() => setSelected("inversiones")}
            className={
              selected != "inversiones" && "section-button__unselected"
            }
          />
        </div>
        <Sections selected={selected} />
      </div>
      <div style={{ width: "100%", display: "flex", gap: "25px" }}>
        <Card
          name={"Jesus Bermudez"}
          image={"./assets/jesus.png"}
          banner={`./assets/banner${array[0]}.webp`}
          about={
            <>
              Ingenieria en sistemas <br /> front-end developer
            </>
          }
          message={"https://wa.link/0xf98p"}
          mail={"jmanuelbermudez@unicesar.edu.co"}
        />
        <Card
          name={"Jerson Tapias"}
          image={"./assets/camilo.jpg"}
          banner={`./assets/banner${array[1]}.webp`}
          about={
            <>
              Ingenieria en sistemas <br /> back-end developer
            </>
          }
          message={"https://wa.link/bmaa88"}
          mail={"jcamilotapias@unicesar.edu.co"}
        />
        <Card
          name={"Kadir Quintero"}
          image={"./assets/kadir.jpg"}
          banner={`./assets/banner${array[2]}.webp`}
          about={
            <>
              Ingenieria en sistemas <br /> front-end developer
            </>
          }
          message={"https://wa.link/llqg82"}
          mail={"keduardoquintero@unicesar.edu.co"}
        />
      </div>
    </>
  );
}
