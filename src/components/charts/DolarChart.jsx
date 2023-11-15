import React, { useState, useEffect, useRef } from "react";
import { ColorType, createChart } from "lightweight-charts";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa6";
import io from "socket.io-client";
import axios from "axios";

const socket = io(
  "https://api-node-motor-finaciero-production.up.railway.app/"
);

export default function DolarChart() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const predictionSeries = useRef();
  const series = useRef();
  const [days, setDays] = useState("");
  const [data, setData] = useState([]);
  const [goingUp, setGoingUp] = useState(false);
  const [changeValue, setChange] = useState(0.0);
  const [changePercentageValue, setChangePercentage] = useState(0.0);
  const [yesterdayValue, setYesterdayValue] = useState(0.0);
  const [lineAdded, setLineAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toolTip, setToolTip] = useState({
    width: "110px",
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
    if (data.length == 0) {
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
        grid: {
          vertLines: {
            visible: false,
          },
        },
        height: 285,
      });

      predictionSeries.current = chart.current.addLineSeries({
        color: "rgb(4, 111, 232)",
      });

      series.current = chart.current.addAreaSeries({
        lineColor: "rgb(0, 150, 255)",
        topColor: "rgb(0, 150, 255)",
        bottomColor: "rgba(255, 255, 255, 0)",
      });

      axios
        .get(
          "https://api-node-motor-finaciero-production.up.railway.app/api/macro/dolar/colombia"
        )
        .then((response) => {
          let apiData = response.data.dataSort;

          if (apiData != undefined) {
            apiData.sort(
              (a, b) => new Date(a.year_month_day) - new Date(b.year_month_day)
            );

            let TransformedData = apiData.map((d) => {
              const [year, month, day] = d.year_month_day
                .split("-")
                .map(Number);
              const date = new Date(Date.UTC(year, month - 1, day));
              return {
                time: date.getTime() / 1000,
                value: d.dolar,
              };
            });
            series.current.setData(TransformedData);
            chart.current.timeScale().applyOptions({
              barSpacing: 40,
            });

            setYesterdayValue(
              TransformedData[TransformedData.length - 2].value
            );
            setData(TransformedData);
          }
        });
    }

    const handleDataReceived = (dataReceived) => {
      let date = new Date(dataReceived.time);

      let localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );

      dataReceived.time = localDate.getTime() / 1000;

      setData((prevData) => {
        if (
          prevData.length > 0 &&
          dataReceived.value &&
          prevData[prevData.length - 1].value != dataReceived.value
        ) {
          series.current.update(dataReceived);
          chart.current.timeScale().scrollToRealTime();

          return [...prevData, dataReceived];
        } else {
          return prevData;
        }
      });
    };

    socket.on("dataReceived", handleDataReceived);

    return () => {
      socket.off("dataReceived", handleDataReceived);
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (data.length > 1) {
      let change = data[data.length - 1].value - yesterdayValue;
      setChange(change.toFixed(4));
      setChangePercentage((change / yesterdayValue) * 100);

      setGoingUp(data[data.length - 1].value >= yesterdayValue);

      let lineColor =
        data[data.length - 1].value >= yesterdayValue ? "#34a853" : "#ea4335";

      series.current.applyOptions({
        lineColor: lineColor,
        topColor: lineColor,
        bottomColor: "rgba(255, 255, 255, 0)",
      });
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
        .get(`https://mpf.fly.dev/predicciones/macroeconomicas/dolar/${days}`)
        .then((response) => {
          const container =
            document.getElementsByClassName("chart-container")[0];

          const toolTipWidth = 110;
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
              const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}, ${date.getFullYear()}`;
              const data = param.seriesData.get(predictionSeries.current);
              const price = data.value !== undefined ? data.value : data.close;
              const content = `<div>Predicción</div>
                <div style="font-size: 24px; margin: 4px 0px;">${price}</div><div>${dateStr}</div>`;

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
                time: new Date(point.year_month_day).getTime() / 1000,
                value: point.dolar,
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
      <h2>Dólar estadounidense a Peso colombiano</h2>
      <div className="chart-flex">
        <h3>
          {data.length == 0
            ? "Loading..."
            : data[data.length - 1].value.toFixed(4)}
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
          {changeValue < 0 ? "" : "+"}
          {changeValue}
        </p>
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
          name="days"
          min="1"
          max="5"
          step="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <p>dias</p>
        <button
          style={loading ? { background: "grey", cursor: "not-allowed" } : null}
        >
          {loading ? loading : "Generar"}
        </button>
      </form>
    </article>
  );
}
