import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";
import { FaSpinner } from "react-icons/fa6";

export default function IpcChart() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const series = useRef();
  const predictionSeries = useRef();
  const [months, setMonths] = useState("");
  const [data, setData] = useState([]);
  const [additionalData, setAdditionalData] = useState({});
  const [dataBox, setDataBox] = useState("");
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
        "https://api-node-motor-finaciero-production.up.railway.app/api/micro/ipc/colombia"
      )
      .then((response) => {
        if (!chart.current) {
          let apiData = response.data;

          if (apiData != undefined) {
            apiData.sort((a, b) => new Date(a.date) - new Date(b.date));

            let TransformedData = apiData.map((c) => {
              let date = new Date(c.date);
              return {
                time: date.getTime() / 1000,
                value: c.indice,
              };
            });

            let additionalData = {};
            apiData.forEach((item) => {
              let date = new Date(item.date);
              let localDate = new Date(
                date.getTime() - date.getTimezoneOffset() * 60000
              );
              additionalData[localDate.getTime() / 1000] = {
                annual_current_inflation: item.annual_current_inflation,
                annual_inflation: item.annual_inflation,
                monthly_inflation: item.monthly_inflation,
              };
            });

            setAdditionalData(additionalData);
            setData(TransformedData);

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
                scaleMargins: {
                  top: 0.4,
                },
              },
              grid: {
                vertLines: {
                  visible: false,
                },
              },
              timeScale: {
                barSpacing: 12,
              },
              height: 285,
            });

            predictionSeries.current = chart.current.addLineSeries({
              color: "rgb(4, 111, 232)",
            });

            series.current = chart.current.addAreaSeries({
              lineColor: "rgba(245, 124, 0, 1)",
              topColor: "rgba(245, 124, 0, 1)",
              bottomColor: "rgba(255, 255, 255, 0)",
            });

            series.current.setData(TransformedData);
          }
        }
      });
    return () => {
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (chart.current && data.length > 0) {
      chart.current.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.y < 0 ||
          param.seriesData.get(series.current) == undefined
        ) {
          const additionalDataForTimestamp =
            additionalData[data[data.length - 1].time];

          const timestamp = Number(data[data.length - 1].time) * 1000;
          const date = new Date(timestamp);
          date.setUTCMonth(date.getUTCMonth() + 1);
          const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
            "default",
            {
              month: "short",
            }
          )}, ${date.getFullYear()}`;
          setDataBox(
            `<div style="font-size: 18px; margin: 4px 0px; color: #20262E"> Inf. Actual: ${additionalDataForTimestamp.annual_current_inflation}%</div>` +
              `<div style="font-size: 18px; margin: 4px 0px; color: #20262E;">Inf. Anual: ${additionalDataForTimestamp.annual_inflation}%</div>` +
              `<div style="font-size: 17px; margin: 4px 0px; color: #20262E;">Inf. Mensual: ${additionalDataForTimestamp.monthly_inflation}%</div>` +
              "<div style='margin-top: 10px; font-size: 15px;'>" +
              dateStr +
              "</div>"
          );
        } else {
          const additionalDataForTimestamp = additionalData[param.time];

          const timestamp = Number(param.time) * 1000;
          const date = new Date(timestamp);
          date.setUTCMonth(date.getUTCMonth() + 1);
          const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
            "default",
            {
              month: "short",
            }
          )}, ${date.getFullYear()}`;
          setDataBox(
            `<div style="font-size: 18px; margin: 4px 0px; color: #20262E;"> Inf. Actual: ${additionalDataForTimestamp.annual_current_inflation}%</div>` +
              `<div style="font-size: 18px; margin: 4px 0px; color: #20262E;">Inf. Anual: ${additionalDataForTimestamp.annual_inflation}%</div>` +
              `<div style="font-size: 17px; margin: 4px 0px; color: #20262E;">Inf. Mensual: ${additionalDataForTimestamp.monthly_inflation}%</div>` +
              "<div style='margin-top: 10px; font-size: 15px;'>" +
              dateStr +
              "</div>"
          );
        }
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
        .get(`https://mpf.fly.dev/predicciones/microeconomicas/ipc/${months}`)
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
                time: new Date(point.date).getTime() / 1000,
                value: point.indice,
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
      <h2 style={{ marginBottom: "10px" }}>
        IPC (Índice de precios al consumidor)
      </h2>
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
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            display: "block",
            right: "3px",
            top: "3px",
            width: "190px",
            height: "85px",
            lineHeight: "0.95",
            position: "absolute",
            padding: "5px",
            zIndex: "1000",
            pointerEvents: "none",
          }}
          dangerouslySetInnerHTML={{ __html: dataBox }}
        />
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
