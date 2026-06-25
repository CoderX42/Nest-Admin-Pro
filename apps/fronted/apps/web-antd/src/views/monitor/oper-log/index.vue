<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { operLogCleanApi, operLogListApi } from '#/api';

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'username', label: '操作人' },
    { component: 'Input', fieldName: 'module', label: '系统模块' },
    {
      component: 'Select',
      componentProps: { options: [{ label: '成功', value: 1 }, { label: '失败', value: 0 }] },
      fieldName: 'status',
      label: '状态',
    },
  ],
  showCollapseButton: false,
};

const gridOptions: VxeGridProps<any> = {
  columns: [
    { title: 'ID', type: 'seq', width: 60 },
    { field: 'module', title: '系统模块', minWidth: 140 },
    { field: 'username', title: '操作人', minWidth: 140 },
    { field: 'reqMethod', title: '请求方式', width: 90 },
    { field: 'method', title: '方法名', minWidth: 160 },
    { field: 'reqUrl', title: '请求URL', minWidth: 240 },
    {
      field: 'status',
      title: '状态',
      width: 80,
      formatter: ({ row }) => (row.status === 1 ? '成功' : '失败'),
    },
    { field: 'ip', title: 'IP', width: 130 },
    { field: 'duration', title: '耗时(ms)', width: 100 },
    { field: 'createTime', title: '操作时间', formatter: 'formatDateTime', minWidth: 160 },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) =>
        (await operLogListApi({ page: page.currentPage, limit: page.pageSize, ...formValues })) as any,
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function handleClean() {
  Modal.confirm({
    title: '提示',
    content: '确认清空所有操作日志吗？该操作不可恢复。',
    okType: 'danger',
    onOk: async () => {
      await operLogCleanApi();
      gridApi.reload();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="操作日志">
      <template #toolbar-tools>
        <Space><a-button danger @click="handleClean">清空</a-button></Space>
      </template>
    </Grid>
  </Page>
</template>