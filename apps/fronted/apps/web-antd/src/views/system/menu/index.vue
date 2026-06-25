<script lang="ts" setup>
import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  menuCreateApi,
  menuDeleteApi,
  menuListApi,
  menuUpdateApi,
} from '#/api';

import MenuForm from './menu-form.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'name', title: '菜单名称', treeNode: true, minWidth: 200 },
      {
        field: 'icon',
        title: '图标',
        width: 80,
      },
      {
        field: 'type',
        title: '类型',
        width: 80,
        formatter: ({ row }) =>
          row.type === 1 ? '目录' : row.type === 2 ? '菜单' : '按钮',
      },
      { field: 'sort', title: '排序', width: 80 },
      { field: 'perms', title: '权限标识', minWidth: 160 },
      { field: 'component', title: '组件路径', minWidth: 160 },
      { field: 'path', title: '路由地址', minWidth: 160 },
      {
        title: '操作',
        width: 160,
        fixed: 'right',
        slots: { default: 'actions' },
      },
    ],
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async () => (await menuListApi()) as any,
      },
    },
    rowConfig: { treeLine: true },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'id',
      transform: true,
    },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  },
});

const [MenuModal, menuModalApi] = useVbenModal({
  connectedComponent: MenuForm,
});

function handleAdd(parent?: any) {
  menuModalApi.setData({ parentId: parent?.id ?? 0 }).open();
}

function handleEdit(row: any) {
  menuModalApi.setData(row).open();
}

function handleDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认删除菜单【${row.name}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await menuDeleteApi(row.id);
      gridApi.reload();
    },
  });
}

async function onSubmit(values: any) {
  if (values.id) {
    await menuUpdateApi(values);
  } else {
    await menuCreateApi(values);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="菜单列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd()">新增顶级菜单</a-button>
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
    <MenuModal @submit="onSubmit" />
  </Page>
</template>