import axios from 'axios';
import {Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {TemplatingCandle} from '../charts';
import {AllConfigType} from '../config';

export interface TickerRequestParams {
    symbol: string;
    interval: string;
}

@Injectable()
export class BinanceService {
    private readonly logger = new Logger(BinanceService.name);
    private readonly candlesCapture: number;
    //approximate map for 10 candles
    private readonly INTERVAL_WINDOW_MAP = {
        '15m': 3,
        '1h': 10,
        '4h': 40
    };

    constructor(private readonly configService: ConfigService<AllConfigType>) {
        this.candlesCapture = this.configService.get('app.candlesCapture', {
            infer: true
        });
    }

    getTimeWithPreferredShift = (interval: string): number => {
        const timeNow = new Date();
        const shift = this.INTERVAL_WINDOW_MAP[interval];
        if (!shift) {
            throw new Error(`interval has no shift ${interval}`);
        }
        timeNow.setHours(timeNow.getHours() - shift * this.candlesCapture);
        return timeNow.getTime();
    };

    async getTickerCandles({symbol, interval}: TickerRequestParams) {
        try {
            const startTime = this.getTimeWithPreferredShift(interval);
            const {data} = await axios.get(
                `https://fapi.binance.com/fapi/v1/indexPriceKlines?pair=${symbol}&interval=${interval}&startTime=${startTime}`
            );

            return data;
        } catch (e) {
            this.logger.error(`error while fetching ${symbol} ${interval}: ${e.message}`);
            throw new InternalServerErrorException(e);
        }
    }

    /*
  [
  [
    1591256400000,          // Open time
    "9653.69440000",        // Open
    "9653.69640000",        // High
    "9651.38600000",        // Low
    "9651.55200000",        // Close (or latest price)
    "0  ",                  // Ignore
    1591256459999,          // Close time
    "0",                    // Ignore
    60,                     // Ignore
    "0",                    // Ignore
    "0",                    // Ignore
    "0"                     // Ignore
  ]
  ]

  expected
  {
        time: { year: 2018, month: 9, day: 23 },
        open: 32.267626500691215,
        high: 34.452661663723774,
        low: 26.096868360824704,
        close: 29.573918833457004,
      }
   */
    historicalToTemplatingFormat = (candles: number[][]): TemplatingCandle[] => {
        return candles.map((el) => {
            if (el.length < 5) {
                throw new InternalServerErrorException(
                    `malformed data provided ${JSON.stringify(candles)}`
                );
            }
            const [openTime, open, high, low, close] = el;

            return {
                time: openTime,
                open,
                close,
                high,
                low
            };
        });
    };
}
