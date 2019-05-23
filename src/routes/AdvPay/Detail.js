import React, {
  PureComponent,
  Fragment
} from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Table,
  Checkbox,
  Tag,
  Radio,
  Button,
  Input,
  Card
} from 'antd';
import { connect } from 'dva';
import SearchForm from './SearchForm';
import moment from 'moment';

const Search = Input.Search;

@connect(({ adv, global, loading }) => ({
  adv,
  global,
  floorFetch: loading.effects['global/fetchFloor'],
  areaFetch: loading.effects['global/fetchArea'],
  loading: loading.models.adv
}))
@Form.create() 
export default class Detail extends PureComponent {
  static contextTypes = {
    getArea: PropTypes.func,
    getFloors: PropTypes.func
  }
  state = {
    floor: '',
    areaId: '',
    valid: '',
    companyName: '',
    advStartDate: '',
    advEndDate: ''
  }
  componentWillMount() {
    this.getPage();
    this.context.getArea();
  }
  mergeSearchValues(value) {
    const mergeValues = {
      ...this.state,
      ...value
    }
    this.setState(mergeValues, ()=> {
      this.getPage({...mergeValues});
    })
  }
  getPage(payload) {
    const mergeValues = {
      current: 1,
      size: 15,
      ...this.state,
      ...payload
    }
    this.props.dispatch({
      type: 'adv/fetchDetail',
      payload: mergeValues
    })
  }
  /* this.context.getArea();
    this.context.getFloors(areaId) */
  handleTableChange = pagination => {
    const { current, pageSize: size } = pagination;
    this.getPage({ current, size })
  }
  handleAreaChange = areaId => {
    this.mergeSearchValues({areaId, floor:''});
    areaId && this.context.getFloors(areaId);
  }
  handleFloorChange = floor => {
    this.mergeSearchValues({floor});
  }
  handleValidChange = valid => {
    this.mergeSearchValues({valid});
  }
  handleDateRangeChange = date => {
    this.mergeSearchValues({
      advStartDate: date[0].format('YYYY-MM-DD'),
      advEndDate: date[1].format('YYYY-MM-DD')
    })
  }
  handleInputSearch = companyName => {
    this.mergeSearchValues({companyName});
  }
  render() {
    const { global: {floors, areas}, adv: {detailData:{records, current, total}}, loading, floorFetch, areaFetch } = this.props;
    const { areaId, floor } = this.state;
    const SearchFormProps = {
      floors,
      areas,
      floorFetch,
      areaFetch,
      areaId,
      floor,

      onAreaChange: this.handleAreaChange,
      onValidChange: this.handleValidChange,
      onFloorChange: this.handleFloorChange,
      onDateRangeChange: this.handleDateRangeChange,
      onInputSearch: this.handleInputSearch
    }
    const paginationProps = {
      pageSize: 15,
      current,
      total,
      showQuickJumper: true
    }
    const columns = [
      {
        title: '公司名称',
        dataIndex: 'companyName'
      },
      {
        title: '房间号',
        dataIndex: 'roomNumber',
        width: '19%',
        render: (value, row) => value && (row.areaId!=12 && row.areaId!=14) ? value.split(',').map((item,index)=><Tag key={`${item}-${row.id}`} style={{marginRight:2}}>{item}</Tag>) : value
      },
      {
        title: '预收金额',
        dataIndex: 'advance',
        render: value => <a href='javascript:;'>{value}元</a>
      },
      {
        title: '预收日期',
        dataIndex: 'advDate',
        render: value => moment(value).format('YYYY-MM-DD')
      },
      
      {
        title: '备注',
        dataIndex: 'remark'
      }
    ]
    return (
      <Fragment>
        <Card
          bordered={false}
          style={{
            marginBottom: 24
          }}
        >
          <SearchForm
            {...SearchFormProps}
          />
        </Card>
        <Card
          bordered={false}
          bodyStyle={{
            paddingTop: 80
          }}
        >
          <span style={{position:'absolute', right:32, top: 24}}>
            <Search 
              placeholder='输入单位名称，按回车搜索'
              onSearch={this.handleInputSearch} 
            style={{width:230}}/>
          </span>
          <Table
            bordered
            rowKey={row=>row.id}
            size='middle'
            columns={columns}
            dataSource={records}
            loading={loading}
            onChange={this.handleTableChange}
            pagination={paginationProps}
          />
        </Card>
      </Fragment>
    )
  }
}

