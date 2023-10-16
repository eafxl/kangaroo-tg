import {KangarooEvents} from '../admin/main-hook-payload.dto';

export const EMOJI_MAPPING = {
    [KangarooEvents.KangarooLong]: '📈',
    [KangarooEvents.KangarooShort]: '📉',
    [KangarooEvents.KangarooIntraday]: '🔷',
    [KangarooEvents.KangarooScalp]: '🔹',
    [KangarooEvents.KangarooSwing]: '🔵',
    [KangarooEvents.KangarooLongTerm]: '🟦',
    logo: '🦘'
};
