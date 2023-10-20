import React, { useState, useEffect, useRef } from 'react';
import { ColorType, createChart } from 'lightweight-charts';
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";
import io from "socket.io-client";
import axios from 'axios';

const socket = io("https://api-node-motor-finaciero-production.up.railway.app/");

export default function DolarChart() {
    const chartContainerRef = useRef()
    const chart = useRef()
    const [data, setData] = useState([])
    const [barSpacing, setBarSpacing] = useState(80)
    const [goingUp, setGoingUp] = useState(false)
    const [changeValue, setChange] = useState(0.0)
    const [changePercentageValue, setChangePercentage] = useState(0.0)

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

            // Encuentra el valor del día anterior
            let yesterday = Math.floor((new Date(Date.now() - 24 * 60 * 60 * 1000).setUTCHours(0, 0, 0, 0)) / 1000);

            let yesterdayValue = data.find(d => d.time === yesterday).value

            let change = data[data.length - 1].value - yesterdayValue;
            setChange(change)
            setChangePercentage((change / yesterdayValue) * 100);

            setGoingUp(data[data.length - 1].value >= yesterdayValue)

            let lineColor = data[data.length - 1].value >= yesterdayValue ? '#34a853' : '#ea4335';

            const newSeries = chart.current.addAreaSeries({
                lineColor: lineColor,
                topColor: lineColor,
                bottomColor: "rgba(255, 255, 255, 0)"
            })
            newSeries.setData(data)

            chart.current.timeScale().subscribeVisibleTimeRangeChange(() => {
                const visibleLogicalRange = chart.current.timeScale().getVisibleLogicalRange();
                if (visibleLogicalRange) {
                    const newBarSpacing = chart.current.timeScale().width() / (visibleLogicalRange.to - visibleLogicalRange.from);
                    setBarSpacing(newBarSpacing);
                }
            });

            chart.current.timeScale().applyOptions({
                barSpacing: barSpacing,
            });


            return () => [chart.current.remove()]
        }
    }, [data])


    return <article>
        <h2>Dólar estadounidense a Peso colombiano</h2>
        <div className='article-flex'>
            <h3>{data.length == 0 ? "Loading..." : data[data.length - 1].value}</h3>
            <div className='article-flex__box'
                style={{
                    color: goingUp ? "#137333" : "#a50e0e",
                    background: goingUp ? "rgba(47, 205, 47, 0.17)" : "rgba(205, 47, 47, 0.17)"
                }}>
                {goingUp ? <BsArrowUpShort className='box__icon' /> : <BsArrowDownShort className='box__icon' />}
                <p>{Math.abs(changePercentageValue).toFixed(2)} %</p>
            </div>
        </div>
        <p>{getTimeToday()} GMT-0500 (hora estándar de Colombia)</p>
        <div className='chart-container' ref={chartContainerRef}></div>
    </article>
}

function getTimeToday() {
    let date = new Date(Date.now())
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()} ${date.toLocaleTimeString()}`
}
