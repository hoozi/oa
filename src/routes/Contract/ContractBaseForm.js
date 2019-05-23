import React, { Fragment, PureComponent } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Radio,
  Button,
  Tooltip,
  AutoComplete,
  Icon,
  Transfer,
  Select,
  Checkbox
} from 'antd';
import moment from 'moment';
import styles from './ContractBaseForm.less';
import { WSAEALREADY } from 'constants';

const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Option = Select.Option;
const AutoOption = AutoComplete.Option;
const CheckboxGroup = Checkbox.Group;

const setYearRange = (y) => {
  const now = new Date();
  return [moment(now),moment(now.getTime()+1000 * 60 * 60 * 24 * 365 * y)]
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  }
};

const mapPropsToFields = (props) => {
  const { updateValues } = props;
  const retFields = {};
  if(updateValues) {
    Object.keys(updateValues).forEach((key) => {
      let value;
      if((key === 'companyName' || key === 'renter')) {
        value = updateValues[key].replace(/\s+$/, '');
      } else if(key === 'contractType') {
        if(updateValues.code.indexOf('SO') >= 0) {
          value = '1'
        } else {
          value = '2'
        }
      } else if(key === 'roomsId') {
        value = props.roomsData.filter(room=>room.isRented).map(room => room.value)
      } else {
        value = updateValues[key]
      }
      retFields['_'] = Form.createFormField({
        value: [moment(updateValues['startTime']), moment(updateValues['endTime'])]
      });
      
      retFields[key] = Form.createFormField({ value });
    });
  }
  return retFields
}

@Form.create({ mapPropsToFields })
export default class ContractBaseForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      updateValues: props.updateValues || {},
      roomsData: props.roomsData || [],
      targetKeys: props.targetKeys || [],
      selectedKeys: props.selectedKeys || [],
      valid: 1,
      nflag: 0,
      chargeFlag: 0,
      formItemLayout
    }
  }

  validator = (rule, value, callback) => {
    const isEnOrNum = /^[a-zA-Z0-9]+$/;
    if(value && !isEnOrNum.test(value)) {
      callback('请输入数字或英文的合同编号');
    }
    callback();
  }

  validatorTel = (rule, value, callback) => {
    const replaceValue = value && value.replace(/(^\s*)|(\s*$)/,'');
    const isPhone = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;//手机号码
    const isMob= /^\d{7,8}$/;// 座机格式
    if(replaceValue && !isPhone.test(replaceValue) && !isMob.test(replaceValue) ){
      callback('请输入正确格式的联系电话');
    }
    callback();
  }

  handleRoomChange = (targetKeys) => {
    this.setState({ targetKeys })
  }

  handleContractSubmit = (e) => {
    const { form, onContractSubmit } = this.props
    const { targetKeys } = this.state;
    const { areaId } = this.props;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if(err) return;
      const values = {
        ...fieldsValue,
        roomsId: fieldsValue.roomsId.indexOf(',') !==-1?fieldsValue.roomsId.split(','):fieldsValue.roomsId,
        valid: fieldsValue.valid ? 1 : 0,
        nflag: fieldsValue.nflag ? 1 : 0,
        chargeFlag: fieldsValue.chargeFlag ? 1 : 0
      }
      onContractSubmit && onContractSubmit(values);
    })
  }

  handleStatusChange = (e, status) => {
    this.setState({
      [status]: ~~e.target.value
    });
  }

  getAreaForm(areaName) {
    const { formItemLayout, targetKeys, updateValues } = this.state;
    const { getFieldDecorator } = this.props.form;
    const Office = () => {
      return (
        <FormItem 
          label='房间号'
          { ...formItemLayout }
        >
          {getFieldDecorator('roomsId', {
            rules: [{
              required: true, message: '请选择房间'
            }]
          })(     
            <Select
              mode='tags'
              style={{ width: '100%' }}
              placeholder='请选择'
              optionFilterProp='children'
            >
              {
                this.props.roomsData.map(room => <Option key={room.key} value={room.value}>{room.label}</Option>)
              }
            </Select>
            
          )}
        </FormItem>
      )
    }

    const Warehouse = () => {
 
      return (
        <Fragment>
          <FormItem 
            label='房间号'
            { ...formItemLayout }
          >
            {getFieldDecorator('roomsId', {
              rules: [{
                required: true, message: '请选择房间'
              }]
            })(     
              <Select
                mode='tags'
                style={{ width: '100%' }}
                placeholder='请选择'
                optionFilterProp='children'
              >
                {
                  this.props.roomsData.map(room => <Option key={room.key} value={room.value}>{room.label}</Option>)
                }
              </Select>
            )}
          </FormItem>
          <FormItem 
            label="总面积(㎡)"
            { ...formItemLayout }
          >
            { getFieldDecorator('roomsSize')(<InputNumber  
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/(,*)/g, '')}/>) }
          </FormItem>
        </Fragment>
      )
    }
    
    const Facility = (type) => {
      return (
        <Fragment>
          {
            type == 'supporting' && <FormItem 
            label={(
              <span>
                所属区块&nbsp;
                <Tooltip title="配套用房需要区分仓库和写字楼">
                  <Icon type="exclamation-circle-o" />
                </Tooltip>
              </span>
            )}
            { ...formItemLayout }
          >
            { getFieldDecorator('contractType', {
              rules: [
                {
                  required: true,
                  message: '请选择所属区块'
                }
              ]
            })(
              <Select placeholder='请选择'>
                <Option value='1'>写字楼</Option>
                <Option value='2'>仓库</Option>
              </Select>
            ) }
          </FormItem>
          }
          <FormItem 
            label="房间号"
            { ...formItemLayout }
          >
            { getFieldDecorator('roomsId', {
              rules: [
                {
                  required: true,
                  message: '请选择房间号'
                }
              ]
            })(
              <Select
                mode='tags'
                style={{ width: '100%' }}
                placeholder='请选择'
                optionFilterProp='label'
              >
                {
                  this.props.roomsData.map(room => <Option key={room.key} value={room.value}>{room.label}</Option>)
                }
              </Select>
            ) }
          </FormItem>
          <FormItem 
            label="总面积(㎡)"
            { ...formItemLayout }
          >
            { getFieldDecorator('roomsSize')(<InputNumber  
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/(,*)/g, '')}/>) }
          </FormItem>
        </Fragment>
      )
    }

    const areaForm = { Office, Warehouse, Facility };

    return areaForm[areaName];
  }

  renderArea(areaId) {
    switch(areaId) {
      case '11':
      case '13':
        return this.getAreaForm('Office')();
        break;
      case '10':
        return this.getAreaForm('Warehouse')();
        break;
      case '12':
        return this.getAreaForm('Facility')('supporting');
        break;
      case '14':
        return this.getAreaForm('Facility')();
        break;
      default:
        return '';
    }
  }

  render() {
    const { formItemLayout, updateValues, valid, nflag, chargeFlag } = this.state;
    const { form, areaId, submitting, type = '' } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    return (
      <Form className={styles.modalForm} onSubmit={ this.handleContractSubmit }>
        <FormItem 
          label='合同编号'
          { ...formItemLayout }
        >
          { getFieldDecorator('code')(<Input placeholder='合同编号根据区块自动生成' disabled/>) }
        </FormItem>
        <FormItem 
          label="归档号"
          { ...formItemLayout }
        >
          { getFieldDecorator('archiveNo')(<Input placeholder='请输入'/>) }
        </FormItem>
        <FormItem 
          label="单位名称"
          { ...formItemLayout }
        >
          { getFieldDecorator('companyName', {
            rules: [
              {
                required: true,
                message: '请输入承租单位名称'
              }
            ],
          })(<Input placeholder='请输入承租单位名称'/>) }
        </FormItem>
        <FormItem 
          label="信用代码"
          { ...formItemLayout }
        >
          { getFieldDecorator('license', {
            rules: [
              {
                required: true,
                message: '请输入承租单位信用代码'
              }
            ],
          })(<Input placeholder='请输入承租单位信用代码'/>) }
        </FormItem>
        <FormItem 
          label="法人"
          { ...formItemLayout }
        >
          { getFieldDecorator('renter', {
            rules: [
              {
                required: true,
                message: '请输入法人'
              }
            ],
          })(<Input placeholder='请输入法人姓名'/>) }
        </FormItem>
        <FormItem 
          label="联系电话"
          { ...formItemLayout }
        >
          { getFieldDecorator('tel', {
            rules: [
              {
                required: true,
                message: '请输入联系电话'
              },
              { validator: this.validatorTel }
            ],
          })(<Input placeholder='请输入手机号'/>) }
        </FormItem>
        { this.renderArea(areaId) }
        <FormItem 
          label="租金"
          { ...formItemLayout }
        >
          { getFieldDecorator('rent', {
            rules: [
              {
                required: true,
                message: '请输入租金'
              }
            ],
          })(<InputNumber  
              style={{width: '35%'}} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\¥\s?|(,*)/g, '')}/>) }
        </FormItem>
        <FormItem 
          label="押金"
          { ...formItemLayout }
        >
          { getFieldDecorator('deposit', {
            rules: [
              {
                required: true,
                message: '请输入押金'
              }
            ],
          })(<InputNumber 
              style={{width: '35%'}} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\¥\s?|(,*)/g, '')}/>) }
        </FormItem>
        <FormItem  
          label={(
            <span>
              合同期限&nbsp;
              <Tooltip title="合同期限默认一年">
                <Icon type="exclamation-circle-o" />
              </Tooltip>
            </span>
          )}
          { ...formItemLayout }
        >
          { getFieldDecorator('_', {
            rules: [
              {
                required: true,
                message: '请选择合同期限'
              }
            ],
            initialValue: setYearRange(1)
          })(<RangePicker/>) }
        </FormItem>
        <FormItem 
          label="备注"
          { ...formItemLayout }
        >
          { getFieldDecorator('remark', {
            initialValue: ''
          })(<TextArea placeholder="请输入备注" autosize={{ minRows: 3, maxRows: 6 }}/>) }
        </FormItem>
        <FormItem 
          label="状态"
          { ...formItemLayout }
        >
          { getFieldDecorator('valid', {
            initialValue: true
          })(<Checkbox defaultChecked={ updateValues.id ? updateValues.valid : valid }>有效合同</Checkbox>) }
          { getFieldDecorator('nflag', {
            initialValue: false
          })(<Checkbox defaultChecked={ updateValues.id ? updateValues.nflag : nflag }>未入驻</Checkbox>) }
          { getFieldDecorator('chargeFlag', {
            initialValue: false
          })(<Checkbox defaultChecked={ updateValues.id ? updateValues.chargeFlag : chargeFlag }>租金已支付</Checkbox>) }
        </FormItem>
        <div style={{ textAlign: 'center' }}>
          <Button loading={submitting} type="primary" htmlType="submit" onClick={ this.handleContractSubmit }>提交</Button>
        </div>
      </Form>
    )
  }
}
