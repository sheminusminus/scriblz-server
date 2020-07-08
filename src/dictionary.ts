import axios, { AxiosInstance } from 'axios';


const instance: AxiosInstance = axios.create({
  baseURL: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/',
  timeout: 2000,
});

const API_KEY = process.env.WEBSTER_API_KEY;

export class Dictionary {
  static async lookup(word?: string) {
    if (word) {
      const response = await instance.request({
        url: `/${word}?key=${API_KEY}`,
        method: 'GET',
      });

      const { data } = response;

      if (data.find((d) => d.shortdef)) {
        return {
          isValid: true,
          data,
        };
      }

      return {
        isValid: false,
        data,
        error: false,
      };
    }

    return {
      isValid: false,
      data: [],
      error: true,
    };
  }
}
