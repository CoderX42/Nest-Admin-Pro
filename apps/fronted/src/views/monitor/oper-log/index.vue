<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('monitor.operLog.username') }}</span></label>
          <input v-model="queryParams.username" :placeholder="t('monitor.operLog.placeholderUsername')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('monitor.operLog.module') }}</span></label>
          <input v-model="queryParams.module" :placeholder="t('monitor.operLog.module')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <button class="btn btn-sm btn-primary" @click="loadData">{{ t('common.action.search') }}</button>
        <button class="btn btn-sm" @click="resetQuery">{{ t('common.action.reset') }}</button>
        <button class="btn btn-sm btn-error" @click="handleClean">{{ t('common.action.clean') }}</button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th class="w-28">{{ t('monitor.operLog.username') }}</th>
              <th class="w-32">{{ t('monitor.operLog.module') }}</th>
              <th class="w-20">{{ t('monitor.operLog.method') }}</th>
              <th>{{ t('monitor.operLog.url') }}</th>
              <th class="w-20">{{ t('monitor.operLog.status') }}</th>
              <th class="w-24">Duration</th>
              <th class="w-32">{{ t('monitor.operLog.ip') }}</th>
              <th class="w-40">{{ t('monitor.operLog.time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="9" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="9" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.id" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td class="text-sm">{{ row.username }}</td>
              <td class="text-xs">{{ row.module }}</td>
              <td><span class="badge badge-sm badge-ghost font-mono">{{ row.method }}</span></td>
              <td class="text-xs truncate max-w-xs font-mono" :title="row.reqUrl || row.url">{{ row.reqUrl || row.url }}</td>
              <td><span class="badge badge-sm" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.success') : t('common.status.failed') }}</span></td>
              <td class="text-xs text-base-content/60">{{ row.duration }}ms</td>
              <td class="text-xs font-mono">{{ row.ip }}</td>
              <td class="text-xs text-base-content/60">{{ row.createTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex items-center justify-between p-4 border-t border-base-300">
        <span class="text-sm text-base-content/60">共 {{ total }} 条</span>
        <div class="join">
          <button class="join-item btn btn-sm" :disabled="queryParams.page <= 1" @click="queryParams.page--; loadData()">«</button>
          <button class="join-item btn btn-sm btn-active" disabled>{{ queryParams.page }}</button>
          <button class="join-item btn btn-sm" :disabled="queryParams.page * queryParams.limit >= total" @click="queryParams.page++; loadData()">»</button>
          <select class="join-item btn btn-sm" v-model="queryParams.limit" @change="loadData"><option :value="10">10/页</option><option :value="20">20/页</option></select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { operLogApi } from '@/api/monitor/oper-log';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ username: '', module: '', page: 1, limit: 10 });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await operLogApi.list(queryParams); tableData.value = res.items || []; total.value = res.total || 0; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.username = ''; queryParams.module = ''; queryParams.page = 1; loadData(); };

const handleClean = async () => {
  await ElMessageBox.confirm(t('common.message.confirmClean'), t('common.action.confirm'), { type: 'warning' });
  await operLogApi.clean(); ElMessage.success(t('common.message.cleanSuccess')); loadData();
};

onMounted(() => loadData());
</script>
