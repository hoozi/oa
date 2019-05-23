import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Select,
  Checkbox,
  Button,
  InputNumber,
  Input,
  DatePicker,
  Modal,
  Form,
  Spin,
  Alert,
  Table
} from 'antd';
import moment from 'moment';
import debounce from 'lodash/debounce';

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;
const MeterTypeMap = {
  'office': [
    {
      label: '写字楼公共',
      value: 'OP'
    },
    {
      label: '写字楼经营用房',
      value: 'OF'
    },
    {
      label: '仓库公共',
      value: 'WP'
    },
    {
      label: '仓库经营用房',
      value: 'WF'
    },
    {
      label: '二期公共',
      value: 'PP'
    },
    {
      label: '二期经营用房',
      value: 'PF'
    }
  ],
  'warehouse': [
    {
      label: '客户',
      value: 'WC'
    },
    {
      label: '公共水表',
      value: 'WP'
    },
    {
      label: '经营用房',
      value: 'WF'
    }
  ],
  'phase2': [
    /* {
      label: '公共水表',
      value: 'PP'
    }, */
    {
      label: '经营用房',
      value: 'PF'
    }
  ]
}

const Basic = areaType => {
  @Form.create()
  class BasicWaterMeter extends PureComponent {
    static contextTypes = {
      getFloors: PropTypes.func
    }
    constructor(props) {
      super(props);
      const meterType = MeterTypeMap[areaType][0]['value']
      this.state = { areaType, searchValues: { meterType, isDel:'0' }, modalVisible: false }
      this.row = [];
    }
    
    componentWillMount() {
      const { searchValues: { meterType } } = this.state;
      this.context.getFloors('10');
      this.getMeter({ meterType });
      meterType == 'PF' && this.getContract();
    }

    mergeSearchValues(value) {
      const { searchValues } = this.state;
      const mergeValues = {
        ...searchValues,
        ...value
      }
      this.setState({
        searchValues: mergeValues
      },()=> {
        this.getContract();
        this.getMeter({...mergeValues});
      })
    }

    getContract(payload) {
      const { searchValues: {meterType} } = this.state;
      const codeMap = {
        'OF': 'SO',
        'WF': 'SW',
        'PF': 'PT'
      }
      this.props.dispatch({
        type: 'contract/fetch',
        payload: {
          areaId: meterType == 'PF' ? 14 : 12,
          code: codeMap[meterType],
          ...payload
        }
      });
    }

    getMeter(payload) {
      const { dispatch } = this.props;
      const { searchValues } = this.state;
      const mergeValues = {
        current: 1,
        size: 15,
        ...searchValues,
        ...payload
      }
      dispatch({
        type: 'energy/fetchWaterMeter',
        meterType: searchValues.meterType,
        payload: mergeValues
      })
    }

    saveMeter(payload) {
      const { searchValues: {meterType} } = this.state;
      this.props.dispatch({
        type: 'energy/enterWaterMeter',
        payload: Array.isArray(payload) ? payload : [payload],
        meterType,
        callback: () => {
          this.handleModalVisible(false)
          this.getMeter();
        }
      })
    }

    handleChangeMeterType = meterType => {
      this.mergeSearchValues({meterType});
    }
    handleChangeDel = isDel => {
      this.mergeSearchValues({isDel})
    }
    handleChangeFloor = floorId => {
      this.mergeSearchValues({floorId})
    }
    handleSearchByName = companyName => {
      this.mergeSearchValues({companyName})
    }
    handleTableChange = pagination => {
      const { current, pageSize: size } = pagination;
      this.getMeter({ current, size })
    }
    handleModalVisible = flag => {
      this.setState({
        modalVisible: !!flag
      })
    }
    handleAddMeter = () => {
      const { form } = this.props;
      const { searchValues: {meterType} } = this.state;
      const mergeParamList = [];
      
      form.validateFields((err, fieldsValue) => {
        if(err) {
          if(meterType=='OP' || meterType == 'WP' || meterType == 'PP') {
            if(err.hasOwnProperty('name')) return;
          } else {
            if(err.hasOwnProperty('cid') || err.hasOwnProperty('meterNum')) return
          }
        };
        const { meterNum=0 } = fieldsValue;
        const mergeParam = {
          ...fieldsValue,
          meterType
        }
        
        for(let i=0; i<meterNum; i++) {
          mergeParamList.push(mergeParam)
        }
        
        this.saveMeter(meterNum >0 ? mergeParamList : mergeParam)
      })
    }
    handleFieldChange = (value, name, index) => {
      this.row[index][name] = name == 'isDel' || name == 'isWater' ? (value ? 1 : 0) : value;
    }
    handleSaveData = (e) => {
      e.preventDefault();
      this.saveMeter(this.row);
    }
    handleContractFilter = (companyName) => {
      this.getContract({companyName})
    }

    getColumns(meterType) {
      const colBaseMap = {
        'P': [
          {
            title: '名称',
            dataIndex: 'name'
          },
          {
            title: '启用日期',
            dataIndex: 'createTime',
            render: value =>  moment(value).format('YYYY-MM-DD')
          },
          {
            title: '停用',
            dataIndex: 'isDel',
            render: (value, row, index) => <Fragment><Checkbox defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'isDel', index)}/>{value?<span style={{color:'#fa541c'}}>{moment(row.delTime).format('YYYY-MM-DD')}</span>:''}</Fragment>
          }
        ],
        'F': [
          {
            title: '名称',
            dataIndex: 'companyName',
            render: (value, row) => value ? value : row.name
          },
          {
            title: '库号',
            dataIndex: 'position'
          },
          {
            title: '固定水费',
            dataIndex: 'fee',
            width: '10%',
            render: (value, row, index) => <InputNumber step='10' min={0} autoFocus={index==0} defaultValue={value} onChange={value => this.handleFieldChange(value, 'fee', index)} style={{width: '100%'}}/>
          },
          {
            title: '启用日期',
            dataIndex: 'createTime',
            width: '12%',
            render: value => <DatePicker defaultValue={ moment(value) } style={{width: '100%'}}/>
          },
          {
            title: '停用',
            dataIndex: 'isDel',
            width: '10%',
            render: (value, row, index) => <Fragment><Checkbox defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'isDel', index)}/>{value?<span style={{color:'#fa541c'}}>{moment(row.delTime).format('YYYY-MM-DD')}</span>:''}</Fragment>
          },
          {
            title: '合同起止',
            dataIndex: '',
            render: (value, row) => row.startTime ? `${moment(row.startTime).format('YYYY-MM-DD')} ~ ${moment(row.endTime).format('YYYY-MM-DD')}` : ''
          },
          {
            title: '备注',
            dataIndex: 'name',
            render: (value, row, index) => <Input defaultValue={value} onChange={e => this.handleFieldChange(e.target.value, 'name', index)} style={{width: '100%'}} />
          }
        ],
      }
      const colMap = {
        'OP': colBaseMap['P'],
        'OF': colBaseMap['F'],

        'WC': [
          {
            title: '名称',
            dataIndex: 'companyName'
          },
          {
            title: '房间号',
            dataIndex: 'roomName'
          },
          {
            title: '水表',
            dataIndex: 'isWater',
            render: (value, row, index) => <Checkbox defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'isWater', index)}/>
          }
        ],
        'WP': colBaseMap['P'],
        'WF': colBaseMap['F'],

        'PP': colBaseMap['P'],
        'PF': colBaseMap['F']
      }
      return colMap[meterType]
    }

    renderForm() {
      const { searchValues: {meterType, isDel}, areaType } = this.state;
      const { global: {floors} } = this.props;
      return (
        <Fragment>
          <span>
            类型&nbsp;&nbsp;
            <Select
              value={meterType}
              onChange={this.handleChangeMeterType}
              style={{ width: 120 }}
            >
              {
                MeterTypeMap[areaType].map(option => <Option key={option['value']} value={option['value']}>{option['label']}</Option>)
              }
            </Select>
          </span>
          {
            meterType == 'WC' ? 
            <Fragment>
              <span style={{marginLeft: 16}}>
                楼层&nbsp;&nbsp;
                <Select
                  placeholder='不限'
                  onChange={this.handleChangeFloor}
                  style={{ width: 120 }}
                >
                  <Option value=''>不限</Option>
                  {
                    floors.length >0 && floors.map(floor=><Option key={floor.id} value={floor.id}>{floor.name}</Option>) 
                  }
                </Select>
              </span>
              <span style={{marginLeft: 16}}>
                公司名称&nbsp;&nbsp;
                <Search
                  placeholder="请输入公司名称"
                  onSearch={this.handleSearchByName}
                  style={{width:320}}
                />
              </span>
            </Fragment> : 
            <span style={{marginLeft: 16}}>
              水表状态&nbsp;&nbsp;
              <Select
                value={isDel}
                onChange={this.handleChangeDel}
                style={{ width: 120 }}
              >
                <Option value='0'>未停用</Option>
                <Option value='1'>已停用</Option>
              </Select>
            </span>
          }
        </Fragment>
      )
    }
    renderTable() {
      const { searchValues: {meterType} } = this.state;
      const { energy: { records, current, total },  loading, submitting } = this.props;
      this.row = records.map(item=>({...item}));
      const paginationProps = {
        pageSize: 15,
        current,
        total,
        showQuickJumper: true
      }
      return (
        <Form onSubmit={this.handleSaveData}>
          <Table
            key={meterType}
            dataSource={records}
            size='middle'
            columns={ this.getColumns(meterType) }
            pagination={paginationProps}
            loading={loading}
            rowKey={(row, index)=>row.id ? row.id : index}
            bordered
            onChange={this.handleTableChange}
            footer={() => 
              <div style={{textAlign:'center'}}>
                <Button type='primary' htmlType='submit' onClick={this.handleSaveData} loading={submitting}>保存</Button>
                {
                  meterType!='WC' && <Button style={{marginLeft: 16}} onClick={() => this.handleModalVisible(true)}>添加</Button>
                }
              </div>
            }
          />
        </Form>
      )
    }
    renderModalForm(meterType) {

      const { form: {getFieldDecorator,getFieldInstance}, contractFetch, contract: {records} } = this.props;
    
      const contractData = records.map(item => ({...item}));
      
      const formBaseMap = {
        'P': <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='名称'>
        {
          getFieldDecorator('name', {
            rules: [
              {
                required: true, message: '请输入名称'
              }
            ],
          })(<Input placeholder='请输入'/>)
        }
      </FormItem>,
      'F': <Fragment>
      <Alert type='info' message='经营用房的水表需要从合同中选取' showIcon style={{marginBottom: 16}}/>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} label='单位名称' style={{marginBottom: 16}}>
        {
          getFieldDecorator('cid', {
            rules: [
              {
                required: true, message: '请选择单位'
              }
            ],
          })(
            <Select
              showSearch
              placeholder='请选择'
              style={{width: '100%'}}
              notFoundContent={contractFetch? <Spin size='small'/>: null}
              filterOption={false}
              onSearch={debounce(this.handleContractFilter,500)}
            >
              {
                contractData.map(c => <Option key={c.id} value={c.id}>{c.companyName}</Option>)
              }
            </Select>
          )
        }
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='水表个数' style={{marginBottom: 16}}>
        {
          getFieldDecorator('meterNum', {
            rules: [
              {
                required: true, message: '请输入水表个数'
              }
            ],
          })(<InputNumber min={0} placeholder='请输入'/>)
        }
      </FormItem>
    </Fragment>
      }

      const formMap = {
        'OP': formBaseMap['P'],
        'WP': formBaseMap['P'],
        'PP': formBaseMap['P'],

        'OF': formBaseMap['F'],
        'WF': formBaseMap['F'],
        'PF': formBaseMap['F'],
      }

      return formMap[meterType];
    }
    render() {
      const { modalVisible, searchValues: {meterType} } = this.state;
      const { submitting } = this.props;
      return (
        <Fragment>
          <Card
            bordered={false}
            style={{marginBottom: 24}}
          >
            { this.renderForm() }
          </Card>
          <Card
            bordered={false}
          >
            { this.renderTable() }
          </Card>
          <Modal
            title='添加水表'
            visible={modalVisible}
            onCancel={() => this.handleModalVisible(false)}
            onOk={this.handleAddMeter}
            confirmLoading={submitting}
            destroyOnClose
          >
            { this.renderModalForm(meterType) }
          </Modal>
        </Fragment>
      )
    }
  }
  return BasicWaterMeter;
}

export default Basic;