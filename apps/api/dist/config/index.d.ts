export declare const config: {
    readonly env: "development" | "production" | "test";
    readonly port: number;
    readonly frontendUrl: string;
    readonly apiUrl: string;
    readonly database: {
        readonly url: string;
    };
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiresIn: "15m";
        readonly refreshExpiresIn: "7d";
    };
    readonly liqpay: {
        readonly publicKey: string | undefined;
        readonly privateKey: string | undefined;
    };
    readonly s3: {
        readonly endpoint: string | undefined;
        readonly accessKey: string | undefined;
        readonly secretKey: string | undefined;
        readonly bucket: string | undefined;
        readonly publicUrl: string | undefined;
    };
    readonly smtp: {
        readonly host: string | undefined;
        readonly port: number | undefined;
        readonly user: string | undefined;
        readonly pass: string | undefined;
    };
    readonly rateLimit: {
        readonly authenticated: 100;
        readonly guest: 30;
        readonly windowMs: number;
    };
    readonly cache: {
        readonly categories: 3600;
        readonly productList: 300;
        readonly productDetail: 600;
        readonly session: 86400;
    };
};
export type Config = typeof config;
//# sourceMappingURL=index.d.ts.map