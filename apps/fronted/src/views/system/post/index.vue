<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.post.postName') }}</span></label>
          <input v-model="queryParams.name" :placeholder="t('system.post.placeholderName')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <div class="form-control min-w-32">
          <label class="label py-0"><span class="label-text text-xs">{{ t('common.field.status') }}</span></label>
          <select v-model="queryParams.status" class="select select-bordered select-sm w-full">
            <option :value="undefined">—</option>
            <option :value="1">{{ t('common.status.enabled') }}</option>
            <option :value="0">{{ t('common.status.disabled') }}</option>
          </select>
        </div>
        <button class="btn btn-sm btn-primary" @click="loadData">{{ t('common.action.search') }}</button>
        <button class="btn btn-sm" @click="resetQuery">{{ t('common.action.reset') }}</button>
        <button class="btn btn-sm btn-primary" @click="handleCreate">{{ t('system.post.addPost') }}</button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th>{{ t('system.post.postName') }}</th>
              <th>{{ t('system.post.postCode') }}</th>
              <th class="w-20">{{ t('common.field.sort') }}</th>
              <th class="w-20">{{ t('common.field.status') }}</th>
              <th class="w-36">{{ t('common.field.createTime') }}</th>
              <th class="w-40">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="7" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.id" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td class="text-sm">{{ row.name }}</td>
              <td class="text-xs font-mono">{{ row.code }}</td>
              <td class="text-xs">{{ row.sort }}</td>
              <td><span class="badge badge-sm" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</span></td>
              <td class="text-xs text-base-content/60">{{ row.createTime }}</td>
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

    <dialog ref="dialogRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ form.id ? t('system.post.editPost') : t('system.post.addPost') }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.post.postName') }} *</span></div>
            <input v-model="form.name" class="input input-bordered" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.post.postCode') }} *</span></div>
            <input v-model="form.code" class="input input-bordered" :disabled="!!form.id" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('common.field.sort') }}</span></div>
            <input v-model.number="form.sort" type="number" min="0" class="input input-bordered" />
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
import { postApi } from '@/api/system/post';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ name: '', status: undefined as number | undefined, page: 1, limit: 10 });
const dialogRef = ref<HTMLDialogElement>();
const form = reactive<any>({ id: undefined, name: '', code: '', sort: 0, status: 1, remark: '' });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await postApi.list(queryParams); tableData.value = res.items || []; total.value = res.total || 0; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};
const resetQuery = () => { queryParams.name = ''; queryParams.status = undefined; queryParams.page = 1; loadData(); };
const handleCreate = () => { Object.assign(form, { id: undefined, name: '', code: '', sort: 0, status: 1, remark: '' }); dialogRef.value?.showModal(); };
const handleEdit = (row: any) => { Object.assign(form, { id: row.id, name: row.name, code: row.code, sort: row.sort, status: row.status, remark: row.remark }); dialogRef.value?.showModal(); };
const handleSubmit = async () => {
  try {
    if (form.id) { await postApi.update({ id: form.id, name: form.name, sort: form.sort, status: form.status, remark: form.remark }); ElMessage.success(t('common.message.updateSuccess')); }
    else { await postApi.create({ name: form.name, code: form.code, sort: form.sort, status: form.status, remark: form.remark }); ElMessage.success(t('common.message.addSuccess')); }
    dialogRef.value?.close(); loadData();
  } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
};
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await postApi.delete(row.id); ElMessage.success(t('common.message.deleteSuccess')); loadData();
};
onMounted(() => loadData());
</script>
