import {TemplatingCandle} from '../charts/kangaroo.act.signal';
import {Marker} from '../binance/types';

export interface KangarooMainCtx {
    data: TemplatingCandle[];
    markers: Marker[];
    seriesConfig?: unknown;
    width?: number;
    height?: number;
    layout?: unknown;
    grid?: unknown;
}
