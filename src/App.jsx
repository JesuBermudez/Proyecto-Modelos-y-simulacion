import { useEffect, useState } from "react";
import Sections from "./components/Sections";
import { SectionButton } from "./components/componets/Buttons";
import Card from "./components/componets/Card";
import jesus from "./assets/jesus.png"
import jerson from "./assets/camilo.jpg"
import kadir from "./assets/kadir.jpg"
import banner1 from "./assets/banner1.webp"
import banner2 from "./assets/banner2.webp"
import banner3 from "./assets/banner3.webp"

export default function App() {
  const [selected, setSelected] = useState("micro");
  const array = [banner1, banner2, banner3];

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
          image={jesus}
          banner={array[0]}
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
          image={jerson}
          banner={array[1]}
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
          image={kadir}
          banner={array[2]}
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
