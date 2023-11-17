import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa6";

export default function InflacionChart() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const predictionSeries = useRef();
  const [data, setData] = useState([]);
  const [goingUp, setGoingUp] = useState(false);
  const [changePercentageValue, setChangePercentage] = useState(0.0);
  const [months, setMonths] = useState("");
  const [lineAdded, setLineAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toolTip, setToolTip] = useState({
    width: "95px",
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
        "https://api-node-motor-finaciero-production.up.railway.app/api/macro/inflacion/colombia"
      )
      .then((response) => {
        let apiData = response.data.inflationData;

        if (apiData != undefined) {
          apiData.sort(
            (a, b) => new Date(a.year_month) - new Date(b.year_month)
          );

          let TransformedData = apiData.map((i) => {
            let date = new Date(i.year_month);
            return {
              time: date.getTime() / 1000,
              value: i.inflation,
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
          priceFormatter: (p) => p.toFixed(2) + "%",
        },
        timeScale: { barSpacing: 15 },
        grid: {
          vertLines: {
            visible: false,
          },
        },
        height: window.innerWidth - window.innerHeight >= 330 ? window.innerHeight / 3 : 285,
      });

      let change = data[data.length - 1].value - data[data.length - 2].value;
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
    if (!lineAdded) {
      setLoading(
        <span style={{ color: "white" }}>
          <FaSpinner />
        </span>
      );
      axios
        .get(
          `https://mpf.fly.dev/predicciones/macroeconomicas/inflacion/${months}`
        )
        .then((response) => {
          const container =
            document.getElementsByClassName("chart-container")[0];

          const toolTipWidth = 95;
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
                <div style="font-size: 24px; margin: 4px 0px;">${price.toFixed(
                  2
                )}%</div><div>${dateStr}</div>`;

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
                time: new Date(point.year_month).getTime() / 1000,
                value: point.inflation,
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
      <h2>Inflación</h2>
      <div className="chart-flex">
        <h3>
          {data.length == 0
            ? "Loading..."
            : `${data[data.length - 1].value.toFixed(2)}%`}
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
      <form className="prediction-container" onSubmit={handleButtonClick}>
        <label>Predicción:</label>
        <input
          required
          type="number"
          name="months"
          min="1"
          max="5"
          step="1"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
        />
        <p>meses</p>
        <button
          style={loading ? { background: "grey", cursor: "not-allowed" } : null}
        >
          {loading ? loading : "Generar"}
        </button>
      </form>
    </article>
  );
}
