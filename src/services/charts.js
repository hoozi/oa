import { stringify } from 'qs';
import request from '../utils/request';

export async function querySizeStats() {
  return request(`/api/room/stats`);
}
export async function queryContarctCountStats(params) {
  return request(`/api/contract/count?${stringify(params)}`);
}
export async function queryContarctRent(params) {
  return request(`/api/contract/rent?${stringify(params)}`)
}

export async function queryStatsEA(param) {
  return request(`/api/stats/electric/all?${stringify(param)}`);
}
export async function queryStatsWA(param) {
  return request(`/api/stats/water/all?${stringify(param)}`);
}