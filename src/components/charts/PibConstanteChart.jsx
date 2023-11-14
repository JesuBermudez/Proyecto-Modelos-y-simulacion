import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa6";

export default function PibConstanteChart() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const predictionSeries = useRef();
  const [data, setData] = useState([]);
  const [goingUp, setGoingUp] = useState(false);
  const [changeValue, setChange] = useState(0.0);
  const [changePercentageValue, setChangePercentage] = useState(0.0);
  const [years, setYears] = useState("");
  const [lineAdded, setLineAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toolTip, setToolTip] = useState({
    width: "105px",
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
        "https://api-node-motor-finaciero-production.up.railway.app/api/macro/pibconstante/colombia"
      )
      .then((response) => {
        let apiData = response.data.pibConstData;

        if (apiData != undefined) {
          apiData.sort((a, b) => new Date(a.year) - new Date(b.year));

          let TransformedData = apiData.map((p) => {
            let date = new Date(p.year);
            let localDate = new Date(
              date.getTime() - date.getTimezoneOffset() * 60000
            );
            return {
              time: localDate.getTime() / 1000,
              value: parseFloat(p.pib.split(",").join(".")),
            };
          });

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
          priceFormatter: (p) => `$${p.toFixed(2)}M`,
        },
        timeScale: { barSpacing: 60 },
        grid: {
          vertLines: {
            visible: false,
          },
        },
        height: 285,
      });

      let change = data[data.length - 1].value - data[data.length - 2].value;
      setChange(change.toFixed(4));
      setChangePercentage((change / data[data.length - 2].value) * 100);

      setGoingUp(data[data.length - 1].value >= data[data.length - 2].value);

      let lineColor =
        data[data.length - 1].value >= data[data.length - 2].value
          ? "#34a853"
          : "#ea4335";

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
    const currentYear = new Date(Date.now()).getFullYear();

    if (!lineAdded) {
      setLoading(
        <span style={{ color: "white" }}>
          <FaSpinner />
        </span>
      );
      axios
        .get(
          `https://mpf.fly.dev/predicciones/macroeconomicas/pib_constante/${currentYear}/${
            currentYear + years
          }`
        )
        .then((response) => {
          const container =
            document.getElementsByClassName("chart-container")[0];

          const toolTipWidth = 105;
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
              const date = new Date(param.time * 1000);
              date.setUTCMonth(date.getUTCMonth() + 1);
              const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}, ${date.getFullYear()}`;
              const data = param.seriesData.get(predictionSeries.current);
              const price = data.value !== undefined ? data.value : data.close;
              const content = `<div>Predicción</div>
                <div style="font-size: 24px; margin: 4px 0px;">$${price.toFixed(
                  3
                )}M</div><div>${dateStr}</div>`;

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

          response.data.forEach((point, index) => {
            setTimeout(() => {
              predictionSeries.current.update({
                time: new Date(point.year).getTime() / 1000,
                value: parseFloat(point.pib).toFixed(3),
              });
              chart.current.timeScale().scrollToRealTime();
            }, index + 1 * 40);
          });
        });

      setLineAdded(true);
    }
  };

  return (
    <article className="chart">
      <h2>PIB Corriente</h2>
      <div className="chart-flex">
        <h3>
          {data.length == 0 ? "Loading..." : `$${data[data.length - 1].value}M`}
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
          <p>{Math.abs(changePercentageValue.toFixed(2))} %</p>
        </div>
        <p
          className="chart-changeValue"
          style={{ color: goingUp ? "#137333" : "#a50e0e" }}
        >
          {changeValue < 0 ? "" : "+"}${changeValue}M
        </p>
      </div>
      <p className="chart__time">
        {data.length != 0 &&
          new Date(data[data.length - 1].time * 1000).toLocaleDateString(
            undefined,
            {
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
      <form className="prediction-container" onSubmit={handleButtonClick}>
        <label>Predicción:</label>
        <input
          required
          type="number"
          name="years"
          min="1"
          max="5"
          step="1"
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
        <p>años</p>
        <button
          style={loading ? { background: "grey", cursor: "not-allowed" } : null}
        >
          {loading ? loading : "Generar"}
        </button>
      </form>
    </article>
  );
}
