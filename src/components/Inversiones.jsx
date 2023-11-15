import "./charts/chart.css";
import axios from "axios";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { CompanyCard } from "./componets/CompanyCard";
import CompanyChart from "./charts/CompanyChart";

const socket = io(
  "https://api-node-motor-finaciero-production.up.railway.app/"
);

export default function Inversiones() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(false);
  const [companySelected, setCompanySelected] = useState(<></>);

  useEffect(() => {
    if (data.length == 0) {
      axios
        .get(
          "https://api-node-motor-finaciero-production.up.railway.app/API/Micro/inicial/acciones"
        )
        .then((response) => {
          setData(response.data);
        });
    }

    socket.on("accionesReceived", (accionesReceived) =>
      setData(accionesReceived)
    );

    return () => {
      socket.off("accionesReceived", (accionesReceived) =>
        setData(accionesReceived)
      );
    };
  }, []);

  return !selected ? (
    <div className="inversiones-content">
      <h2>Acciones</h2>
      {data.length != 0 ? (
        data.map((company, index) => (
          <CompanyCard
            key={index}
            company={company}
            onTap={() => {
              setSelected(true);
              setCompanySelected(
                <CompanyChart
                  company={company}
                  onClose={() => setSelected(false)}
                />
              );
            }}
          />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  ) : (
    companySelected
  );
}
