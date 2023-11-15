import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";
import {
  BsArrowDownShort,
  BsArrowUpShort,
  BsArrowLeftShort,
} from "react-icons/bs";
import { FaSpinner } from "react-icons/fa6";
import InversionCard from "../componets/InversionCard";

export default function CompanyChart({ company, onClose }) {
  const chartContainerRef = useRef();
  const chart = useRef();
  const predictionSeries = useRef();
  const [inversion, setInversion] = useState(false);
  const [prediction, setPrediction] = useState(0.0);
  const [data, setData] = useState([]);
  const [adicionalData, setAdicionalData] = useState({});
  const [goingUp, setGoingUp] = useState(false);
  const [change, setChange] = useState(0.0);
  const [changePercentageValue, setChangePercentage] = useState(0.0);
  const [minutes, setMinutes] = useState("");
  const [lineAdded, setLineAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toolTip, setToolTip] = useState({
    width: "125px",
    height: "95px",
    position: "absolute",
    display: "none",
    left: "12px",
    top: "12px",
    padding: "8px",
    boxSizing: "border-box",
    fontSize: "12px",
    textAlign: "left",
    zIndex: "1000",
    background: "white",
    color: "black",
    border: "2px solid #2962FF",
    content: "",
  });

  useEffect(() => {
    axios
      .get(
        `https://api-node-motor-finaciero-production.up.railway.app/api/micro/acciones/${company.name}`
      )
      .then((response) => {
        let apiData = response.data.data;

        if (apiData != undefined) {
          const year = new Date(Date.now()).getFullYear();
          apiData.sort(
            (a, b) =>
              new Date(
                `${a.data.hour.split("/").reverse().join("/")}/${year}`
              ) -
              new Date(`${b.data.hour.split("/").reverse().join("/")}/${year}`)
          );

          let TransformedData = apiData.map((c) => {
            let date = new Date(
              `${c.data.hour.split("/").reverse().join("/")}/${year}`
            );
            return {
              time: date.getTime() / 1000,
              value: parseFloat(
                c.data.last.split(".").join("").split(",").join(".")
              ),
            };
          });
          setAdicionalData(apiData[apiData.length - 1].data);
          setData(TransformedData);
        }
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      chart.current = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
        },
        rightPriceScale: {
          visible: false,
        },
        leftPriceScale: {
          visible: true,
          borderVisible: false,
        },
        localization: {
          priceFormatter: (p) => "$" + p.toFixed(2),
        },
        timeScale: { barSpacing: 50 },
        grid: {
          vertLines: {
            visible: false,
          },
        },
        height: 285,
      });

      if (data.length > 1) {
        let change = data[data.length - 1].value - data[data.length - 2].value;
        setChange(change);
        setChangePercentage((change / data[data.length - 2].value) * 100);
        setGoingUp(data[data.length - 1].value >= data[data.length - 2].value);
      } else {
        setChange(
          parseFloat(
            adicionalData.vari.split(".").join("").split(",").join(".")
          )
        );
        setChangePercentage(
          parseFloat(
            adicionalData.percentVar
              .substring(0, adicionalData.percentVar.length - 1)
              .split(".")
              .join("")
              .split(",")
              .join(".")
          )
        );
        setGoingUp(adicionalData.percentVar[0] != "-");
      }

      let lineColor =
        adicionalData.percentVar[0] != "-" ? "#34a853" : "#ea4335";

      predictionSeries.current = chart.current.addLineSeries({
        color: "rgb(4, 111, 232)",
      });

      const newSeries = chart.current.addAreaSeries({
        lineColor: lineColor,
        topColor: lineColor,
        bottomColor: "rgba(255, 255, 255, 0)",
      });

      newSeries.setData(data);

      return () => [chart.current.remove()];
    }
  }, [data]);

  const handleButtonClick = (e) => {
    e.preventDefault();

    let date = new Date(Date.now());
    const dayMonth = date.toLocaleDateString().split("/").slice(0, 2).join("-");
    date.setMinutes(date.getMinutes() + parseInt(minutes));
    const hour = date.getHours();
    const minute = date.getMinutes();

    if (!lineAdded) {
      setLoading(
        <span style={{ color: "white" }}>
          <FaSpinner />
        </span>
      );
      axios
        .get(
          `https://mpf.fly.dev/predicciones/microeconomicas/acciones/${dayMonth}-${
            hour < 10 ? "0" : ""
          }${hour}:${minute < 10 ? "0" : ""}${minute}/${company.name}`
        )
        .then((response) => {
          const container =
            document.getElementsByClassName("chart-container")[0];

          const toolTipWidth = 125;
          const toolTipHeight = 95;
          const toolTipMargin = 15;

          chart.current.subscribeCrosshairMove((param) => {
            if (
              param.point === undefined ||
              !param.time ||
              param.point.x < 0 ||
              param.point.y < 0 ||
              param.seriesData.get(predictionSeries.current) == undefined
            ) {
              setToolTip((prevState) => ({ ...prevState, display: "none" }));
            } else {
              const dateStr = `Hora: ${date.getHours()}:${date.getMinutes()}`;
              const data = param.seriesData.get(predictionSeries.current);
              const price = data.value !== undefined ? data.value : data.close;
              const content = `<div>Predicción</div>
                <div style="font-size: 24px; margin: 4px 0px;">$${price.toFixed(
                  2
                )}</div><div>${dateStr}</div>`;

              const coordinate =
                predictionSeries.current.priceToCoordinate(price);
              let shiftedCoordinate = param.point.x - 50;
              shiftedCoordinate = Math.max(
                0,
                Math.min(
                  container.clientWidth - toolTipWidth,
                  shiftedCoordinate
                )
              );
              const coordinateY =
                coordinate - toolTipHeight - toolTipMargin > 0
                  ? coordinate - toolTipHeight - toolTipMargin
                  : Math.max(
                      0,
                      Math.min(
                        container.clientHeight - toolTipHeight - toolTipMargin,
                        coordinate + toolTipMargin
                      )
                    );
              setToolTip((prevState) => ({
                ...prevState,
                left: shiftedCoordinate + "px",
                top: coordinateY + "px",
                display: "block",
                content,
              }));
            }
          });

          setLoading("Generar");

          predictionSeries.current.update(data[data.length - 1]);
          predictionSeries.current.update({
            time:
              new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                response.data.time.split(":")[0],
                response.data.time.split(":")[1]
              ).getTime() / 1000,
            value: response.data.value,
          });
          chart.current.timeScale().scrollToRealTime();
          setPrediction(response.data.value);
          setLineAdded(true);
          setMinutes("");
        });
    }
  };

  return (
    <>
      <article className="chart">
        <div className="company-chart__title">
          <h2>{company.name}</h2>
          <span onClick={() => onClose()}>
            <BsArrowLeftShort />
          </span>
        </div>
        <div className="chart-flex">
          <h3>
            {data.length == 0
              ? "Loading..."
              : `$${data[data.length - 1].value.toFixed(4)}`}
          </h3>
          <div
            className="chart-flex__box"
            style={{
              color: goingUp ? "#137333" : "#a50e0e",
              background: goingUp
                ? "rgba(47, 205, 47, 0.17)"
                : "rgba(205, 47, 47, 0.17)",
            }}
          >
            {goingUp ? (
              <BsArrowUpShort className="box__icon" />
            ) : (
              <BsArrowDownShort className="box__icon" />
            )}
            <p>{Math.abs(changePercentageValue.toFixed(2))}%</p>
          </div>
          <p
            className="chart-changeValue"
            style={{ color: goingUp ? "#137333" : "#a50e0e" }}
          >
            {change < 0 ? "" : "+"}${change}
          </p>
          <p
            style={{
              paddingLeft: "10px",
              borderLeft: "1px solid rgba(128, 128, 128, 0.35)",
            }}
          >
            Max: ${adicionalData.max}
          </p>
          <p style={{ marginLeft: "10px" }}>Vol: ${adicionalData.vol}</p>
        </div>
        <p className="chart__time">
          {data.length != 0 &&
            new Date(data[data.length - 1].time * 1000).toLocaleDateString(
              undefined,
              {
                timeZone: "UTC",
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
        </p>
        <div className="chart-container" ref={chartContainerRef}>
          <div
            style={toolTip}
            dangerouslySetInnerHTML={{ __html: toolTip.content }}
          />
        </div>
        <div className="prediction">
          <form className="prediction-container" onSubmit={handleButtonClick}>
            <label>Predicción:</label>
            <input
              required
              type="number"
              name="minutes"
              min="1"
              max="60"
              step="1"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
            <p>minutos</p>
            <button
              style={
                loading ? { background: "grey", cursor: "not-allowed" } : null
              }
            >
              {loading ? loading : "Generar"}
            </button>
          </form>
          {lineAdded && (
            <button
              className="prediction-button"
              onClick={() =>
                !inversion &&
                setInversion(
                  <InversionCard
                    company={company}
                    prediction={prediction}
                    onClose={() => setInversion(false)}
                  />
                )
              }
            >
              Invertir
            </button>
          )}
        </div>
      </article>
      {inversion && inversion}
    </>
  );
}
