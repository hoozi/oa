import { queryRole, queryRoleList, deleteRole, editRole, addRole, queryTree } from '../services/api'
import { message } from 'antd';


export default {
    namespace: 'role',
    state: {
        list: [],
        total: 0,
        current: 1,
        tree: [],
        size: 999
    },
    effects: {
        *fetch({ payload, callback }, { call, put, select }) {
            let { current, size } = yield select(state=>state.role);
            let response = yield call(queryRole, { current, size, ...payload });
            if(typeof response !=='undefined' && response.code === 1000) {
                yield put({
                    type: 'save',
                    payload: {
                        list: response.data.records,
                        total: response.data.total
                    }
                });
                callback && callback(response.data.records)
            }
        },
        *fetchList({ payload, callback }, { call, put }) {
            let response = yield call(queryRoleList, { ...payload });
            if(typeof response !=='undefined' && response.code === 1000) {
                yield put({
                    type: 'save',
                    payload: {
                        list: response.data
                    }
                });
                callback && callback(response.data)
            }
        },
        *cud({ payload, operateName, callback }, { call, put, select }) {
            const callBackMap = {
                'delete': {
                    operateFn: deleteRole,
                    msg: '删除成功',
                    param: payload.id
                },
                'add': {
                    operateFn: addRole,
                    msg: '新增成功',
                    param: payload
                },
                'edit': {
                    operateFn: editRole,
                    msg: '修改成功',
                    param: payload
                }
            }
            const response = yield call( callBackMap[operateName].operateFn, callBackMap[operateName].param );
          
            if(typeof response==='undefined' ) return; // http status error
            if(response.code !== 1000) return;
            message.success(callBackMap[operateName].msg)
            const current = yield select(state => state.role.current);
            callback && callback()
        },
        *fetchTree(_, { call, put }) {
            const response = yield call(queryTree);
            yield put({
                type: 'saveTree',
                payload: {
                    tree: response.data
                }
            })
        }
        
    },
    reducers: {
        save(state, { payload: { list, total } }) {
            return {
                ...state,
                list,
                total
            }
        },
        saveTree(state, { payload: { tree } }) {
            return {
                ...state,
                tree
            }
        }
    }
}