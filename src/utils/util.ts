import {KangarooEvents} from '../admin/main-hook-payload.dto';
import {Marker} from '../binance';
import {SignalRecord} from '../db';

export const tickerToSymbol = (ticker: string) => {
    return ticker.endsWith('.P') ? ticker.substring(0, ticker.length - 2) : ticker;
};

export const timeToTz = (originalTime: number) => {
    return (originalTime + new Date().getTimezoneOffset() * 60 * 1000) / 1000;
};

// {
//   time: data[data.length - 1].time,
//     position: 'belowBar', //aboveBar
//   color: '#56c473', // #ee4c43
//   shape: 'arrowUp', //arrowDown
//   text: '',
// }

export const candleToMarker = ({time, event}: SignalRecord): Marker => ({
    time: timeToTz(time),
    position: event === KangarooEvents.KangarooLong ? 'belowBar' : 'aboveBar',
    color: event === KangarooEvents.KangarooLong ? '#00ff3d' : '#ff0000',
    shape: event === KangarooEvents.KangarooLong ? 'arrowUp' : 'arrowDown',
    text: '',
    size: 2
});
