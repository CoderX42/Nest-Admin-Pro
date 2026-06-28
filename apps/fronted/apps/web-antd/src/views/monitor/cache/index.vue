<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { h, onMounted, ref } from 'vue';

import { Card, Modal, Table } from 'ant-design-vue';

import { cacheClearApi, cacheDeleteApi, cacheInfoApi, cacheKeysApi, cacheValueApi } from '#/api';

const info = ref<any>({});
const keys = ref<any[]>([]);
const keyPattern = ref('*');

async function load() {
  info.value = (await cacheInfoApi()) ?? {};
  await loadKeys();
}

async function loadKeys() {
  keys.value = (await cacheKeysApi(keyPattern.value)) ?? [];
}

function handleClear() {
  Modal.confirm({
    title: '提示',
    content: '确认清空所有缓存吗？该操作不可恢复。',
    okType: 'danger',
    onOk: async () => {
      await cacheClearApi();
      await load();
    },
  });
}

async function handleView(key: string) {
  const value: any = await cacheValueApi(key);
  Modal.info({
    title: `缓存键：${key}`,
    width: 600,
    content: () => {
      const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '');
      return h('pre', { style: { maxHeight: '400px', overflow: 'auto' } }, text);
    },
  });
}

function handleDelete(key: string) {
  Modal.confirm({
    title: '提示',
    content: `确认删除缓存键【${key}】吗？`,
    okType: 'danger',
    onOk: async () => {
      await cacheDeleteApi(key);
      await load();
    },
  });
}

onMounted(load);
</script>

<template>
  <Page>
    <Card class="mb-2" title="Redis 信息">
      <pre class="text-sm">{{ JSON.stringify(info, null, 2) }}</pre>
    </Card>

    <Card title="缓存键">
      <div class="mb-2 flex gap-2">
        <a-input v-model:value="keyPattern" placeholder="匹配模式，如 captcha:*" style="width: 240px" />
        <a-button type="primary" @click="loadKeys">查询</a-button>
        <a-button danger @click="handleClear">清空全部</a-button>
      </div>
      <Table
        :columns="[
          { title: '键', dataIndex: 'key' },
          { title: '类型', dataIndex: 'type', width: 120 },
          { title: 'TTL(秒)', dataIndex: 'ttl', width: 120 },
          { title: '操作', key: 'action', width: 200 },
        ]"
        :data-source="keys"
        :pagination="false"
        size="small"
        row-key="key"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button size="small" type="link" @click="handleView(record.key)">查看</a-button>
            <a-button size="small" type="link" danger @click="handleDelete(record.key)">删除</a-button>
          </template>
        </template>
      </Table>
    </Card>
  </Page>
</template>