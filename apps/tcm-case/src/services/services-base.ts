// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { AxiosRequestConfig } from 'axios';
import { MethodEnum } from './types';

export const BASE_URL = 'http://localhost:8086';

class ServicesBase {
  constructor() {
    this.config = {
      url: '',
      method: MethodEnum.GET,
    };
  }

  private config: AxiosRequestConfig;

  public setConfig = (config: AxiosRequestConfig): void => {
    this.config = {
      ...this.config,
      ...config,
    };
  };

  public fetch = async (url: string, method: MethodEnum, params: any, config?: AxiosRequestConfig): Promise<any> => {
    const axiosConfig = {
      ...this.config,
      ...config,
      url,
      method,
    };
    if (axiosConfig.method === MethodEnum.GET) {
      axiosConfig.params = params;
    } else {
      axiosConfig.data = params;
    }
    try {
      const res = await axios(axiosConfig);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res.data;
    } catch (err) {
      console.error(err, '请求异常!');
      return {};
    }
  };

  public get = async (url: string, params: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.fetch(url, MethodEnum.GET, params, config);
  };

  public post = async (url: string, params: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.fetch(url, MethodEnum.POST, params, config);
  };

  public delete = async (url: string, params: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.fetch(url, MethodEnum.DELETE, params, config);
  };

  public put = async (url: string, params: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.fetch(url, MethodEnum.PUT, params, config);
  };

  public patch = async (url: string, params: any, config?: AxiosRequestConfig): Promise<any> => {
    return this.fetch(url, MethodEnum.PATCH, params, config);
  };
}

export const services = new ServicesBase();
