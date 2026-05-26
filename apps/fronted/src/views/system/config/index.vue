<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.config.configKey') }}</span></label>
          <input v-model="queryParams.key" :placeholder="t('system.config.configKey')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <button class="btn btn-sm btn-primary" @click="loadData">{{ t('common.action.search') }}</button>
        <button class="btn btn-sm btn-success" @click="handleRefresh">{{ t('common.action.refresh') }}</button>
        <button class="btn btn-sm btn-primary" @click="handleCreate">{{ t('system.config.addConfig') }}</button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th>{{ t('system.config.configName') }}</th>
              <th>{{ t('system.config.configKey') }}</th>
              <th>{{ t('system.config.configValue') }}</th>
              <th class="w-20">{{ t('common.field.type') }}</th>
              <th class="w-20">{{ t('common.field.status') }}</th>
              <th class="w-40">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="7" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.id" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td class="text-sm">{{ row.name }}</td>
              <td class="text-xs font-mono">{{ row.key }}</td>
              <td class="text-xs truncate max-w-xs" :title="row.value">{{ row.value }}</td>
              <td><span class="badge badge-sm badge-ghost">{{ row.type }}</span></td>
              <td><span class="badge badge-sm" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</span></td>
              <td>
                <div class="flex gap-1">
                  <button class="btn btn-xs btn-primary" @click="handleEdit(row)">{{ t('common.action.edit') }}</button>
                  <button class="btn btn-xs btn-error" @click="handleDelete(row)">{{ t('common.action.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <dialog ref="dialogRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ form.id ? t('system.config.editConfig') : t('system.config.addConfig') }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.config.configName') }} *</span></div>
            <input v-model="form.name" class="input input-bordered" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.config.configKey') }} *</span></div>
            <input v-model="form.key" class="input input-bordered" :disabled="!!form.id" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.config.configValue') }} *</span></div>
            <textarea v-model="form.value" class="textarea textarea-bordered" rows="3" required></textarea>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('common.field.type') }}</span></div>
            <select v-model="form.type" class="select select-bordered">
              <option value="string">{{ t('system.config.typeString') }}</option>
              <option value="number">{{ t('system.config.typeNumber') }}</option>
              <option value="boolean">{{ t('system.config.typeBoolean') }}</option>
            </select>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('common.field.status') }}</span></div>
            <div class="flex gap-4 pt-2">
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.status" :value="1" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.enabled') }}</span></label>
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.status" :value="0" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.disabled') }}</span></label>
            </div>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('common.field.remark') }}</span></div>
            <textarea v-model="form.remark" class="textarea textarea-bordered" rows="2"></textarea>
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn" @click="dialogRef?.close()">{{ t('common.action.cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ t('common.action.confirm') }}</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { configApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogRef = ref<HTMLDialogElement>();
const queryParams = reactive({ key: '' });
const form = reactive<any>({ id: undefined, name: '', key: '', value: '', type: 'string', status: 1, remark: '' });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await configApi.list(queryParams); tableData.value = res; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleCreate = () => { Object.assign(form, { id: undefined, name: '', key: '', value: '', type: 'string', status: 1, remark: '' }); dialogRef.value?.showModal(); };
const handleEdit = (row: any) => { Object.assign(form, row); dialogRef.value?.showModal(); };

const handleSubmit = async () => {
  try {
    if (form.id) { await configApi.update({ id: form.id, name: form.name, value: form.value, type: form.type, status: form.status, remark: form.remark }); ElMessage.success(t('common.message.updateSuccess')); }
    else { await configApi.create({ name: form.name, key: form.key, value: form.value, type: form.type, status: form.status, remark: form.remark }); ElMessage.success(t('common.message.addSuccess')); }
    dialogRef.value?.close(); loadData();
  } catch (e: any) { ElMessage.error(e.message); }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await configApi.delete(row.id); ElMessage.success(t('common.message.deleteSuccess')); loadData();
};

const handleRefresh = async () => { await configApi.refresh(); ElMessage.success(t('common.message.success')); };

onMounted(() => loadData());
</script>