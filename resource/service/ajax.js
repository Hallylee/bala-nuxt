import axios from 'axios';
import { generateUUID, formatFullTime } from '../common/util';

const SERVICE = process.env.SERVICE;

axios.defaults.headers['Content-Type'] = 'application/json; charset=utf-8';

const ajax = async (opt) => {
  const options = Object.assign({ dataType: 'json', requestId: true }, opt);
  const defaultOptions = options.requestId ? { requestId: generateUUID() } : {};

  if (!options.url) {
    return;
  }

  options.type = options.type.toUpperCase() || 'POST';

  if (typeof options.data !== 'string') {
    options.data = Object.assign(defaultOptions, options.data);

    for (const k in options.data) {
      if (options.data[k] === null || options.data[k] === undefined) {
        delete options.data[k];
      }
    }
  }

  const resStartTime = Date.now();
  const result = await axios({
    method: options.type,
    url: options.url,
    params:
      options.type === 'GET' || options.type === 'DELETE' ? options.data : {},
    data: options.type === 'POST' || options.type === 'PUT' ? options.data : {},
    responseType: options.dataType || 'json',
    baseURL: options.baseURL || SERVICE,
    headers: options.headers || {}
  });
  const resEndTime = Date.now();

  if (process.server) {
    console.log(
      `Request URL: ${options.baseURL || SERVICE}${options.url}; Method: ${
        options.type
      }; Data: ${JSON.stringify(options.data)}; Time: ${resEndTime -
        resStartTime}ms`
    );
  }

  if (result.status !== 200) {
    const error = new Error(
      `Date: ${formatFullTime(new Date())}; URL: ${options.baseURL || SERVICE}${
        options.url
      }; Data: ${JSON.stringify(options.data)}; Method: ${
        options.type
      }; Status: ${result.result}`
    );

    error.code = result.status;
    throw error;
  }

  if (options.dataType === 'json' && result.data.code) {
    if (result.data.code !== '0' && result.data.code !== '404') {
      const error = new Error(
        `Date: ${formatFullTime(new Date())}; URL: ${options.baseURL ||
          SERVICE}${options.url}; Data: ${JSON.stringify(
          options.data
        )}; Method: ${options.type}; Code: ${result.data.code}; RequestId: ${
          options.data.requestId
        }; Message: ${result.data.message};`
      );

      error.code = result.data.code;
      throw error;
    }

    if (result.data.code === '404') {
      result.data.data = null;
    }
  }

  return result.data;
};

export default ajax;
