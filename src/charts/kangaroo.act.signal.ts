export interface TemplatingCandle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export const kangarooActSignalTemplate = `<!DOCTYPE html>
<!DOCTYPE html>
<html lang="en-US">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
    <title></title>
</head>
<body>
<script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
<script>

    const chart = LightweightCharts.createChart(
      document.body, {
        width: {{ width }},
        height: {{ height }},
        layout: {{{ layout }}},
        grid: {{{ grid }}}
      }
    );

    const series = chart.addCandlestickSeries({{{seriesConfig}}});
    const data = {{{ data }}};
    const markers = {{{ markers }}};
    series.setMarkers(markers);
    series.setData(data);
    chart.applyOptions({
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Hidden
      }
    });
    chart.timeScale().applyOptions({
      timeVisible: true
    });
    chart.priceScale().fitContent();
</script>
</body>`;
