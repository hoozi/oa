import React from 'react';
import { connect } from 'dva';
import BasicWater from './BasicWater';

const Phase2 = connect(({ energy, loading, global }) => ({
  energy,
  global,
  loading: loading.models.energy,
  submitting: loading.effects['energy/enterPhase2']
}))(BasicWater('phase2', function({ InputNumber,Checkbox,Tag }){
  return [
    {
      title: '名称',
      dataIndex: 'companyName'
    },
    {
      title: '位置',
      dataIndex: 'position'
    },
    {
      title: '本月度数',
      dataIndex: 'degree',
      render: (value, row, index) => <InputNumber key={row.nid+Date.now()} onChange={ e => this.handleFieldChange(e, 'degree', row.nid) } step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
    },
    {
      title: '上月度数',
      dataIndex: 'lastDegree'
    },
    {
      title: '实用数(吨)',
      dataIndex: 'useDegree'
    },
    {
      title: '本月未抄',
      dataIndex: 'flag',
      render: (value, row, index) => <Checkbox key={row.nid} tabIndex='-1' onChange={ e => this.handleFieldChange(e, 'flag', row.nid) } defaultChecked={value}/>
    },
    {
      title: '备注',
      dataIndex: 'name',
      render: (value, row) => row.floorName ? `${value}(${row.floorName})` : `${value}`
    }
  ];
}));

export default Phase2;

