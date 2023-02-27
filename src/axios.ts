import axios, { AxiosInstance } from 'axios';
import http from 'node:http';
import https from 'node:https';

export class AxiosInstanceClass {
  private static instance: AxiosInstance;

  public static getInstance(): AxiosInstance {
    if (!AxiosInstanceClass.instance) {
      const httpAgent = new http.Agent({
        keepAlive: true,
        timeout: 60000,
        scheduling: 'fifo',
      });
      const httpsAgent = new https.Agent({
        keepAlive: true,
        timeout: 60000,
        scheduling: 'fifo',
      });
      AxiosInstanceClass.instance = axios.create({
        httpAgent,
        httpsAgent,
      });
    }

    return AxiosInstanceClass.instance;
  }
}
