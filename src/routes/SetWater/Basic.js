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
  Tag,
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
      this.state = { areaType, searchValues: { meterType, isDel:'0' }, modalVisible: false, updateValues:{}, modalType: 'add' }
      this.row = [];
    }
    
    componentWillMount() {
      const { searchValues: { meterType } } = this.state;
      //this.context.getFloors('10');
      this.getMeter({type: meterType});
      //meterType == 'PF' && this.getContract();
    }

    mergeSearchValues(value) {
      const { searchValues } = this.state;
      const mergeValues = {
        ...searchValues,
        ...value,
        meterType: value.type
      }
      this.setState({
        searchValues: mergeValues
      },()=> {
        //this.getContract();
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
      dispatch({
        type: 'energy/fetchPublicAll',
        payload
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
        type: 'energy/enterWaterMeter',
        payload:params,
        modalType,
        callback: () => {
          this.handleModalVisible(false)
          this.getMeter({type: meterType});
        }
      })
    }

    handleChangeMeterType = type => {
      this.mergeSearchValues({type});
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
      const { searchValues: { meterType } } = this.state;
      const { current, pageSize: size } = pagination;
      this.getMeter({ current, size, type: meterType })
    }
    handleEdit = (modalVisible, modalType, updateValues) => {
      this.setState({ updateValues, modalType })
      this.handleModalVisible(modalVisible);
    }
    handleModalVisible = flag => {
      this.setState({
        modalVisible: !!flag
      })
    }
    handleAddMeter = () => {
      const { form } = this.props;
      const { searchValues: {meterType}, modalType } = this.state;
      
      form.validateFields((err, fieldsValue) => {
        if(err) {
          if(meterType=='OP' || meterType == 'WP' || meterType == 'PP') {
            if(err.hasOwnProperty('name')) return;
          } else {
            if(err.hasOwnProperty('cid') || err.hasOwnProperty('meterNum')) return
          }
        };
        const mergeParam = {
          ...fieldsValue,
          createTime: new Date().getTime(),
          meterType
        }
        this.saveMeter(modalType == 'add' ? [mergeParam] : mergeParam)
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

    getColumns() {
      return [
        {
          title: '名称',
          dataIndex: 'name'
        },
        {
          title: '设备号',
          dataIndex: 'pointId',
          render: value => value ? value : <Tag color='red'>未设置</Tag>
        },
        {
          title: '操作',
          dataIndex: '_',
          render: (value, row) => {
            return <a href='javascript:;' onClick={() => {this.handleEdit(true, 'edit', row )}}>编辑</a>
          }
        }
      ]
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
              style={{ width: 180 }}
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
            dataSource={data}
            size='middle'
            columns={ this.getColumns() }
            loading={loading}
            rowKey={(row, index)=>row.id ? row.id : index}
            bordered
            onChange={this.handleTableChange}
            footer={() => 
              <div style={{textAlign:'center'}}>
                <Button onClick={() => this.handleModalVisible(true)}>添加</Button>
              </div>
            }
          />
        </Form>
      )
    }
    renderModalForm(meterType) {

      const { form: {getFieldDecorator,getFieldInstance}, contractFetch, contract: {records} } = this.props;
    
      const contractData = records.map(item => ({...item}));
      
      
      return formMap[meterType];
    }
    render() {
      const { modalVisible, searchValues: {meterType}, modalType, updateValues } = this.state;
      const { submitting, form: {getFieldDecorator} } = this.props;
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
            title={modalType == 'add' ? '添加水表' : '编辑水表'}
            visible={modalVisible}
            onCancel={() => this.handleEdit(false, 'add')}
            onOk={this.handleAddMeter}
            confirmLoading={submitting}
            destroyOnClose
          >
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='名称'>
              {
                getFieldDecorator('name', {
                  rules: [
                    {
                      required: true, message: '请输入名称'
                    }
                  ],
                  initialValue: updateValues ? updateValues.name : ''
                })(<Input placeholder='请输入'/>)
              }
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label='设备号'>
              {
                getFieldDecorator('pointId', {
                  initialValue: updateValues ? updateValues.pointId : ''
                })(<Input placeholder='请输入'/>)
              }
            </FormItem>
          </Modal>
        </Fragment>
      )
    }
  }
  return BasicWaterMeter;
}

export default Basic;