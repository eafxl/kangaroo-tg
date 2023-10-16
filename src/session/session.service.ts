import os from 'os';
import fs from 'fs';
import fsp from 'fs/promises';
import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';
import {TV_SIGNIN_URL, TVCOINS_URL} from './constants';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);
    private readonly username: string;
    private readonly password: string;
    private readonly sessionFile: string;
    private session: string;

    constructor(private readonly configService: ConfigService) {
        this.username = this.configService.get('app.tvUsername', {
            infer: true
        });

        this.password = this.configService.get('app.tvPassword', {
            infer: true
        });

        this.sessionFile =
            this.configService.get('app.workingDirectory', {
                infer: true
            }) + '/session_token';

        if (!fs.existsSync(this.sessionFile)) {
            fs.writeFileSync(this.sessionFile, 'null');
            this.session = 'null';
            this.logger.debug(`no session file found, null applied`);
        } else {
            this.session = fs.readFileSync(this.sessionFile).toString().split('\n')[0];
            this.logger.debug(`session loaded from file ${this.sessionFile}`);
        }
    }

    private async saveSessionToFile(token: string) {
        return fsp.writeFile(this.sessionFile, token);
    }

    async resolveSessionId() {
        try {
            const headers = {cookie: 'sessionid=' + this.session};
            const coinsResponse = await axios.get(TVCOINS_URL, {
                headers
            });

            if (coinsResponse.status === HttpStatus.OK) {
                return this.session;
            }
        } catch (e) {
            this.logger.debug(`error on session id check ${JSON.stringify(e)}, refreshing...`);
        }

        const formData = {
            username: this.username,
            password: this.password,
            remember: 'on'
        };

        const userAgent = `TWAPI/3.0 (${os.platform()}; ${os.version()}; ${os.release()})`;

        const loginHeaders = {
            origin: 'https://www.tradingview.com',
            'User-Agent': userAgent,
            'Content-Type': 'multipart/form-data',
            referer: 'https://www.tradingview.com'
        };

        this.logger.debug(`refresh headers ${JSON.stringify(loginHeaders)}`);

        const signinResponse = await axios.postForm(TV_SIGNIN_URL, formData, {
            headers: loginHeaders
        });

        const error = signinResponse?.data?.error;
        if (error) {
            throw new Error(JSON.stringify(error));
        }

        const sessionidSetCookie = signinResponse.headers['set-cookie'].find((el) =>
            el.startsWith('sessionid=')
        );
        const sessionid = sessionidSetCookie?.split(';')[0]?.split('=')?.[1];
        if (!sessionid) {
            throw new Error(
                `error while signing in TV ${signinResponse.status} ${signinResponse.data}`
            );
        }

        await this.saveSessionToFile(sessionid);
        this.session = sessionid;

        return sessionid;
    }
}
