<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  configCreateApi,
  configDeleteApi,
  configListApi,
  configRefreshApi,
  configUpdateApi,
} from '#/api';

import ConfigForm from './config-form.vue';

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'name', label: '参数名称' },
    { component: 'Input', fieldName: 'key', label: '参数键名' },
  ],
  showCollapseButton: false,
};

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: 'ID', type: 'seq', width: 60 },
    { field: 'name', title: '参数名称', minWidth: 160 },
    { field: 'key', title: '参数键名', minWidth: 160 },
    { field: 'value', title: '参数键值', minWidth: 200 },
    { field: 'type', title: '系统内置', width: 100 },
    { field: 'remark', title: '备注', minWidth: 160 },
    { field: 'createTime', title: '创建时间', formatter: 'formatDateTime', minWidth: 160 },
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
      query: async ({ page }, formValues) =>
        (await configListApi({ page: page.currentPage, limit: page.pageSize, ...formValues })) as any,
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [ConfigModal, configModalApi] = useVbenModal({ connectedComponent: ConfigForm });

function handleAdd() {
  configModalApi.setData({}).open();
}
function handleEdit(row: any) {
  configModalApi.setData(row).open();
}
function handleDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认删除参数【${row.name}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await configDeleteApi(row.id);
      gridApi.reload();
    },
  });
}
async function handleRefresh() {
  await configRefreshApi();
  gridApi.reload();
}
async function onSubmit(values: any) {
  if (values.id) {
    await configUpdateApi(values);
  } else {
    await configCreateApi(values);
  }
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="参数配置列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd">新增参数</a-button>
          <a-button @click="handleRefresh">刷新缓存</a-button>
        </Space>
      </template>
      <template #actions="{ row }">
        <Space>
          <a-button size="small" type="link" @click="handleEdit(row)">编辑</a-button>
          <a-button size="small" type="link" danger @click="handleDelete(row)">删除</a-button>
        </Space>
      </template>
    </Grid>
    <ConfigModal @submit="onSubmit" />
  </Page>
</template>