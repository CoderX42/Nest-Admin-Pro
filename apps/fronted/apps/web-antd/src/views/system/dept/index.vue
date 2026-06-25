<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deptCreateApi,
  deptDeleteApi,
  deptListApi,
  deptUpdateApi,
} from '#/api';

import DeptForm from './dept-form.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'name', title: '部门名称', treeNode: true, minWidth: 200 },
      { field: 'sort', title: '排序', width: 80 },
      {
        field: 'status',
        title: '状态',
        width: 80,
        cellRender: {
          attrs: {
            beforeChange: () => false, // 部门状态不允许在前端切换
          },
          name: 'Switch',
          props: { checkedValue: 1, unCheckedValue: 0, disabled: true },
        },
      },
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
        query: async () => (await deptListApi()) as any,
      },
    },
    rowConfig: { treeLine: true },
    treeConfig: { parentField: 'parentId', rowField: 'id', transform: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  },
});

const [DeptModal, deptModalApi] = useVbenModal({
  connectedComponent: DeptForm,
});

function handleAdd(parent?: any) {
  deptModalApi.setData({ parentId: parent?.id ?? 0 }).open();
}

function handleEdit(row: any) {
  deptModalApi.setData(row).open();
}

function handleDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认删除部门【${row.name}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await deptDeleteApi(row.id);
      gridApi.reload();
    },
  });
}

async function onSubmit(values: any) {
  if (values.id) {
    await deptUpdateApi(values);
  } else {
    await deptCreateApi(values);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="部门列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd()">新增顶级部门</a-button>
        </Space>
      </template>
      <template #actions="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleAdd(row)">新增</a-button>
          <a-button size="small" type="link" @click="handleEdit(row)">编辑</a-button>
          <a-button size="small" type="link" danger @click="handleDelete(row)">删除</a-button>
        </Space>
      </template>
    </Grid>
    <DeptModal @submit="onSubmit" />
  </Page>
</template>