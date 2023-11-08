import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ColorType, createChart } from 'lightweight-charts';
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";

export default function OroChart() {
    const chartContainerRefP = useRef();
    const chartContainerRefS = useRef();
    const chartP = useRef();
    const chartS = useRef();
    const [dataP, setDataP] = useState([]);
    const [dataS, setDataS] = useState([]);
    const [goingUpP, setGoingUpP] = useState(false);
    const [goingUpS, setGoingUpS] = useState(false);
    const [changeValueP, setChangeP] = useState(0.0);
    const [changeValueS, setChangeS] = useState(0.0);
    const [changePercentageValueP, setChangePercentageP] = useState(0.0);
    const [changePercentageValueS, setChangePercentageS] = useState(0.0);

    useEffect(() => {
        axios.get("https://api-node-motor-finaciero-production.up.railway.app/api/micro/metales/colombia")
            .then((response) => {
                let apiData = response.data

                if (apiData != undefined) {
                    apiData.sort((a, b) => new Date(a.date) - new Date(b.date));

                    let TransformedDataP = apiData.map(g => {
                        return {
                            time: new Date(g.date).getTime() / 1000,
                            value: g.gold.purchase_price
                        };
                    });

                    let TransformedDataS = apiData.map(g => {
                        return {
                            time: new Date(g.date).getTime() / 1000,
                            value: g.gold.sales_price
                        };
                    });

                    setDataP(TransformedDataP);
                    setDataS(TransformedDataS);
                }
            });

    }, [])

    useEffect(() => {
        if (dataP.length > 0) {
            chartP.current = createChart(chartContainerRefP.current, {
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
                height: 300
            });

            let changeP = dataP[dataP.length - 1].value - dataP[dataP.length - 2].value;
            setChangeP(changeP.toFixed(4));
            setChangePercentageP((changeP / dataP[dataP.length - 2].value) * 100);

            setGoingUpP(dataP[dataP.length - 1].value >= dataP[dataP.length - 2].value);

            let lineColorP = dataP[dataP.length - 1].value >= dataP[dataP.length - 2].value ? '#34a853' : '#ea4335';

            const newSeriesP = chartP.current.addAreaSeries({
                lineColor: lineColorP,
                topColor: lineColorP,
                bottomColor: "rgba(255, 255, 255, 0)"
            });

            newSeriesP.setData(dataP);

            return () => [chartP.current.remove()];
        }
    }, [dataP]);

    useEffect(() => {
        if (dataS.length > 0) {
            chartS.current = createChart(chartContainerRefS.current, {
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
                height: 300
            });

            let changeS = dataS[dataS.length - 1].value - dataS[dataS.length - 2].value;
            setChangeS(changeS.toFixed(4));
            setChangePercentageS((changeS / dataS[dataS.length - 2].value) * 100);

            setGoingUpS(dataS[dataS.length - 1].value >= dataS[dataS.length - 2].value);

            let lineColorS = dataS[dataS.length - 1].value >= dataS[dataS.length - 2].value ? '#34a853' : '#ea4335';

            const newSeriesS = chartS.current.addAreaSeries({
                lineColor: lineColorS,
                topColor: lineColorS,
                bottomColor: "rgba(255, 255, 255, 0)"
            });

            newSeriesS.setData(dataS);

            return () => [chartS.current.remove()];
        }
    }, [dataS]);


    return <>
        <article className='chart'>
            <h2>Precio de compra</h2>
            <div className='chart-flex'>
                <h3>{dataP.length == 0 ? "Loading..." : dataP[dataP.length - 1].value.toFixed(4)}</h3>
                <div className='chart-flex__box'
                    style={{
                        color: goingUpP ? "#137333" : "#a50e0e",
                        background: goingUpP ? "rgba(47, 205, 47, 0.17)" : "rgba(205, 47, 47, 0.17)"
                    }}>
                    {goingUpP ? <BsArrowUpShort className='box__icon' /> : <BsArrowDownShort className='box__icon' />}
                    <p>{Math.abs(changePercentageValueP).toFixed(2)} %</p>
                </div>
                <p className='chart-changeValue' style={{ color: goingUpP ? "#137333" : "#a50e0e" }}>{changeValueP < 0 ? "" : "+"}{changeValueP}</p>
            </div>
            <p className='chart__time'>{dataP.length != 0 && new Date(dataP[dataP.length - 1].time * 1000).toUTCString()}</p>
            <div className='chart-container' ref={chartContainerRefP}></div>
        </article>
        <article className='chart'>
            <h2>Precio de venta</h2>
            <div className='chart-flex'>
                <h3>{dataS.length == 0 ? "Loading..." : dataS[dataS.length - 1].value.toFixed(4)}</h3>
                <div className='chart-flex__box'
                    style={{
                        color: goingUpS ? "#137333" : "#a50e0e",
                        background: goingUpS ? "rgba(47, 205, 47, 0.17)" : "rgba(205, 47, 47, 0.17)"
                    }}>
                    {goingUpS ? <BsArrowUpShort className='box__icon' /> : <BsArrowDownShort className='box__icon' />}
                    <p>{Math.abs(changePercentageValueS).toFixed(2)} %</p>
                </div>
                <p className='chart-changeValue' style={{ color: goingUpS ? "#137333" : "#a50e0e" }}>{changeValueS < 0 ? "" : "+"}{changeValueS}</p>
            </div>
            <p className='chart__time'>{dataS.length != 0 && new Date(dataS[dataS.length - 1].time * 1000).toUTCString()}</p>
            <div className='chart-container' ref={chartContainerRefS}></div>
        </article></>
}