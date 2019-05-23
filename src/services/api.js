import { stringify } from 'qs';
import request from '../utils/request';

// 自定义
export async function queryRole(params) {
  return request(`/api/role/rolePage?${stringify(params)}`);
}
export async function queryRoleList(params) {
  return request(`/api/role/roleList?${stringify(params)}`);
}
export async function addRole(params) {
  return request(`/api/role`, {
    method: 'POST',
    body: params
  });
}
export async function checkCodeUnique(params) {
  return request(`/api/role/check?roleCode=${params}`);
}
export async function deleteRole(params) {
  return request(`/api/role/${params}`, {
    method: 'DELETE'
  });
}
export async function editRole(params) {
  return request(`/api/role`, {
    method: 'PUT',
    body: params
  });
}

export async function addTree(params) {
  return request(`/api/menu`, {
    method: 'POST',
    body: params
  });
}
export async function deleteTree(params) {
  return request(`/api/menu/${params}`, {
    method: 'DELETE'
  });
}
export async function editTree(params) {
  return request(`/api/menu`, {
    method: 'PUT',
    body: params
  });
}

export async function queryTree() {
  return request(`/api/menu/tree`);
}
export async function queryTreeById(id) {
  return request(`/api/menu/${id}`);
}


export async function queryCustoms(params) {
  return request(`/api/user/userPage?${stringify(params)}`);
}

export async function checkNameUnique(params) {
  return request(`/api/user/check?username=${params}`);
}

export async function deleteCustom(params) {
  return request(`/api/user/${params}`, {
    method: 'DELETE'
  });
}

export async function addCustom(params) {
  return request('/api/user', {
    method: 'POST',
    body: params
  });
}

export async function editCustom(params) {
  return request('/api/user', {
    method: 'PUT',
    body: params
  });
}

export async function getRoleList() {
  return request('/api/role/roleList');
}

// pro mock
export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function accountLogin(params) {
  let body = stringify(params);
  return request(`/api/user/login?${body}`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}
