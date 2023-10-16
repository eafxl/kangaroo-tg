import {TemplatingCandle} from '../charts';
import {KangarooEvents} from '../admin/main-hook-payload.dto';

export interface SignalRecord extends TemplatingCandle {
    event: KangarooEvents;
    ticker: string;
    timeframe: string;
}

export interface DeleteRecords {
    event: KangarooEvents;
    ticker: string;
    timeframe: string;
}

export interface GetRecords extends DeleteRecords {
    from: number;
    to: number;
}
