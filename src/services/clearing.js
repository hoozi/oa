import { stringify } from 'qs';
import request from '../utils/request';

export async function queryClearing(param) {
  return request(`/api/balance/record?${stringify(param)}`);
}

export async function queryWaterDetail(params) {
  return request(`/api/waterDetail?${stringify(params)}`)
}
export async function queryPowerDetail(params) {
  return request(`/api/powerDetail?${stringify(params)}`)
}
