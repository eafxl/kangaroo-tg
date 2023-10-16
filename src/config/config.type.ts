export type AppConfig = {
    nodeEnv: string;
    name: string;
    workingDirectory: string;
    port: number;
    apiPrefix: string;
    webhookSecret: string;
    emailDestinations: string[];
    whiteListIps: string[];
    kangarooMainWidth: number;
    kangarooMainHeight: number;
    realPageLoadDelay: number;
    candlesCapture: number;
    sharedChartUrl15m: string;
    sharedChartUrl5m: string;
    sharedChartUrl1h: string;
    sharedChartUrl4h: string;
    copyUrlAttempts: number;
};

export type MailConfig = {
    user?: string;
    password?: string;
    defaultEmail?: string;
    defaultName?: string;
    service: string;
};

export type AllConfigType = {
    app: AppConfig;
    mail: MailConfig;
};
