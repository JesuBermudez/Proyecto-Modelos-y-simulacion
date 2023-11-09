import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";

export default function IpcChart() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const seriesC = useRef();
  const seriesI = useRef();
  const [dataC, setDataC] = useState([]);
  const [dataI, setDataI] = useState([]);
  const [additionalData, setAdditionalData] = useState({});
  const [toolTip, setToolTip] = useState("");

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

            let TransformedDataC = apiData.map((c) => {
              return {
                time: new Date(c.date).getTime() / 1000,
                value: c.annual_current_inflation,
              };
            });

            let TransformedDataI = apiData.map((i) => {
              return {
                time: new Date(i.date).getTime() / 1000,
                value: i.annual_inflation,
              };
            });

            let additionalData = {};
            apiData.forEach((item) => {
              const timestamp = new Date(item.date).getTime() / 1000;
              additionalData[timestamp] = {
                indice: item.indice,
                monthly_inflation: item.monthly_inflation,
              };
            });

            setAdditionalData(additionalData);
            setDataC(TransformedDataC);
            setDataI(TransformedDataI);

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
                  top: 0.38,
                },
              },
              localization: {
                priceFormatter: (p) => p.toFixed(1) + "%",
              },
              grid: {
                vertLines: {
                  visible: false,
                },
              },
              timeScale: {
                barSpacing: 12,
              },
              height: 300,
            });

            seriesC.current = chart.current.addLineSeries({
              color: "rgba(245, 124, 0, 1)",
            });
            seriesI.current = chart.current.addLineSeries({
              color: "cyan",
            });

            seriesC.current.setData(TransformedDataC);
            seriesI.current.setData(TransformedDataI);
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
    if (chart.current && dataI.length > 0) {
      chart.current.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.y < 0 ||
          (param.seriesData.get(seriesC.current) == undefined &&
            param.seriesData.get(seriesI.current) == undefined)
        ) {
          const additionalDataForTimestamp =
            additionalData[dataI[dataI.length - 1].time];

          const timestamp = Number(dataI[dataI.length - 1].time) * 1000;
          const date = new Date(timestamp);
          date.setUTCMonth(date.getUTCMonth() + 1);
          const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
            "default",
            {
              month: "short",
            }
          )}, ${date.getFullYear()}`;
          setToolTip(
            `<div style="font-size: 22px; margin: 4px 0px; color: #20262E"> Indice: ${additionalDataForTimestamp.indice}%</div>` +
              `<div style="font-size: 18px; margin: 4px 0px; color: #20262E; line-height: 0.85;">Inflación<br/>mensual: ${additionalDataForTimestamp.monthly_inflation}%</div>` +
              "<div>" +
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
          setToolTip(
            `<div style="font-size: 22px; margin: 4px 0px; color: #20262E"> Indice: ${additionalDataForTimestamp.indice}%</div>` +
              `<div style="font-size: 18px; margin: 4px 0px; color: #20262E; line-height: 0.85;">Inflación<br/>mensual: ${additionalDataForTimestamp.monthly_inflation}%</div>` +
              "<div>" +
              dateStr +
              "</div>"
          );
        }
      });
    }
  }, [dataI]);

  return (
    <article className="chart">
      <h2 style={{ marginBottom: "10px" }}>IPC (Inflación anual y actual)</h2>
      <div className="chart-grid">
        <div style={{ background: "cyan" }}></div>
        <p>Inflación anual</p>
        <div style={{ background: "rgba(245, 124, 0, 1)" }}></div>
        <p>Inflación actual</p>
      </div>
      <p className="chart__time">
        {dataC.length != 0 &&
          new Date(dataC[dataC.length - 1].time * 1000).toUTCString()}
      </p>
      <div className="chart-container" ref={chartContainerRef}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            display: "block",
            right: "3px",
            top: "3px",
            width: "170px",
            height: "70px",
            position: "absolute",
            padding: "5px",
            zIndex: "1000",
            pointerEvents: "none",
          }}
          dangerouslySetInnerHTML={{ __html: toolTip }}
        />
      </div>
    </article>
  );
}
