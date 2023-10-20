import React, { useState, useEffect, useRef } from 'react';
import { ColorType, createChart } from 'lightweight-charts';
import io from "socket.io-client";
import axios from 'axios';

const socket = io("https://api-node-motor-finaciero-production.up.railway.app/");

export default function DolarChart() {
    const chartContainerRef = useRef()
    const chart = useRef()
    const [hasAppliedTimeScaleOptions, setHasAppliedTimeScaleOptions] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (data.length == 0) {
            axios.get("https://api-node-motor-finaciero-production.up.railway.app/api/macro/dolar/colombia")
                .then((response) => {
                    let apiData = response.data.dolarData

                    apiData.sort((a, b) => new Date(a.year_month_day) - new Date(b.year_month_day));

                    let TransformedData = apiData.map(d => {
                        return {
                            time: new Date(d.year_month_day).getTime() / 1000,
                            value: d.dolar
                        };
                    });
                    setData(TransformedData)
                })
        }

        const handleDataReceived = (dataReceived) => {
            let date = new Date(dataReceived.time);

            let localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

            dataReceived.time = localDate.getTime() / 1000

            setData(prevData => {
                // Comprueba si ya existe un punto con el mismo valor de tiempo
                if (prevData.length > 0 && prevData[prevData.length - 1].time === dataReceived.time) {
                    return [...prevData.slice(0, -1), dataReceived];
                }
                // De lo contrario, añade el nuevo punto
                else {
                    return [...prevData, dataReceived];
                }
            });
        };

        socket.on("dataReceived", handleDataReceived);

        return () => {
            socket.off("dataReceived", handleDataReceived);
        };
    }, [])


    useEffect(() => {
        if (data.length > 0) {
            chart.current = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" }
                },
                rightPriceScale: {
                    visible: false,
                },
                leftPriceScale: {
                    visible: true,
                    borderVisible: false
                },
                grid: {
                    vertLines: {
                        visible: false,
                    }
                },
                width: 600,
                height: 300
            })
            const newSeries = chart.current.addAreaSeries({
                lineColor: "#2962ff",
                topColor: "#2962ff",
                bottomColor: "rgba(41, 98, 255, 0.0)"
            })
            newSeries.setData(data)
            if (!hasAppliedTimeScaleOptions) {
                chart.current.timeScale().applyOptions({
                    barSpacing: 80,
                });
                setHasAppliedTimeScaleOptions(true);
            }

            return () => [chart.current.remove()]
        }
    }, [data])

    return <article>
        <h1>Dólar estadounidense a Peso colombiano</h1>
        <p>{data.length == 0 ? "Loading..." : data[data.length - 1].value}</p>
        <div className='chart-container' ref={chartContainerRef}></div>
    </article>
}