import { queryTree, deleteTree, addTree, editTree, queryTreeById  } from '../services/api'
import { message } from 'antd';


export default {
    namespace: 'resource',
    state: {
        tree: [],
        current: {}
    },
    effects: {
        *cud({ payload, operateName, callback }, { call }) {
            const callBackMap = {
                'delete': {
                    operateFn: deleteTree,
                    msg: '删除成功',
                    param: payload.id
                },
                'add': {
                    operateFn: addTree,
                    msg: '新增成功',
                    param: payload
                },
                'edit': {
                    operateFn: editTree,
                    msg: '修改成功',
                    param: payload
                }
            }
            const response = yield call( callBackMap[operateName].operateFn, callBackMap[operateName].param );
          
            if(typeof response==='undefined' ) return; // http status error
            if(response.code !== 1000) return;
            message.success(callBackMap[operateName].msg)
            callback && callback()
        },
        *fetchTree(_, { call, put }) {
            const response = yield call(queryTree);
            if(typeof response==='undefined' ) return; // http status error
            if(response.code !== 1000) return;
            yield put({
                type: 'save',
                payload: {
                    tree: response.data
                }
            })
        },
        *fetchTreeById({payload, callback}, { call, put }) {
            const response = yield call(queryTreeById, payload);
            if(typeof response==='undefined' ) return; // http status error
            if(response.code !== 1000) return;
            callback && callback(response.data)
        }
    },
    reducers: {
        save(state, {payload}) {
            return {
                ...state,
                ...payload
            }
        }
    }
}