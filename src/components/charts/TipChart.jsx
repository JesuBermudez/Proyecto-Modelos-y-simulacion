import "./chart.css";
import React, { useState, useEffect, useRef } from "react";
import { ColorType, createChart } from "lightweight-charts";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";
import axios from "axios";

export default function TipChart() {
  const chartContainerRef = useRef();
  const chart = useRef();
  const [data, setData] = useState([]);
  const [goingUp, setGoingUp] = useState(false);
  const [changePercentageValue, setChangePercentage] = useState(0.0);

  useEffect(() => {
    axios
      .get(
        "https://api-node-motor-finaciero-production.up.railway.app/api/macro/tip/colombia"
      )
      .then((response) => {
        let apiData = response.data.tipData;

        if (apiData != undefined) {
          apiData.sort(
            (a, b) => new Date(a.year_month_day) - new Date(b.year_month_day)
          );

          let TransformedData = apiData.map((t) => {
            return {
              time: new Date(t.year_month_day).getTime() / 1000,
              value: t.tip,
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
          priceFormatter: (p) => p.toFixed(1) + "%",
        },
        timeScale: { barSpacing: 1 },
        grid: {
          vertLines: {
            visible: false,
          },
        },
        height: 300,
      });

      let change = data[data.length - 1].value - data[data.length - 2].value;
      setChangePercentage((change / data[data.length - 2].value) * 100);

      setGoingUp(data[data.length - 1].value >= data[data.length - 2].value);

      let lineColor =
        data[data.length - 1].value >= data[data.length - 2].value
          ? "#34a853"
          : "#ea4335";

      const newSeries = chart.current.addAreaSeries({
        lineColor: lineColor,
        topColor: lineColor,
        bottomColor: "rgba(255, 255, 255, 0)",
      });

      newSeries.setData(data);

      return () => [chart.current.remove()];
    }
  }, [data]);

  return (
    <article className="chart">
      <h2>TIP (Tasas de intervención de política monetaria)</h2>
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
          new Date(data[data.length - 1].time * 1000).toUTCString()}
      </p>
      <div className="chart-container" ref={chartContainerRef}></div>
    </article>
  );
}
