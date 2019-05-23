import React, { Fragment } from 'react';
import { Table, Popconfirm, Divider, Button, Icon, Tag } from 'antd';
import moment from 'moment';

const CustomList = ({ data, loading, onDelete, onPageChange, onOpenEditModal, onRoleModal }) => {
    const { customs, total } = data;    
    const columns = [
        {
            title: '用户名',
            dataIndex: 'username'
        }, 
        {
            title: '角色',
            dataIndex: 'sysRoles',
            render: val => {
                return (<Fragment>{val?val.map(v=><Tag color='blue' key={v.roleId}>{v.roleName}</Tag>):'-'}</Fragment>)
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            render: val => moment(val).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <Fragment>
                        <a onClick={() => onOpenEditModal({...record})}>修改</a>
                        <Divider type="vertical"/>
                        <Popconfirm title="确定要删除这个用户吗" onConfirm={() => onDelete(record.userId)}>
                            <a style={{color: 'red'}}>删除</a>
                        </Popconfirm>
                    </Fragment>
                );
            }
        }
    ];
    const paginationOptions = {
        total, 
        onChange(page) {
            if(onPageChange) {
                onPageChange(page)
            }
        }
    }
    const rowSelectionOptions = {

    }
    return (
        
        <Table 
            size='middle'
            columns={columns}
            pagination={paginationOptions}
            bordered
            //expandedRowRender={record=><p>{record.description}</p>}
            //scroll={{}}
            loading={loading}
            dataSource={customs}
            rowKey={record=>record.userId}
        />
        
    )
} 

export default CustomList;

