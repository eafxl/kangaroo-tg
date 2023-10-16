import {Injectable, Logger} from '@nestjs/common';
import puppeteer from 'puppeteer';
import {chromium} from 'playwright';
import {ConfigService} from '@nestjs/config';
import {AllConfigType, PUPPEETER_CONFIG} from '../config';
import {RenderOptions} from './types';

@Injectable()
export class RenderService {
    private readonly logger = new Logger(RenderService.name);
    private readonly copyUrlAttempts: number;

    constructor(private readonly configService: ConfigService<AllConfigType>) {
        this.copyUrlAttempts = this.configService.get('app.copyUrlAttempts', {
            infer: true
        });
    }

    async renderToBuffer(html: string, width: number, height: number): Promise<Buffer> {
        let screenShot: Buffer | PromiseLike<Buffer>;
        const browser = await puppeteer.launch({headless: true, args: PUPPEETER_CONFIG});
        try {
            const page = await browser.newPage();
            await page.setViewport({width, height});
            await page.setContent(html, {waitUntil: 'networkidle0'});

            screenShot = await page.screenshot();
        } catch (e) {
            this.logger.error(`error while taking a screen shot ${JSON.stringify(e)}`);
        } finally {
            await browser.close();
        }

        return screenShot;
    }

    async renderUrlToBuffer({
        delay,
        width,
        height,
        url,
        sessionId
    }: RenderOptions): Promise<string> {
        let screenShot: string;
        let browser;
        try {
            const {host, origin} = new URL(url);
            browser = await chromium.launch({
                headless: true
            });

            const context = await browser.newContext();
            await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
                origin
            });

            await context.addCookies([
                {
                    name: 'sessionid',
                    value: sessionId,
                    domain: host,
                    path: '/'
                }
            ]);

            const page = await context.newPage();
            await page.setViewportSize({width, height});
            await page.goto(url, {waitUntil: 'load'});
            await new Promise((resolve) => setTimeout(() => resolve({}), delay));
            await page.evaluate("navigator.clipboard.writeText('')");

            for (let i = 0; i < this.copyUrlAttempts; i++) {
                if (screenShot) break;
                await page.keyboard.press('Alt+s');
                await new Promise((resolve) => setTimeout(() => resolve({}), 1000));
                screenShot = (await page.evaluate('navigator.clipboard.readText()')) as string;
            }
        } catch (e) {
            this.logger.error(`error while taking a screen shot ${e.message}`);
        } finally {
            await browser?.close();
        }

        return screenShot;
    }
}
