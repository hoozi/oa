import React, { Fragment, PureComponent } from 'react';
import {
  Select,
  Spin,
  Input,
  DatePicker
} from 'antd';

const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const Search = Input.Search;

export default class SearchForm extends PureComponent {
  handleAreaChange = areaId => {
    this.props.onAreaChange && this.props.onAreaChange(areaId);
  }
  handleFloorChange = floorId => {
    this.props.onFloorChange && this.props.onFloorChange(floorId);
  }
  handleValidChange = valid => {
    this.props.onValidChange && this.props.onValidChange(valid);
  }
  handleDateRangeChange = date => {
    this.props.onDateRangeChange && this.props.onDateRangeChange(date);
  }
  handleInputSearch = accountName => {
    this.props.onInputSearch && this.props.onInputSearch(accountName)
  }
  render() {
    const { floorFetch, floors, areas, areaFetch, areaId, floor } = this.props;
    return (
      <Fragment>
        <span
          style={{marginRight:24}}
        >
          选择区块&nbsp;&nbsp;
          <Select 
            placeholder='不限' 
            style={{width:100}} 
            onChange={this.handleAreaChange}
            notFoundContent={ areaFetch ? <Spin size='small'/> : null }
          >
            <Option value=''>不限</Option>
            {
              areas.map(a => <Option key={a.id} value={a.id}>{a.area}</Option>)
            }
          </Select>
        </span>
        <span
          style={{marginRight:24}}
        >
          选择楼层&nbsp;&nbsp;
          <Select 
            value={areaId ? floor : ''}
            placeholder='不限' 
            style={{width:100}} 
            onChange={this.handleFloorChange}
            notFoundContent={ floorFetch ? <Spin size='small'/> : null }
          >
            <Option value=''>不限</Option>
            {
              areaId ? floors.map(f=><Option key={f.id} value={f.floor}>{f.name}</Option>) : ''
            }
          </Select>
        </span>
        <span
          style={{marginRight:24}}
        >
          单位状态&nbsp;&nbsp;
          <Select 
            placeholder='不限' 
            style={{width:100}} 
            onChange={this.handleValidChange}
            //notFoundContent={ floorsFetch ? <Spin size='small'/> : null }
          >
            <Option value='1'>未退租</Option>
            <Option value='0'>已退租</Option>
          </Select>
        </span>
        <span
          style={{marginRight:24}}
        >
          预收日期&nbsp;&nbsp;
          <RangePicker style={{width:220}} onChange={this.handleDateRangeChange}/>
        </span>
      </Fragment>
    )
  }
}