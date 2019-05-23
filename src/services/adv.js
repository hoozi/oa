import { stringify } from 'qs';
import request from '../utils/request';

export async function queryAdv(param) {
  return request(`/api/account/account?${stringify(param)}`);
}
export async function addAdv(param) {
  return request(`/api/account/account`, {
    method: 'POST',
    body: param
  });
}
export async function queryDetail(param) {
  return request(`/api/account/charge?${stringify(param)}`);
}
export async function querySurDetail(param) {
  return request(`/api/account/cost?${stringify(param)}`);
}

export async function advCost(param) {
  return request(`/api/account/charge`, {
    method: 'POST',
    body: param
  });
}
export async function advPay(param) {
  return request(`/api/account/cost`, {
    method: 'POST',
    body: param
  });
}