import { 
	queryContract as query, 
	addContract as add, 
	editContract as edit, 
	throwContract as del, 
	queryContractById as queryById,
	unThrowContract,
	queryRoomByContract,
	addEnergy
} from '../services/contract'
import {
	message,
	Modal
} from 'antd';

export default {
	namespace: 'contract',
	state: {
		areaId: '',
		records: [],
		total: 0,
		size: 10,
		current: 1,
		pages: 0,
		data: null,
		water: [],
		power: []
	},
	effects: {
		*fetch({ payload }, { call, put, select }) {
			const { current, size, areaId } = yield select(state => state.contract);
			const response = yield call(query, { current, size, areaId, ...payload });
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			yield put({
				type: 'save',
				payload: {
					...response.data,
					areaId: payload.areaId
				}
			});
		},
		*fetchById({ payload, callback }, { call, put, select }) {
			const response = yield call(queryById, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			callback && callback(response.data);
			yield put({
				type: 'save',
				payload: {
					...response
				}
			});
		},
		*edit({ payload, oper, callback }, { call, put, select }) {
			const map = {
					'throw': {
						fn: del,
						msg: '退租成功',
						param: payload
					},
					'add': {
							fn: add,
							msg: '添加成功',
							param: payload
					},
					'edit': {
							fn: edit,
							msg: '编辑成功',
							param: payload
					}
			}
			const response = yield call( map[oper].fn, map[oper].param );
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			message.success(map[oper].msg);
			callback && callback();
			const { current, areaId } = yield select(state => state.contract);
			yield put({
					type: 'fetch',
					payload: { current, areaId, valid: 1 }
			});
		},
		*unThrow({ payload, callback }, { call }) {
			const response = yield call(unThrowContract, payload);
			if( typeof response === 'undefined') return;
			if(response.code === 1001) {
				return Modal.error({
					title: '撤销失败',
					content: '合同中有房间已经出租',
					cancelText: '知道了'
				});
			} else if(response.code === 1000) {
				message.success('操作成功');
			}
			callback && callback();
		},
		*fetchRoomByContract({payload, name, callback}, {call,put}) {
			const service = queryRoomByContract(name);
			const response = yield call(service, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) return;
			callback && callback(name, response.data)
			yield put({
				type: 'save',
				payload: { 
					[name]: response.data
				}
		});
		},
		*addEnergy({payload, callback}, {call}) {
			const hide = message.loading('录入中,请稍候', 0);
			const response = yield call(addEnergy, payload);
			if( typeof response === 'undefined' || response.code !== 1000 ) {
				hide();
				return message.error('补录失败');
			} 
			callback && callback(hide);
		}
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