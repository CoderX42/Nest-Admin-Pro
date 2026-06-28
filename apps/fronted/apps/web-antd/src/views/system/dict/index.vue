<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal, Space, Tabs } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  dictDataCreateApi,
  dictDataDeleteApi,
  dictDataListApi,
  dictDataUpdateApi,
  dictTypeCreateApi,
  dictTypeDeleteApi,
  dictTypeListApi,
  dictTypeUpdateApi,
} from '#/api';

import DictDataForm from './dict-data-form.vue';
import DictTypeForm from './dict-type-form.vue';

const activeTab = ref<'type' | 'data'>('type');

// 字典类型
const typeFormOptions: VbenFormProps = {
  collapsed: false,
  schema: [
    { component: 'Input', fieldName: 'name', label: '字典名称' },
    { component: 'Input', fieldName: 'code', label: '字典类型' },
  ],
  showCollapseButton: false,
};

const typeGridOptions: VxeGridProps<any> = {
  columns: [
    { title: 'ID', type: 'seq', width: 60 },
    { field: 'name', title: '字典名称', minWidth: 160 },
    { field: 'code', title: '字典类型', minWidth: 160 },
    { field: 'remark', title: '备注', minWidth: 200 },
    { field: 'createTime', title: '创建时间', formatter: 'formatDateTime', minWidth: 160 },
    {
      title: '操作',
      width: 220,
      fixed: 'right',
      slots: { default: 'typeActions' },
    },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) =>
        (await dictTypeListApi({ page: page.currentPage, limit: page.pageSize, ...formValues })) as any,
    },
  },
  toolbarConfig: { custom: true, export: true, refresh: true, zoom: true },
};

const [TypeGrid, typeGridApi] = useVbenVxeGrid({
  formOptions: typeFormOptions,
  gridOptions: typeGridOptions,
});

const [TypeModal, typeModalApi] = useVbenModal({ connectedComponent: DictTypeForm });
const [DataModal, dataModalApi] = useVbenModal({ connectedComponent: DictDataForm });

const currentDictType = ref<any>(null);
const dataGridRef = ref<any>(null);

async function loadDictData(dictType: any) {
  currentDictType.value = dictType;
  const data: any = await dictDataListApi(dictType.id);
  if (dataGridRef.value) {
    dataGridRef.value.loadData(data ?? []);
  }
}

function handleTypeAdd() {
  typeModalApi.setData({}).open();
}
function handleTypeEdit(row: any) {
  typeModalApi.setData(row).open();
}
function handleTypeDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认删除字典类型【${row.name}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await dictTypeDeleteApi(row.id);
      typeGridApi.reload();
    },
  });
}

function handleDataAdd() {
  if (!currentDictType.value) {
    Modal.warning({ title: '提示', content: '请先选择左侧的字典类型' });
    return;
  }
  dataModalApi.setData({ dictTypeId: currentDictType.value.id }).open();
}
function handleDataEdit(row: any) {
  dataModalApi.setData(row).open();
}
function handleDataDelete(row: any) {
  Modal.confirm({
    title: '提示',
    content: `确认删除字典数据【${row.label}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await dictDataDeleteApi(row.id);
      await loadDictData(currentDictType.value);
    },
  });
}

async function onTypeSubmit(values: any) {
  if (values.id) {
    await dictTypeUpdateApi(values);
  } else {
    await dictTypeCreateApi(values);
  }
  typeGridApi.reload();
}

async function onDataSubmit(values: any) {
  if (values.id) {
    await dictDataUpdateApi(values);
  } else {
    await dictDataCreateApi(values);
  }
  if (currentDictType.value) {
    await loadDictData(currentDictType.value);
  }
}
</script>

<template>
  <Page auto-content-height>
    <Tabs v-model:active-key="activeTab" class="mb-2">
      <Tabs.TabPane key="type" tab="字典类型" />
      <Tabs.TabPane key="data" tab="字典数据" />
    </Tabs>

    <div v-show="activeTab === 'type'" class="h-full">
      <TypeGrid table-title="字典类型列表">
        <template #toolbar-tools>
          <Space><a-button type="primary" @click="handleTypeAdd">新增字典类型</a-button></Space>
        </template>
        <template #typeActions="{ row }">
          <Space>
            <a-button size="small" type="link" @click="handleTypeEdit(row)">编辑</a-button>
            <a-button size="small" type="link" danger @click="handleTypeDelete(row)">删除</a-button>
          </Space>
        </template>
      </TypeGrid>
      <TypeModal @submit="onTypeSubmit" />
    </div>

    <div v-show="activeTab === 'data'" class="h-full">
      <div class="mb-2 flex gap-2">
        <a-button type="primary" @click="handleDataAdd">新增字典数据</a-button>
        <span v-if="currentDictType" class="text-gray-500">
          当前字典：{{ currentDictType.name }} ({{ currentDictType.code }})
        </span>
      </div>
      <a-table
        :columns="[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '字典标签', dataIndex: 'label', width: 160 },
          { title: '字典键值', dataIndex: 'value', width: 160 },
          { title: '字典排序', dataIndex: 'sort', width: 100 },
          { title: '备注', dataIndex: 'remark' },
          { title: '创建时间', dataIndex: 'createTime', width: 180 },
          { title: '操作', key: 'action', width: 160, fixed: 'right' },
        ]"
        :data-source="[]"
        :pagination="false"
        size="small"
        row-key="id"
        ref="dataGridRef"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <a-button size="small" type="link" @click="handleDataEdit(record)">编辑</a-button>
              <a-button size="small" type="link" danger @click="handleDataDelete(record)">删除</a-button>
            </Space>
          </template>
        </template>
      </a-table>
      <DataModal @submit="onDataSubmit" />
    </div>
  </Page>
</template>