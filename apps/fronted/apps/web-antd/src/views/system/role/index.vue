<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  roleChangeStatusApi,
  roleCreateApi,
  roleDeleteApi,
  roleListApi,
  roleUpdateApi,
} from '#/api';

import RoleForm from './role-form.vue';

interface RowType {
  code: string;
  dataScope: number;
  id: number;
  name: string;
  remark?: string;
  status: number;
}

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'name', label: '角色名' },
    { component: 'Input', fieldName: 'code', label: '权限字符' },
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
    { field: 'name', title: '角色名', minWidth: 120 },
    { field: 'code', title: '权限字符', minWidth: 120 },
    {
      cellRender: {
        attrs: {
          beforeChange: async ({ row }) => {
            Modal.confirm({
              title: '提示',
              content: `确认要${row.status === 1 ? '禁用' : '启用'}该角色吗？`,
              onOk: async () => {
                await roleChangeStatusApi(row.id, row.status === 1 ? 0 : 1);
                gridApi.reload();
              },
            });
            return false;
          },
        },
        name: 'Switch',
        props: { checkedValue: 1, unCheckedValue: 0 },
      },
      field: 'status',
      title: '状态',
      width: 80,
    },
    { field: 'remark', title: '备注', minWidth: 160 },
    { field: 'createTime', title: '创建时间', formatter: 'formatDateTime', minWidth: 160 },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await roleListApi({
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
const [RoleModal, roleModalApi] = useVbenModal({
  connectedComponent: RoleForm,
});

function handleAdd() {
  roleModalApi.setData({}).open();
}

function handleEdit(row: RowType) {
  roleModalApi.setData(row).open();
}

function handleDelete(row: RowType) {
  Modal.confirm({
    title: '提示',
    content: `确认删除角色【${row.name}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await roleDeleteApi(row.id);
      gridApi.reload();
    },
  });
}

async function onSubmit(formData: any) {
  if (formData.id) {
    await roleUpdateApi(formData);
  } else {
    await roleCreateApi(formData);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="角色列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd">新增角色</a-button>
        </Space>
      </template>
      <template #actions="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleEdit(row)">编辑</a-button>
          <a-button size="small" type="link" danger @click="handleDelete(row)">删除</a-button>
        </Space>
      </template>
    </Grid>
    <RoleModal @submit="onSubmit" />
  </Page>
</template>