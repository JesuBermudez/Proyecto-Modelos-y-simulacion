import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from "lightweight-charts";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa6";

export default function PlatinoChart() {
  const chartContainerRefP = useRef();
  const chartContainerRefS = useRef();
  const chartP = useRef();
  const chartS = useRef();
  const predictionSeriesP = useRef();
  const predictionSeriesS = useRef();
  const [days, setDays] = useState("");
  const [dataP, setDataP] = useState([]);
  const [dataS, setDataS] = useState([]);
  const [goingUpP, setGoingUpP] = useState(false);
  const [goingUpS, setGoingUpS] = useState(false);
  const [changeValueP, setChangeP] = useState(0.0);
  const [changeValueS, setChangeS] = useState(0.0);
  const [changePercentageValueP, setChangePercentageP] = useState(0.0);
  const [changePercentageValueS, setChangePercentageS] = useState(0.0);
  const [lineAdded, setLineAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toolTipP, setToolTipP] = useState({
    width: "140px",
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
  const [toolTipS, setToolTipS] = useState({
    width: "140px",
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
        "https://api-node-motor-finaciero-production.up.railway.app/api/micro/metales/colombia"
      )
      .then((response) => {
        let apiData = response.data;

        if (apiData != undefined) {
          apiData.sort((a, b) => new Date(a.date) - new Date(b.date));

          let TransformedDataP = apiData.map((p) => {
            let date = new Date(p.date);
            let localDate = new Date(
              date.getTime() - date.getTimezoneOffset() * 60000
            );
            return {
              time: localDate.getTime() / 1000,
              value: p.platinum.purchase_price,
            };
          });

          let TransformedDataS = apiData.map((p) => {
            let date = new Date(p.date);
            let localDate = new Date(
              date.getTime() - date.getTimezoneOffset() * 60000
            );
            return {
              time: localDate.getTime() / 1000,
              value: p.platinum.sales_price,
            };
          });

          setDataP(TransformedDataP);
          setDataS(TransformedDataS);
        }
      });
  }, []);

  useEffect(() => {
    if (dataP.length > 0) {
      chartP.current = createChart(chartContainerRefP.current, {
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
        height: 300,
      });

      let changeP =
        dataP[dataP.length - 1].value - dataP[dataP.length - 2].value;
      setChangeP(changeP.toFixed(4));
      setChangePercentageP((changeP / dataP[dataP.length - 2].value) * 100);

      setGoingUpP(
        dataP[dataP.length - 1].value >= dataP[dataP.length - 2].value
      );

      let lineColorP =
        dataP[dataP.length - 1].value >= dataP[dataP.length - 2].value
          ? "#34a853"
          : "#ea4335";

      predictionSeriesP.current = chartP.current.addLineSeries({
        color: "rgb(4, 111, 232)",
      });

      const newSeriesP = chartP.current.addAreaSeries({
        lineColor: lineColorP,
        topColor: lineColorP,
        bottomColor: "rgba(255, 255, 255, 0)",
      });

      newSeriesP.setData(dataP);

      return () => [chartP.current.remove()];
    }
  }, [dataP]);

  useEffect(() => {
    if (dataS.length > 0) {
      chartS.current = createChart(chartContainerRefS.current, {
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
        height: 300,
      });

      let changeS =
        dataS[dataS.length - 1].value - dataS[dataS.length - 2].value;
      setChangeS(changeS.toFixed(4));
      setChangePercentageS((changeS / dataS[dataS.length - 2].value) * 100);

      setGoingUpS(
        dataS[dataS.length - 1].value >= dataS[dataS.length - 2].value
      );

      let lineColorS =
        dataS[dataS.length - 1].value >= dataS[dataS.length - 2].value
          ? "#34a853"
          : "#ea4335";

      predictionSeriesS.current = chartS.current.addLineSeries({
        color: "rgb(4, 111, 232)",
      });

      const newSeriesS = chartS.current.addAreaSeries({
        lineColor: lineColorS,
        topColor: lineColorS,
        bottomColor: "rgba(255, 255, 255, 0)",
      });

      newSeriesS.setData(dataS);

      return () => [chartS.current.remove()];
    }
  }, [dataS]);

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (!lineAdded) {
      setLoading(
        <span style={{ color: "white" }}>
          <FaSpinner />
        </span>
      );
      axios
        .get(`https://mpf.fly.dev/predicciones/microeconomicas/metales/${days}`)
        .then((response) => {
          const container =
            document.getElementsByClassName("chart-container")[0];

          const toolTipWidth = 140;
          const toolTipHeight = 95;
          const toolTipMargin = 15;

          chartP.current.subscribeCrosshairMove((param) => {
            if (
              param.point === undefined ||
              !param.time ||
              param.point.x < 0 ||
              param.point.y < 0 ||
              param.seriesData.get(predictionSeriesP.current) == undefined
            ) {
              setToolTipP((prevState) => ({ ...prevState, display: "none" }));
            } else {
              const date = new Date(param.time * 1000);
              const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}, ${date.getFullYear()}`;
              const data = param.seriesData.get(predictionSeriesP.current);
              const price = data.value !== undefined ? data.value : data.close;
              const content = `<div>Predicción</div>
                <div style="font-size: 24px; margin: 4px 0px;">${price.toFixed(
                  2
                )}</div><div>${dateStr}</div>`;

              const coordinate =
                predictionSeriesP.current.priceToCoordinate(price);
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
              setToolTipP((prevState) => ({
                ...prevState,
                left: shiftedCoordinate + "px",
                top: coordinateY + "px",
                display: "block",
                content,
              }));
            }
          });

          chartS.current.subscribeCrosshairMove((param) => {
            if (
              param.point === undefined ||
              !param.time ||
              param.point.x < 0 ||
              param.point.y < 0 ||
              param.seriesData.get(predictionSeriesS.current) == undefined
            ) {
              setToolTipS((prevState) => ({ ...prevState, display: "none" }));
            } else {
              const date = new Date(param.time * 1000);
              const dateStr = `${date.getUTCDate()} ${date.toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}, ${date.getFullYear()}`;
              const data = param.seriesData.get(predictionSeriesS.current);
              const price = data.value !== undefined ? data.value : data.close;
              const content = `<div>Predicción</div>
                <div style="font-size: 24px; margin: 4px 0px;">${price.toFixed(
                  2
                )}</div><div>${dateStr}</div>`;

              const coordinate =
                predictionSeriesS.current.priceToCoordinate(price);
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
              setToolTipS((prevState) => ({
                ...prevState,
                left: shiftedCoordinate + "px",
                top: coordinateY + "px",
                display: "block",
                content,
              }));
            }
          });

          setLoading("Generar");

          predictionSeriesP.current.update(dataP[dataP.length - 1]);
          predictionSeriesS.current.update(dataS[dataS.length - 1]);

          response.data.shift();

          response.data.forEach((point, index) => {
            setTimeout(() => {
              predictionSeriesP.current.update({
                time: new Date(point[0]).getTime() / 1000,
                value: point[1][2].platino.compra,
              });
              chartP.current.timeScale().scrollToRealTime();

              predictionSeriesS.current.update({
                time: new Date(point[0]).getTime() / 1000,
                value: point[1][2].platino.venta,
              });
              chartS.current.timeScale().scrollToRealTime();
            }, index + 1 * 40);
          });
        });

      setLineAdded(true);
    }
  };

  return (
    <>
      <article className="chart">
        <h2>Precio de compra</h2>
        <div className="chart-flex">
          <h3>
            {dataP.length == 0
              ? "Loading..."
              : dataP[dataP.length - 1].value.toFixed(4)}
          </h3>
          <div
            className="chart-flex__box"
            style={{
              color: goingUpP ? "#137333" : "#a50e0e",
              background: goingUpP
                ? "rgba(47, 205, 47, 0.17)"
                : "rgba(205, 47, 47, 0.17)",
            }}
          >
            {goingUpP ? (
              <BsArrowUpShort className="box__icon" />
            ) : (
              <BsArrowDownShort className="box__icon" />
            )}
            <p>{Math.abs(changePercentageValueP).toFixed(2)} %</p>
          </div>
          <p
            className="chart-changeValue"
            style={{ color: goingUpP ? "#137333" : "#a50e0e" }}
          >
            {changeValueP < 0 ? "" : "+"}
            {changeValueP}
          </p>
        </div>
        <p className="chart__time">
          {dataP.length != 0 &&
            new Date(dataP[dataP.length - 1].time * 1000).toLocaleDateString(
              undefined,
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
        </p>
        <div className="chart-container" ref={chartContainerRefP}>
          <div
            style={toolTipP}
            dangerouslySetInnerHTML={{ __html: toolTipP.content }}
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
            style={
              loading ? { background: "grey", cursor: "not-allowed" } : null
            }
          >
            {loading ? loading : "Generar"}
          </button>
        </form>
      </article>
      <article className="chart">
        <h2>Precio de venta</h2>
        <div className="chart-flex">
          <h3>
            {dataS.length == 0
              ? "Loading..."
              : dataS[dataS.length - 1].value.toFixed(4)}
          </h3>
          <div
            className="chart-flex__box"
            style={{
              color: goingUpS ? "#137333" : "#a50e0e",
              background: goingUpS
                ? "rgba(47, 205, 47, 0.17)"
                : "rgba(205, 47, 47, 0.17)",
            }}
          >
            {goingUpS ? (
              <BsArrowUpShort className="box__icon" />
            ) : (
              <BsArrowDownShort className="box__icon" />
            )}
            <p>{Math.abs(changePercentageValueS).toFixed(2)} %</p>
          </div>
          <p
            className="chart-changeValue"
            style={{ color: goingUpS ? "#137333" : "#a50e0e" }}
          >
            {changeValueS < 0 ? "" : "+"}
            {changeValueS}
          </p>
        </div>
        <p className="chart__time">
          {dataS.length != 0 &&
            new Date(dataS[dataS.length - 1].time * 1000).toLocaleDateString(
              undefined,
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
        </p>
        <div className="chart-container" ref={chartContainerRefS}>
          <div
            style={toolTipS}
            dangerouslySetInnerHTML={{ __html: toolTipS.content }}
          />
        </div>
      </article>
    </>
  );
}
