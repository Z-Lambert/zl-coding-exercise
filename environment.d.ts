declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUNSET_URL: string;
      REQUEST_NUMBER: number;
    }
  }
}

export {};
