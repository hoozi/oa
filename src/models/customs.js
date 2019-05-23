import { queryCustoms,  deleteCustom, addCustom, editCustom, checkNameUnique } from '../services/api';
import { message } from 'antd';

export default {
    namespace: 'customs',
    state: {
        customs: [],
        total: 0,
        current: 1,
        size: 10
    },
    effects: {
        *fetch({ payload }, { call, put, select }) {
            const { current, size } = yield select(state=>state.customs);
            const customs = yield call( queryCustoms, {current, size, ...payload});
            yield put({
                type: 'query',
                payload: {
                    customs: customs.data.records,
                    total: customs.data.total
                }
            })
        },
        *checkNameUnique({ callback, payload }, { call, put }) {
          
            const response = yield call( checkNameUnique, payload);
            if(typeof response !=='undefined' && response.code === 1) {
                callback && callback(true)
            } else {
                callback && callback(false)
            }
        },
        *editCustom({ payload, operateName }, { call, put, select }) {
            const callBackMap = {
                'deleteCustom': {
                    operateFn: deleteCustom,
                    msg: '删除成功',
                    param: payload.id
                },
                'addCustom': {
                    operateFn: addCustom,
                    msg: '新增成功',
                    param: payload
                },
                'editCustom': {
                    operateFn: editCustom,
                    msg: '修改成功',
                    param: payload
                }
            }
            const response = yield call( callBackMap[operateName].operateFn, callBackMap[operateName].param );
            if(typeof response==='undefined' ) return; // http status error
            if(response.code === 0) return;
            if(response.code===1000) {
                message.success(callBackMap[operateName].msg)
            }
            const current = yield select(state => state.customs.current);
            yield put({
                type: 'fetch',
                payload: { current }
            })
        }
    },
    reducers: {
        query(state, { payload: { customs, total }}) {
            return {
                ...state,
                customs,
                total
            }
        }
    }
}