import Handlebars from 'handlebars';
import {Injectable} from '@nestjs/common';
import {kangarooActSignalTemplate} from '../charts';
import {
    KANGAROO_MAIN_DEFAULT_GRID_CONFIG,
    KANGAROO_MAIN_DEFAULT_LAYOUT,
    KANGAROO_MAIN_DEFAULT_SERIES_CONFIG
} from './constants';
import {KangarooMainCtx} from './types';

@Injectable()
export class TemplatingService {
    private readonly kangarooMainLayout = KANGAROO_MAIN_DEFAULT_LAYOUT;
    private readonly kangarooMainGrid = KANGAROO_MAIN_DEFAULT_GRID_CONFIG;
    private readonly defaultSeriesConfig = KANGAROO_MAIN_DEFAULT_SERIES_CONFIG;

    async templateKangaroo({
        markers,
        data,
        width,
        height,
        layout,
        grid,
        seriesConfig
    }: KangarooMainCtx): Promise<string> {
        const html = Handlebars.compile(kangarooActSignalTemplate, {
            strict: true
        })({
            markers: JSON.stringify(markers),
            data: JSON.stringify(data),
            width,
            height,
            layout: JSON.stringify(layout || this.kangarooMainLayout),
            grid: JSON.stringify(grid || this.kangarooMainGrid),
            seriesConfig: JSON.stringify(seriesConfig || this.defaultSeriesConfig)
        });

        return html;
    }
}
