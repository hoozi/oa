import React, { Component, Fragment } from 'react';
import { 
  Divider,
  Tag,
  Icon,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd'
import { connect } from 'dva';
import ContractBase from './ContractBase';
import moment from 'moment';

const columns = ( { handleChangeUpdateType, handleContractThrow, handleUnThrow, handleOpenDrawer } ) => {
  return [
    {
      title: '编号',
      dataIndex: 'code',
      width:70,
      sorter: true,
      render: (value, row) => <a href='javascript:;' onClick={() => handleOpenDrawer(true, row)}>{value}</a>
    },
    {
      title: '归档号',
      dataIndex: 'archiveNo',
      sorter: true,
      width: 120
    },
    {
      title: '单位名称',
      dataIndex: 'companyName',
      width:200
      //render: val => val.replace(/\s+$/, '')
    },
    {
      title: '法人',
      width: 60,
      dataIndex: 'renter',
      //render: val => val.replace(/\s+$/, '')
    },
    {
      title: '联系电话',
      dataIndex: 'tel',
      render: value => value ? value.replace(/^\s+/, '').replace(/\s+$/, '').split(' ').map(tel => <div key={tel}>{tel}</div>) : ''
    },
    {
      title: '房间号',
      dataIndex: 'roomsName',
      sorter: true
      //render: val => val.replace(/\s+$/, '')
    },
    {
      title: '间数',
      dataIndex: 'roomNum',
      width: 60,
      render: val => val || '0'
    },
    {
      title: '面积',
      dataIndex: 'roomsSize',
      needTotal: true,
      render: val => val ? `${val}` : '0'
    },
    {
      title: '租金',
      dataIndex: 'rent',
      render: val => `${val}`,
      needTotal: true
    },
    {
      title: '押金',
      dataIndex: 'deposit',
      render: val => `${val}`,
      needTotal: true
    },
    {
      dataIndex: 'endTime',
      title: '起止时间',
      sorter: true,
      width: 210,
      render: (value, row, index) => `${moment(row.startTime).format('YYYY-MM-DD')} ~ ${moment(row.endTime).format('YYYY-MM-DD')}`
    },
    {
      title: '操作',
      dataIndex: '',
      width: 55,
      render: (value, row, index) => {
        return (
          <Fragment>
            <a href='javascript:;' onClick={ () => { handleChangeUpdateType('edit', row) } }>管理</a>
            { row.valid === 1 ?
              <Fragment>
                <Popconfirm 
                  title={
                    <Fragment>
                      <b>{row.companyName}</b> 要退租吗
                    </Fragment>
                  } 
                  onConfirm={() => handleContractThrow(row.id)}
                >
                  <a style={{ color: '#f5222d' }} href='javascript:;'>退租</a>
                </Popconfirm>
              </Fragment> :
              <Fragment>
                <Popconfirm 
                  title={
                      <Fragment>
                        <b>{row.companyName}</b> 要撤销退租吗
                      </Fragment>
                    } 
                    onConfirm={() => handleUnThrow(row.id)}
                  >
                    <a style={{ color: '#f5222d', lineHeight: '16px', display:'block'  }} href='javascript:;'>撤销退租</a>
                </Popconfirm>
              </Fragment>
            }
          </Fragment>
        )
      }
    }
  ]
}

const ContractSupporting = ContractBase('supporting', { columns })(()=>{
  return null;
});
export default connect(({contract, loading, global}) => ({
  global,
  contract,
  loading: loading.models.contract,
  submitting: loading.effects['contract/edit'],
  energyLoading: loading.effects['contract/fetchRoomByContract']
}))(ContractSupporting);