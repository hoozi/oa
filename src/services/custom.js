export async function queryCustom(params) {
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