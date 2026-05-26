<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-64">
          <label class="label py-0"><span class="label-text text-xs">{{ t('monitor.cache.key') }}</span></label>
          <input v-model="keyPattern" :placeholder="t('monitor.cache.placeholderKey')" class="input input-bordered input-sm w-full" @keyup.enter="loadKeys" />
        </div>
        <button class="btn btn-sm btn-primary" @click="loadKeys">{{ t('common.action.search') }}</button>
        <button class="btn btn-sm btn-success" @click="loadInfo">{{ t('common.action.refresh') }}</button>
        <button class="btn btn-sm btn-error" @click="handleClear">{{ t('common.action.clean') }}</button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Cache info -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-4">
          <h3 class="card-title text-sm font-semibold mb-3">{{ t('monitor.cache.cacheInfo') }}</h3>
          <div v-if="info" class="space-y-2">
            <div v-for="(v, k) in info" :key="k" class="flex justify-between text-sm py-1.5 border-b border-base-300 last:border-0">
              <span class="text-base-content/60 font-mono text-xs">{{ k }}</span>
              <span class="font-medium text-xs break-all">{{ v }}</span>
            </div>
          </div>
          <div v-else class="space-y-2">
            <div class="h-4 bg-base-300 rounded animate-pulse w-3/4"></div>
            <div class="h-4 bg-base-300 rounded animate-pulse w-1/2"></div>
            <div class="h-4 bg-base-300 rounded animate-pulse w-2/3"></div>
            <div class="h-4 bg-base-300 rounded animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>

      <!-- Cache keys -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="card-title text-sm font-semibold">{{ t('monitor.cache.cacheKeys') }} ({{ keys.length }})</h3>
          </div>
          <div class="overflow-x-auto max-h-80 overflow-y-auto">
            <table class="table table-xs">
              <thead><tr class="bg-base-200 text-xs"><th>{{ t('monitor.cache.key') }}</th><th class="w-36">{{ t('common.field.actions') }}</th></tr></thead>
              <tbody>
                <tr v-if="!keys.length"><td colspan="2" class="text-center text-base-content/40 py-4 text-sm">No keys</td></tr>
                <tr v-for="key in keys" :key="key" class="hover:bg-base-200/50">
                  <td class="text-xs font-mono truncate max-w-xs" :title="key">{{ key }}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-xs btn-ghost" @click="handleViewValue(key)">🔍</button>
                      <button class="btn btn-xs btn-ghost" @click="handleDeleteKey(key)">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Value dialog -->
    <dialog ref="valueDialogRef" class="modal">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ t('monitor.cache.value') }}</h3>
        <textarea :value="cacheValue" readonly class="textarea textarea-bordered w-full font-mono text-sm" rows="12"></textarea>
        <div class="modal-action"><button class="btn" @click="valueDialogRef?.close()">{{ t('common.action.cancel') }}</button></div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { cacheApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const info = ref<any>(null);
const keys = ref<string[]>([]);
const keyPattern = ref('*');
const valueDialogRef = ref<HTMLDialogElement>();
const cacheValue = ref('');

const loadInfo = async () => { try { info.value = await cacheApi.info(); } catch { ElMessage.error(t('common.message.loadFailed')); } };
const loadKeys = async () => { try { keys.value = await cacheApi.keys(keyPattern.value); } catch { ElMessage.error(t('common.message.loadFailed')); } };

const handleViewValue = async (key: string) => {
  try { const res: any = await cacheApi.value(key); cacheValue.value = typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res); valueDialogRef.value?.showModal(); }
  catch { ElMessage.error(t('common.message.loadFailed')); }
};

const handleDeleteKey = async (key: string) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: key }), t('common.action.confirm'), { type: 'warning' });
  await cacheApi.delete(key); ElMessage.success(t('common.message.deleteSuccess')); loadKeys();
};

const handleClear = async () => {
  await ElMessageBox.confirm(t('common.message.confirmClean'), t('common.action.confirm'), { type: 'warning' });
  await cacheApi.clear(); ElMessage.success(t('common.message.cleanSuccess')); loadKeys();
};

onMounted(() => { loadInfo(); loadKeys(); });
</script>