import { queryCustom,  deleteCustom, addCustom, editCustom, checkNameUnique } from '../services/custom';
import { message } from 'antd';

export default {
    namespace: 'custom',
    state: {
      records: [],
      total: 0,
      current: 1,
      size: 10
    },
    effects: {
      *fetchCustom({ payload }, { call, put, select }) {
        const { current, size } = yield select(state=>state.custom);
        const customs = yield call( queryCustom, {current, size, ...payload});
        if( typeof response === 'undefined' || response.code !== 1000 ) return;
        yield put({
            type: 'query',
            payload: {
              ...response
            }
        })
      },
    },
    reducers: {
      save(state, { payload }) {
				return {
						...state,
						...payload
				}
		  }
    }
}