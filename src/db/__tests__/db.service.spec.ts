import * as fsp from 'fs/promises';
import {Test} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {DatabaseService} from '../db.service';
import {KangarooEvents} from '../../admin/main-hook-payload.dto';

const dbPath = './test.sqlite3';

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sliceTo = (arr: unknown[], to: number) => arr.slice(arr.length - to, arr.length);

const expectifyObject = (o) => expect.objectContaining(o);

describe('DatabaseService', () => {
    let app: INestApplication;
    let dbService: DatabaseService;
    const start = new Date().getTime();

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forFeature(async () => ({
                    'app.dbPath': dbPath
                }))
            ],
            providers: [DatabaseService]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        dbService = app.get(DatabaseService);
    });

    describe('write', () => {
        beforeEach(async () => {
            await fsp.unlink(dbPath);
            await dbService.onModuleInit();
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        test('add entries', async () => {
            const records = {
                [KangarooEvents.KangarooShort]: {
                    BTCUSDT: {
                        '15m': [],
                        '1h': [],
                        '4h': []
                    },
                    ETHUSDT: {
                        '15m': [],
                        '1h': [],
                        '4h': []
                    }
                },
                [KangarooEvents.KangarooLong]: {
                    BTCUSDT: {
                        '15m': [],
                        '1h': [],
                        '4h': []
                    },
                    ETHUSDT: {
                        '15m': [],
                        '1h': [],
                        '4h': []
                    }
                }
            };

            const promises = [];
            for (const timeframe of ['15m', '1h', '4h']) {
                for (const event of [KangarooEvents.KangarooShort, KangarooEvents.KangarooLong]) {
                    for (const ticker of ['BTCUSDT', 'ETHUSDT']) {
                        const now = new Date().getTime();
                        promises.push(
                            ...Array.from(Array(100 + 1).keys())
                                .slice(1)
                                .map((el) => {
                                    const record = {
                                        time: now + el,
                                        open: randomInteger(1, 1000),
                                        high: randomInteger(1, 1000),
                                        low: randomInteger(1, 1000),
                                        close: randomInteger(1, 1000),
                                        event,
                                        timeframe,
                                        ticker
                                    };
                                    records[event][ticker][timeframe].push(record);
                                    return dbService.addEvent1Record(record);
                                })
                        );
                    }
                }
            }
            await Promise.all(promises);

            const to = start + 1000000;
            for (const timeframe of ['15m', '1h', '4h']) {
                const btcShort = await dbService.getRecords({
                    from: start,
                    to,
                    event: KangarooEvents.KangarooShort,
                    ticker: 'BTCUSDT',
                    timeframe
                });

                const ethShort = await dbService.getRecords({
                    from: start,
                    to,
                    event: KangarooEvents.KangarooShort,
                    ticker: 'ETHUSDT',
                    timeframe
                });

                const btcLong = await dbService.getRecords({
                    from: start,
                    to,
                    event: KangarooEvents.KangarooLong,
                    ticker: 'BTCUSDT',
                    timeframe
                });

                const ethLong = await dbService.getRecords({
                    from: start,
                    to,
                    event: KangarooEvents.KangarooLong,
                    ticker: 'ETHUSDT',
                    timeframe
                });

                expect(btcShort).toEqual(
                    expect.arrayContaining(
                        records[KangarooEvents.KangarooShort]['BTCUSDT'][timeframe].map(
                            expectifyObject
                        )
                    )
                );
                expect(ethShort).toEqual(
                    expect.arrayContaining(
                        records[KangarooEvents.KangarooShort]['ETHUSDT'][timeframe].map(
                            expectifyObject
                        )
                    )
                );
                expect(btcLong).toEqual(
                    expect.arrayContaining(
                        records[KangarooEvents.KangarooLong]['BTCUSDT'][timeframe].map(
                            expectifyObject
                        )
                    )
                );
                expect(ethLong).toEqual(
                    expect.arrayContaining(
                        records[KangarooEvents.KangarooLong]['ETHUSDT'][timeframe].map(
                            expectifyObject
                        )
                    )
                );
            }
        });
    });

    test('deletes entries', async () => {
        const records = {
            [KangarooEvents.KangarooShort]: {
                BTCUSDT: {
                    '15m': [],
                    '1h': [],
                    '4h': []
                },
                ETHUSDT: {
                    '15m': [],
                    '1h': [],
                    '4h': []
                }
            },
            [KangarooEvents.KangarooLong]: {
                BTCUSDT: {
                    '15m': [],
                    '1h': [],
                    '4h': []
                },
                ETHUSDT: {
                    '15m': [],
                    '1h': [],
                    '4h': []
                }
            }
        };

        const promises = [];
        for (const timeframe of ['15m', '1h', '4h']) {
            for (const event of [KangarooEvents.KangarooShort, KangarooEvents.KangarooLong]) {
                for (const ticker of ['BTCUSDT', 'ETHUSDT']) {
                    const now = new Date().getTime();
                    promises.push(
                        ...Array.from(Array(randomInteger(100, 300) + 1).keys())
                            .slice(1)
                            .map((el) => {
                                const record = {
                                    time: now + el,
                                    open: randomInteger(1, 1000),
                                    high: randomInteger(1, 1000),
                                    low: randomInteger(1, 1000),
                                    close: randomInteger(1, 1000),
                                    event,
                                    timeframe,
                                    ticker
                                };
                                records[event][ticker][timeframe].push(record);
                                return dbService.addEvent1Record(record);
                            })
                    );
                }
            }
        }
        await Promise.all(promises);

        const to = start + 10000000;
        for (const timeframe of ['15m', '1h', '4h']) {
            await dbService.deleteOldEvent1Records({
                event: KangarooEvents.KangarooShort,
                ticker: 'BTCUSDT',
                timeframe
            });
            const btcShort = await dbService.getRecords({
                from: start,
                to,
                event: KangarooEvents.KangarooShort,
                ticker: 'BTCUSDT',
                timeframe
            });

            await dbService.deleteOldEvent1Records({
                event: KangarooEvents.KangarooShort,
                ticker: 'ETHUSDT',
                timeframe
            });
            const ethShort = await dbService.getRecords({
                from: start,
                to,
                event: KangarooEvents.KangarooShort,
                ticker: 'ETHUSDT',
                timeframe
            });

            await dbService.deleteOldEvent1Records({
                event: KangarooEvents.KangarooLong,
                ticker: 'BTCUSDT',
                timeframe
            });
            const btcLong = await dbService.getRecords({
                from: start,
                to,
                event: KangarooEvents.KangarooLong,
                ticker: 'BTCUSDT',
                timeframe
            });

            await dbService.deleteOldEvent1Records({
                event: KangarooEvents.KangarooLong,
                ticker: 'ETHUSDT',
                timeframe
            });
            const ethLong = await dbService.getRecords({
                from: start,
                to,
                event: KangarooEvents.KangarooLong,
                ticker: 'ETHUSDT',
                timeframe
            });

            expect(btcShort).toEqual(
                expect.arrayContaining(
                    sliceTo(records[KangarooEvents.KangarooShort]['BTCUSDT'][timeframe], 100).map(
                        expectifyObject
                    )
                )
            );
            expect(ethShort).toEqual(
                sliceTo(records[KangarooEvents.KangarooShort]['ETHUSDT'][timeframe], 100).map(
                    expectifyObject
                )
            );
            expect(btcLong).toEqual(
                sliceTo(records[KangarooEvents.KangarooLong]['BTCUSDT'][timeframe], 100).map(
                    expectifyObject
                )
            );
            expect(ethLong).toEqual(
                sliceTo(records[KangarooEvents.KangarooLong]['ETHUSDT'][timeframe], 100).map(
                    expectifyObject
                )
            );
        }
    });
});
