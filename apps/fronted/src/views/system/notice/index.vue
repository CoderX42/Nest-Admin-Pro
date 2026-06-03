<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.notice.title') }}</span></label>
          <input v-model="queryParams.title" :placeholder="t('system.notice.placeholderTitle')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <div class="form-control min-w-32">
          <label class="label py-0"><span class="label-text text-xs">{{ t('common.field.type') }}</span></label>
          <select v-model="queryParams.type" class="select select-bordered select-sm w-full">
            <option :value="undefined">—</option>
            <option :value="1">{{ t('system.notice.typeNotice') }}</option>
            <option :value="2">{{ t('system.notice.typeAnnouncement') }}</option>
          </select>
        </div>
        <div class="form-control min-w-32">
          <label class="label py-0"><span class="label-text text-xs">{{ t('common.field.status') }}</span></label>
          <select v-model="queryParams.status" class="select select-bordered select-sm w-full">
            <option :value="undefined">—</option>
            <option :value="1">{{ t('common.status.normal') }}</option>
            <option :value="0">{{ t('common.status.closed') }}</option>
          </select>
        </div>
        <button class="btn btn-sm btn-primary" @click="loadData">{{ t('common.action.search') }}</button>
        <button class="btn btn-sm" @click="resetQuery">{{ t('common.action.reset') }}</button>
        <button class="btn btn-sm btn-primary" @click="handleCreate">{{ t('system.notice.addNotice') }}</button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th>{{ t('system.notice.title') }}</th>
              <th class="w-28">{{ t('common.field.type') }}</th>
              <th class="w-20">{{ t('common.field.status') }}</th>
              <th class="w-36">{{ t('system.notice.publishTime') }}</th>
              <th class="w-36">{{ t('common.field.createTime') }}</th>
              <th class="w-40">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="7" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.id" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td class="text-sm font-medium truncate max-w-xs" :title="row.title">{{ row.title }}</td>
              <td><span class="badge badge-sm" :class="row.type === 1 ? 'badge-success' : 'badge-warning'">{{ row.type === 1 ? t('system.notice.typeNotice') : t('system.notice.typeAnnouncement') }}</span></td>
              <td><span class="badge badge-sm" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.normal') : t('common.status.closed') }}</span></td>
              <td class="text-xs text-base-content/60">{{ row.publishTime }}</td>
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
      <div class="modal-box max-w-xl">
        <h3 class="font-bold text-lg mb-4">{{ form.id ? t('system.notice.editNotice') : t('system.notice.addNotice') }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.notice.title') }} *</span></div>
            <input v-model="form.title" class="input input-bordered" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.notice.type') }}</span></div>
            <div class="flex gap-4 pt-2">
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.type" :value="1" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('system.notice.typeNotice') }}</span></label>
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.type" :value="2" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('system.notice.typeAnnouncement') }}</span></label>
            </div>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.notice.content') }} *</span></div>
            <textarea v-model="form.content" class="textarea textarea-bordered" rows="6" required></textarea>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('common.field.status') }}</span></div>
            <div class="flex gap-4 pt-2">
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.status" :value="1" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.normal') }}</span></label>
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.status" :value="0" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.closed') }}</span></label>
            </div>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.notice.publishTime') }}</span></div>
            <el-date-picker v-model="form.publishTime" type="datetime" placeholder="Select datetime" class="w-full" />
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
import { noticeApi } from '@/api/system/notice';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ title: '', type: undefined as number | undefined, status: undefined as number | undefined, page: 1, limit: 10 });
const dialogRef = ref<HTMLDialogElement>();
const form = reactive<any>({ id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await noticeApi.list(queryParams); tableData.value = res.items || []; total.value = res.total || 0; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const resetQuery = () => { queryParams.title = ''; queryParams.type = undefined; queryParams.status = undefined; queryParams.page = 1; loadData(); };
const handleCreate = () => { Object.assign(form, { id: undefined, title: '', content: '', type: 1, status: 1, publishTime: '' }); dialogRef.value?.showModal(); };
const handleEdit = (row: any) => { Object.assign(form, { id: row.id, title: row.title, content: row.content, type: row.type, status: row.status, publishTime: row.publishTime || '' }); dialogRef.value?.showModal(); };

const handleSubmit = async () => {
  try {
    const payload = { id: form.id, title: form.title, content: form.content, type: form.type, status: form.status, publishTime: form.publishTime || undefined };
    if (form.id) { await noticeApi.update(payload); ElMessage.success(t('common.message.updateSuccess')); }
    else { const cp: any = { ...payload }; delete cp.id; await noticeApi.create(cp); ElMessage.success(t('common.message.addSuccess')); }
    dialogRef.value?.close(); loadData();
  } catch (e: any) { ElMessage.error(e.message); }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.title }), t('common.action.confirm'), { type: 'warning' });
  await noticeApi.delete(row.id); ElMessage.success(t('common.message.deleteSuccess')); loadData();
};

onMounted(() => loadData());
</script>
