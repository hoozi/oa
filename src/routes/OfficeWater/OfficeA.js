import React from 'react';
import { connect } from 'dva';
import BasicWater from './BasicWater';

const OfficeA = connect(({ energy, loading, global }) => ({
  energy,
  global,
  loading: loading.models.energy,
  submitting: loading.effects['energy/enterOffice']
}))(BasicWater('A', function({ InputNumber,Checkbox,Tag }){
  return [
    {
      title: '房间号',
      width: '15%',
      dataIndex: 'roomName',
      render: (value) => value ? value : '-'
    },
    {
      title: '本月度数',
      dataIndex: 'degree',
      width: '10%',
      render: (value, row, index) => <InputNumber key={row.rid+Date.now()} onChange={ e => this.handleFieldChange(e, 'degree', row.rid) } step='10' min={0} autoFocus={index==0} defaultValue={value} style={{width: '100%'}}/>
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
      render: (value, row, index) => <Checkbox key={row.rid} tabIndex='-1' onChange={ e => this.handleFieldChange(e, 'flag', row.rid) } defaultChecked={value}/>
    },
    {
      title: '出租状态',
      width: '20%',
      dataIndex: 'isRented',
      render: value => {
        const rentedTexts = ['未出租', '已出租'];
        const rentedColors = ['green', 'orange'];
        return <Tag color={rentedColors[value]}>{rentedTexts[value]}</Tag>
      }
    }
  ];
}));

export default OfficeA;

