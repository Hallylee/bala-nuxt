import axios from 'axios';
import { generateUUID } from '../common/util';

const SERVICE = process.env.SERVICE;

axios.defaults.headers['Content-Type'] = 'application/json; charset=utf-8';

const efetch = async (opt) => {
  const options = Object.assign({ dataType: 'json' }, opt);

  if (!options.url) {
    return;
  }

  options.type = options.type.toUpperCase() || 'POST';
  options.data = Object.assign({ requestId: generateUUID() }, options.data);

  for (const k in options.data) {
    if (options.data[k] === null || options.data[k] === undefined) {
      delete options.data[k];
    }
  }
  const result = await axios({
    method: options.type,
    url: options.url,
    params:
      options.type === 'GET' || options.type === 'DELETE' ? options.data : {},
    data: options.type === 'POST' || options.type === 'PUT' ? options.data : {},
    responseType: options.dataType || 'json',
    baseURL: options.baseURL || SERVICE
  });

  if (result.status !== 200) {
    const error = new Error(result.message);

    error.code = result.status;
    throw error;
  }

  // if (options.dataType === 'json' && result.data.code) {
  //   if (result.data.code !== '0' && result.data.code !== '404') {

  //   }

  //   if (result.data.code === '404') {
  //     result.data.data = null;
  //   }
  // }

  return result.data;
};

export default efetch;
