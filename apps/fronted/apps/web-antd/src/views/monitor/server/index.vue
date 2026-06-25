<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { Card, Col, Row } from 'ant-design-vue';

import { serverInfoApi } from '#/api';

const info = ref<any>({});

async function load() {
  info.value = (await serverInfoApi()) ?? {};
}

onMounted(() => {
  load();
  const timer = setInterval(load, 5000);
  return () => clearInterval(timer);
});

const cpuPercent = computed(() => {
  const n = parseFloat((info.value.cpuUsage ?? '0').toString().replace('%', ''));
  return Number.isFinite(n) ? n : 0;
});
const memPercent = computed(() => {
  const m = info.value.mem;
  if (!m?.usage) return 0;
  return parseFloat(m.usage.toString().replace('%', '')) || 0;
});
</script>

<template>
  <Page>
    <Row :gutter="[16, 16]">
      <Col :span="8">
        <Card title="CPU 使用率">
          <a-progress :percent="cpuPercent" :stroke-color="cpuPercent > 80 ? '#ff4d4f' : '#1677ff'" />
          <div class="mt-2 text-sm text-gray-500">
            核心数：{{ info.cpuCount ?? '-' }}
          </div>
        </Card>
      </Col>
      <Col :span="8">
        <Card title="内存使用率">
          <a-progress :percent="memPercent" :stroke-color="memPercent > 80 ? '#ff4d4f' : '#52c41a'" />
          <div class="mt-2 text-sm text-gray-500">
            总内存：{{ info.mem?.total ?? '-' }} / 已用：{{ info.mem?.used ?? '-' }}
          </div>
        </Card>
      </Col>
      <Col :span="8">
        <Card title="主机信息">
          <p>主机名：{{ info.hostname ?? '-' }}</p>
          <p>操作系统：{{ info.os ?? '-' }}</p>
          <p>运行时长：{{ info.uptime ?? '-' }}</p>
        </Card>
      </Col>
    </Row>
  </Page>
</template>