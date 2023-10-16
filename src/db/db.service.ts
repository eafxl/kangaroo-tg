import fs from 'fs';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import sqlite3, {RunResult} from 'sqlite3';
import {DeleteRecords, GetRecords, SignalRecord} from './types';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private readonly tableName = 'signal1';
    private readonly path: string;
    private connection: sqlite3.Database;

    constructor(private readonly configService: ConfigService) {
        this.path = this.configService.get('app.dbPath', {
            infer: true
        });
    }

    async onModuleInit() {
        this.connection = await this.createDbConnection(this.path);
    }

    async deleteOldEvent1Records({
        event,
        ticker,
        timeframe
    }: DeleteRecords): Promise<RunResult | Error> {
        return new Promise((resolve, reject) => {
            this.connection.run(
                `
      DELETE FROM ${this.tableName} as t
      WHERE t.event = $event AND t.ticker = $ticker AND t.timeframe = $timeframe AND t.id NOT IN (
        SELECT id
        from ${this.tableName} as sub
        WHERE sub.event = $event AND sub.ticker = $ticker AND sub.timeframe = $timeframe
        ORDER BY sub.time DESC
        LIMIT 100
      )`,
                {$event: event, $ticker: ticker, $timeframe: timeframe},
                (result: RunResult, err?: Error) => {
                    const errored = result?.['errno'] ? result : err;
                    if (errored) {
                        reject(errored);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    async addEvent1Record({
        time,
        open,
        high,
        low,
        close,
        event,
        ticker,
        timeframe
    }: SignalRecord): Promise<RunResult | Error> {
        return new Promise((resolve, reject) => {
            this.connection.run(
                `INSERT INTO ${this.tableName} (time, open, high, low, close, event, ticker, timeframe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [time, open, high, low, close, event, ticker, timeframe],
                (result: RunResult, error?: Error) => {
                    const errored = result?.['errno'] ? result : error;
                    if (errored) {
                        reject(errored);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    async getRecords({from, to, event, ticker, timeframe}: GetRecords): Promise<SignalRecord[]> {
        return new Promise((resolve, reject) => {
            this.connection.all(
                `SELECT * from ${this.tableName} as t  WHERE event = ? AND ticker = ? AND timeframe = ? AND time BETWEEN ? AND ? ORDER BY t.time`,
                [event, ticker, timeframe, from, to],
                (err: Error, res: []) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                }
            );
        });
    }

    private async createDbConnection(filepath: string) {
        if (fs.existsSync(filepath)) {
            return new sqlite3.Database(filepath);
        } else {
            const db = new sqlite3.Database(filepath, (error) => {
                if (error) {
                    return console.error(error.message);
                }
                this.createTable(db);
            });
            console.log('Connection with SQLite has been established');
            return db;
        }
    }

    private createTable(db: sqlite3.Database) {
        return db.exec(`
      CREATE TABLE signal1
      (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        time INTEGER NOT NULL,
        open INTEGER NOT NULL,
        high INTEGER NOT NULL,
        low INTEGER NOT NULL,
        close INTEGER NOT NULL,
        event VARCHAR(100) NOT NULL,
        ticker VARCHAR(50) NOT NULL,
        timeframe VARCHAR(50) NOT NULL
      )
    `);
    }
}
