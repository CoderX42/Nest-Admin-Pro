<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  roleListApi,
  userAssignRolesApi,
  userChangeStatusApi,
  userCreateApi,
  userDeleteApi,
  userDetailApi,
  userListApi,
  userResetPasswordApi,
  userUpdateApi,
} from '#/api';

import UserForm from './user-form.vue';

interface RowType {
  avatar?: string;
  createTime: string;
  dept?: { id: number; name: string };
  deptId?: number;
  email?: string;
  id: number;
  nickname: string;
  phone?: string;
  remark?: string;
  roles: { code: string; id: number; name: string }[];
  status: number;
  username: string;
}

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'username', label: '用户名' },
    { component: 'Input', fieldName: 'nickname', label: '昵称' },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '正常', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: false,
};

const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: 'ID', type: 'seq', width: 50 },
    { field: 'username', title: '用户名', minWidth: 120 },
    { field: 'nickname', title: '昵称', minWidth: 120 },
    {
      cellRender: { name: 'CellLink' },
      field: 'dept.name',
      formatter: ({ row }) => row.dept?.name ?? '-',
      title: '部门',
      minWidth: 120,
    },
    {
      field: 'roles',
      formatter: ({ row }) =>
        (row.roles as { name: string }[])?.map((r) => r.name).join(', ') || '-',
      title: '角色',
      minWidth: 140,
    },
    { field: 'email', title: '邮箱', minWidth: 160 },
    { field: 'phone', title: '手机号', minWidth: 120 },
    {
      cellRender: {
        attrs: {
          beforeChange: async ({ row }) => {
            Modal.confirm({
              title: '提示',
              content: `确认要${row.status === 1 ? '禁用' : '启用'}该用户吗？`,
              onOk: async () => {
                await userChangeStatusApi(row.id, row.status === 1 ? 0 : 1);
                gridApi.reload();
              },
            });
            return false;
          },
        },
        name: 'Switch',
        props: {
          checkedValue: 1,
          unCheckedValue: 0,
        },
      },
      field: 'status',
      title: '状态',
      width: 80,
    },
    { field: 'createTime', title: '创建时间', formatter: 'formatDateTime', minWidth: 160 },
    {
      title: '操作',
      width: 280,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await userListApi({
          page: page.currentPage,
          limit: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [UserModal, userModalApi] = useVbenModal({
  connectedComponent: UserForm,
});

async function handleAdd() {
  userModalApi.setData({}).open();
}

async function handleEdit(row: RowType) {
  const detail = await userDetailApi(row.id);
  userModalApi.setData(detail).open();
}

async function handleDelete(row: RowType) {
  Modal.confirm({
    title: '提示',
    content: `确认删除用户【${row.username}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await userDeleteApi(row.id);
      gridApi.reload();
    },
  });
}

async function handleResetPwd(row: RowType) {
  Modal.confirm({
    title: '提示',
    content: `确认重置【${row.username}】的密码为 admin123 吗？`,
    onOk: async () => {
      const result: any = await userResetPasswordApi(row.id);
      Modal.success({ title: '提示', content: `密码已重置为：${result?.password ?? 'admin123'}` });
    },
  });
}

async function handleAssignRoles(row: RowType) {
  const roles: any = await roleListApi({ limit: 100 });
  Modal.confirm({
    title: '分配角色',
    width: 500,
    content: '该功能需要在表单中编辑',
    onOk: () => {},
  });
}

async function onSubmit(formData: any) {
  if (formData.id) {
    await userUpdateApi(formData);
  } else {
    await userCreateApi(formData);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="用户列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd">新增用户</a-button>
        </Space>
      </template>
      <template #actions="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleEdit(row)">编辑</a-button>
          <a-button size="small" type="link" danger @click="handleDelete(row)">删除</a-button>
          <a-button size="small" type="link" @click="handleResetPwd(row)">重置密码</a-button>
        </Space>
      </template>
    </Grid>
    <UserModal @submit="onSubmit" />
  </Page>
</template>