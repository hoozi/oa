
import React from 'react';
import { connect } from 'dva';
import BasicWater from './BasicWater';

const OfficeBusiness = connect(({ energy, loading, global }) => ({
  energy,
  global,
  loading: loading.models.energy,
  submitting: loading.effects['energy/enterOffice']
}))(BasicWater('business', function({ InputNumber,Checkbox  }){
  return [
    {
      title: '单位名称',
      dataIndex: 'companyName',
      render: (value) => value ? value : '-'
    },
    {
      title: '位置',
      dataIndex: 'position'
    },
    {
      title: '本月度数',
      dataIndex: 'degree',
      width: '10%',
      render: (value, row, index) => <InputNumber key={row.nid+Date.now()} onChange={ e => this.handleFieldChange(e, 'degree', row.nid) } step='10' min={0} autoFocus={index==0} defaultValue={row.flag ==1 ? row.lastDegree : value} style={{width: '100%'}}/>
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
      title: '是否更换',
      dataIndex: '',
      //render: (value, row, index) => <Checkbox key={row.nid} tabIndex='-1' onChange={ e => this.handleDegreeChange(e, 'flag', row.nid) } defaultChecked={value}/>
    },
    {
      title: '备注',
      dataIndex: 'name'
    }
  ];
}));

export default OfficeBusiness;