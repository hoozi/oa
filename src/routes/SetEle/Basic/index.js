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
  Table,
  Tag
} from 'antd';
import moment from 'moment';
import { Name, Contract, ContractWareCustom } from './Form';

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;
const MeterTypeMap = {
  'office': [
    {
      label: 'A幢电梯空调',
      value: '1101'
    },
    {
      label: 'B幢公用',
      value: '1301'
    },
    {
      label: 'AB幢通信',
      value: '1102'
    },
    /* {
      label: 'AB幢经营房',
      value: '1211'
    }, */
    {
      label: 'AB幢高配房',
      value: '1104'
    }
  ],
  'warehouse': [
    /* {
      label: '客户',
      value: '1099'
    }, */
    {
      label: '消防柜',
      value: '1001'
    },
    {
      label: '电源灯柜',
      value: '1002'
    },
    /* {
      label: '经营用房',
      value: '1210'
    }, */
    {
      label: '通信',
      value: '1004'
    }
  ],
  'phase2': [
    /* {
      label: '公共水表',
      value: 'PP'
    }, */
    /* {
      label: '经营用房',
      value: '1214'
    } */
  ]
}

const Basic = areaType => {
  class BasicWaterMeter extends PureComponent {
    static contextTypes = {
      getFloors: PropTypes.func
    }
    constructor(props) {
      super(props);
      const meterType = MeterTypeMap[areaType][0]['value']
      this.state = { areaType, searchValues: { meterType, isDel:'0' }, modalVisible: false, updateValues:{}, modalType: 'add'}
      this.row = [];
    }
    
    componentWillMount() {
      const { searchValues: { meterType } } = this.state;
      this.context.getFloors('10');
      this.getMeter({ meterType });
      (meterType == '1214' || meterType == '1099') && this.getContract();
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
        '1211': 'SO',
        '1210': 'SW',
        '1099': 'WB',
        '1214': 'PT'
      }
      this.props.dispatch({
        type: 'contract/fetch',
        payload: {
          areaId: meterType == '1214' ? 14 : (meterType == '1099' ? 10 : 12),
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
        type: 'energy/fetchPublicAllEle',
        meterType: searchValues.meterType,
        payload: mergeValues
      })
    }

    saveMeter(payload) {
      const { searchValues: {meterType}, modalType, updateValues } = this.state;
      const id = modalType == 'edit' ? updateValues.id : null;
      const params = modalType == 'edit' ? {
        ...payload,
        id
      } : [
        ...payload
      ]
      this.props.dispatch({
        type: 'energy/enterEleMeter',
        payload: params,
        modalType,
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
    handleEdit = (modalVisible, modalType, updateValues) => {
      this.setState({ modalType });
      this.handleModalVisible(modalVisible, updateValues)
    }
    handleModalVisible = (flag, values) => {
      this.setState({
        modalVisible: !!flag,
        updateValues: values ? values : {}
      })
    }
    handleAddMeter = (fieldsValue) => {
      const { searchValues: {meterType}, modalType } = this.state;
      const mergeParamList = [];
      const { meterNum=0 } = fieldsValue;
      const mergeParam = {
        ...fieldsValue,
        meterType
      }
      
      for(let i=0; i<meterNum; i++) {
        mergeParamList.push(mergeParam)
      }

      this.saveMeter(modalType == 'add' ? [mergeParam] : mergeParam)
    
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
          /* {
            title: '启用日期',
            dataIndex: 'createTime',
            render: value =>  moment(value).format('YYYY-MM-DD')
          }, */
          /* {
            title: '倍数',
            dataIndex: 'times',
            width: '10%',
            render: (value, row, index) => <InputNumber step='10' min={0} autoFocus={index==0} defaultValue={value} onChange={value => this.handleFieldChange(value, 'times', index)} style={{width: '100%'}}/>
          }, */
          {
            title: '设备号',
            dataIndex: 'pointId',
            render: value => {
              return value ? value : <Tag color='red'>未设置</Tag>
            }
          },
          /* {
            title: '停用',
            dataIndex: 'isDel',
            render: (value, row, index) => <Fragment><Checkbox defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'isDel', index)}/>{value?<span style={{color:'#fa541c'}}>{moment(row.delTime).format('YYYY-MM-DD')}</span>:''}</Fragment>
          } */
          {
            title: '操作',
            dataIndex: '_',
            render: (value, row) => {
              return <a href='javascript:;' onClick={() => {this.handleEdit(true, 'edit', row )}}>编辑</a>
            }
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
            title: '倍数',
            dataIndex: 'times',
            width: '10%',
            render: (value, row, index) => <InputNumber step='10' min={0} autoFocus={index==0} defaultValue={value} onChange={value => this.handleFieldChange(value, 'times', index)} style={{width: '100%'}}/>
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
        '1101': colBaseMap['P'],
        '1301': colBaseMap['P'],
        '1102': colBaseMap['P'],
        '1211': colBaseMap['F'],
        '1104': colBaseMap['P'],
        '1001': colBaseMap['P'],
        '1002': colBaseMap['P'],
        '1210': colBaseMap['F'],
        '1214': colBaseMap['F'],
        '1004': colBaseMap['P'],
        '1099': [
          {
            title: '名称',
            dataIndex: 'companyName'
          },
          {
            title: '库号',
            dataIndex: 'roomsName'
          },
          {
            title: '倍数',
            dataIndex: 'times',
            width: '10%',
            render: (value, row, index) => <InputNumber step='10' min={0} autoFocus={index==0} defaultValue={value} onChange={value => this.handleFieldChange(value, 'times', index)} style={{width: '100%'}}/>
          },
          {
            title: '停用',
            dataIndex: 'isDel',
            width: '10%',
            render: (value, row, index) => <Fragment><Checkbox defaultChecked={value} onChange={e => this.handleFieldChange(e.target.checked, 'isDel', index)}/>{value?<span style={{color:'#fa541c'}}>{moment(row.delTime).format('YYYY-MM-DD')}</span>:''}</Fragment>
          },
          {
            title: '操作',
            render: (value, row) => <a href='javascript:;' onClick={() => this.handleModalVisible(true, row)}>修改</a>
          }
        ]
      }
      return colMap[meterType]
    }

    renderForm() {
      const { searchValues: {meterType, isDel}, areaType } = this.state;
      const { global: {floors} } = this.props;
      return (
        <Fragment>
          <span>
            电表类型&nbsp;&nbsp;
            <Select
              value={meterType}
              onChange={this.handleChangeMeterType}
              style={{ width: 150 }}
            >
              {
                MeterTypeMap[areaType].map(option => <Option key={option['value']} value={option['value']}>{option['label']}</Option>)
              }
            </Select>
          </span>
        </Fragment>
      )
    }
    renderTable() {
      const { searchValues: {meterType} } = this.state;
      const { energy: { records, current, total, data },  loading, submitting } = this.props;
      this.row = records.map(item=>({...item}));
      return (
        <Form onSubmit={this.handleSaveData}>
          <Table
            key={meterType}
            dataSource={data}
            size='middle'
            columns={ this.getColumns(meterType) }
            loading={loading}
            rowKey={(row, index)=>row.id ? row.id : index}
            bordered
            footer={() => 
              <div style={{textAlign:'center'}}>
                <Button style={{marginLeft: 16}} onClick={() => this.handleModalVisible(true)}>添加</Button>
              </div>
            }
          />
        </Form>
      )
    }
    renderModalForm(meterType) {
      const { contractFetch, contract: {records}, submitting, dispatch } = this.props;
      const contractData = records.map(item => ({...item}));
      const formBaseMap = {
        'P': <Name 
              submitting={submitting} 
              modalVisible={this.state.modalVisible} 
              onModalCancel={()=>this.handleEdit(false, 'add')}
              onFormSubmit={this.handleAddMeter}
              modalType={this.state.modalType}
              updateValues={this.state.updateValues}
            />,
      'F': <Contract
            submitting={submitting} 
            modalVisible={this.state.modalVisible} 
            onModalCancel={()=>this.handleModalVisible(false)}
            onFormSubmit={this.handleAddMeter}
            contractFetch={contractFetch}
            contractData={contractData}
            onContractFilter={this.handleContractFilter}
          />
      }
      const formMap = {
        '1101': formBaseMap['P'],
        '1301': formBaseMap['P'],
        '1102': formBaseMap['P'],
        '1104': formBaseMap['P'],
        '1001': formBaseMap['P'],
        '1002': formBaseMap['P'],
        '1004': formBaseMap['P'],

        '1211': formBaseMap['F'],
        '1210': formBaseMap['F'],
        '1214': formBaseMap['F'],

        '1099': <ContractWareCustom
                submitting={submitting} 
                modalVisible={this.state.modalVisible} 
                onModalCancel={()=>this.handleModalVisible(false)}
                onFormSubmit={this.handleAddMeter}
                contractFetch={contractFetch}
                contractData={contractData}
                onContractFilter={this.handleContractFilter}
                dispatch={dispatch}
                updateValues={this.state.updateValues}
              />
      }
      return formMap[meterType];
    }
    render() {
      const { searchValues: {meterType} } = this.state;
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
          { this.renderModalForm(meterType) }
        </Fragment>
      )
    }
  }
  return BasicWaterMeter;
}

export default Basic;