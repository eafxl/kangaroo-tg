import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import {Request, Response} from 'express';
import {ConfigService} from '@nestjs/config';
import {MailService} from '../mail';

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
    private readonly emailDestinations: string[];

    constructor(
        private readonly configService: ConfigService,
        private readonly mailService: MailService
    ) {
        this.emailDestinations = this.configService.get<unknown>('app.emailDestinations', {
            infer: true
        });
    }

    async catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = `error happened \nmessage: ${
            exception.message
        } \nstatus: ${status} \nrequest: ${JSON.stringify(request.body)}`;

        if (status !== HttpStatus.NOT_FOUND) {
            try {
                await this.mailService.logAndNotifyAll(message, 'unknownExceptionAlert');
            } catch (e) {
                this.logger.error(
                    `error on sending emails ${JSON.stringify(e)} emails ${this.emailDestinations}`
                );
            }
        }

        response.status(status).json({});
    }
}
