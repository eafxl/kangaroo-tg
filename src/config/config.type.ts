export type AppConfig = {
    nodeEnv: string;
    name: string;
    workingDirectory: string;
    port: number;
    apiPrefix: string;
    webhookSecret: string;
    emailDestinations: string[];
    whiteListIps: string[];
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
