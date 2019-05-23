import { stringify } from 'qs';
import request from '../utils/request';

export async function queryArea(param) {
  return request(`/api/area/?${stringify(param)}`);
}


