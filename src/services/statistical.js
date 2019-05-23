import { stringify } from 'qs';
import request from '../utils/request';

export async function queryStatsA(param) {
  return request(`/api/stats/water/office?${stringify(param)}`);
}
export async function queryStatsAC(param) {
  return request(`/api/stats/electric/office?${stringify(param)}`);
}
export async function queryStatsAB(param) {
  return request(`/api/stats/electric/public?${stringify(param)}`);
}
export async function queryStatsWW(param) {
  return request(`/api/stats/water/ware?${stringify(param)}`);
}
export async function queryStatsWE(param) {
  return request(`/api/stats/electric/ware?${stringify(param)}`);
}

/* export async function queryStatsA(param) {
  return request(`/api/electric/set/custom/${param}`);
}
export async function queryStatsA(param) {
  return request(`/api/electric/set/custom/${param}`);
} */