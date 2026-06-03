<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">{{ t('monitor.online.title') || '在线用户' }}</h3>
        <span class="badge badge-primary">{{ tableData.length }} 在线</span>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th>{{ t('monitor.online.username') }}</th>
              <th>{{ t('monitor.online.nickname') }}</th>
              <th>{{ t('monitor.online.email') }}</th>
              <th>{{ t('monitor.online.phone') }}</th>
              <th class="w-40">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="6" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.token" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td class="text-sm">{{ row.username }}</td>
              <td class="text-sm">{{ row.nickname }}</td>
              <td class="text-xs">{{ row.email }}</td>
              <td class="text-xs">{{ row.phone }}</td>
              <td>
                <button class="btn btn-xs btn-error" @click="handleForceLogout(row.token)">{{ t('common.action.forceLogout') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { onlineApi } from '@/api/monitor/online';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);

const loadData = async () => {
  loading.value = true;
  try { tableData.value = await onlineApi.list(); }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleForceLogout = async (token: string) => {
  await ElMessageBox.confirm(t('common.message.confirmForceLogout'), t('common.action.confirm'), { type: 'warning' });
  await onlineApi.forceLogout(token); ElMessage.success(t('common.message.success')); loadData();
};

onMounted(() => loadData());
</script>
