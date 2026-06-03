<template>
  <div class="space-y-4">
    <!-- Dict type + data side-by-side -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Type panel -->
      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-sm">{{ t('system.dict.dictName') }}</h3>
            <button class="btn btn-xs btn-primary" @click="handleCreateType">{{ t('common.action.add') }}</button>
          </div>
          <div class="overflow-x-auto">
            <table class="table table-xs">
              <thead><tr class="bg-base-200 text-xs"><th>{{ t('system.dict.dictName') }}</th><th>{{ t('system.dict.dictCode') }}</th><th>{{ t('common.field.status') }}</th><th>{{ t('common.field.actions') }}</th></tr></thead>
              <tbody>
                <tr v-for="row in typeList" :key="row.id" class="cursor-pointer hover:bg-base-200" :class="{ 'bg-primary/10': currentTypeId === row.id }" @click="loadDataItems(row)">
                  <td class="text-xs">{{ row.name }}</td>
                  <td class="text-xs font-mono">{{ row.code }}</td>
                  <td><span class="badge badge-xs" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</span></td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-xs btn-ghost" @click.stop="handleEditType(row)">✏️</button>
                      <button class="btn btn-xs btn-ghost" @click.stop="handleDeleteType(row)">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Data panel -->
      <div class="lg:col-span-2 card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-sm">{{ t('system.dict.dictData') }} {{ currentTypeName ? `(${currentTypeName})` : '' }}</h3>
            <button class="btn btn-xs btn-primary" :disabled="!currentTypeId" @click="handleCreateData">{{ t('common.action.add') }}</button>
          </div>
          <div v-if="!currentTypeId" class="text-center text-base-content/40 py-8 text-sm">← 请先选择一个字典类型</div>
          <div v-else class="overflow-x-auto">
            <table class="table table-xs">
              <thead><tr class="bg-base-200 text-xs"><th>{{ t('system.dict.label') }}</th><th>{{ t('system.dict.value') }}</th><th>{{ t('common.field.sort') }}</th><th>{{ t('common.field.status') }}</th><th>{{ t('common.field.actions') }}</th></tr></thead>
              <tbody>
                <tr v-if="loading"><td colspan="5" class="text-center py-4"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
                <tr v-else-if="!dataList.length"><td colspan="5" class="text-center text-base-content/40 py-4 text-sm">No data</td></tr>
                <tr v-else v-for="row in dataList" :key="row.id" class="hover:bg-base-200/50">
                  <td class="text-xs">{{ row.label }}</td>
                  <td class="text-xs font-mono">{{ row.value }}</td>
                  <td class="text-xs">{{ row.sort }}</td>
                  <td><span class="badge badge-xs" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</span></td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-xs btn-ghost" @click="handleEditData(row)">✏️</button>
                      <button class="btn btn-xs btn-ghost" @click="handleDeleteData(row)">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Type dialog -->
    <dialog ref="typeDialogRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ typeForm.id ? t('system.dict.editDict') : t('system.dict.addDict') }}</h3>
        <form @submit.prevent="handleTypeSubmit" class="space-y-3">
          <label class="form-control"><div class="label"><span class="label-text">{{ t('system.dict.dictName') }} *</span></div><input v-model="typeForm.name" class="input input-bordered" required /></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('system.dict.dictCode') }} *</span></div><input v-model="typeForm.code" class="input input-bordered" :disabled="!!typeForm.id" required /></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('common.field.status') }}</span></div><div class="flex gap-4 pt-2"><label class="label cursor-pointer gap-2"><input type="radio" v-model="typeForm.status" :value="1" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.enabled') }}</span></label><label class="label cursor-pointer gap-2"><input type="radio" v-model="typeForm.status" :value="0" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.disabled') }}</span></label></div></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('common.field.remark') }}</span></div><textarea v-model="typeForm.remark" class="textarea textarea-bordered" rows="2"></textarea></label>
          <div class="flex justify-end gap-2 pt-2"><button type="button" class="btn" @click="typeDialogRef?.close()">{{ t('common.action.cancel') }}</button><button type="submit" class="btn btn-primary">{{ t('common.action.confirm') }}</button></div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <!-- Data dialog -->
    <dialog ref="dataDialogRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ dataForm.id ? t('system.dict.editData') : t('system.dict.addData') }}</h3>
        <form @submit.prevent="handleDataSubmit" class="space-y-3">
          <label class="form-control"><div class="label"><span class="label-text">{{ t('system.dict.label') }} *</span></div><input v-model="dataForm.label" class="input input-bordered" required /></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('system.dict.value') }} *</span></div><input v-model="dataForm.value" class="input input-bordered" required /></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('common.field.sort') }}</span></div><input v-model.number="dataForm.sort" type="number" min="0" class="input input-bordered" /></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('common.field.status') }}</span></div><div class="flex gap-4 pt-2"><label class="label cursor-pointer gap-2"><input type="radio" v-model="dataForm.status" :value="1" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.enabled') }}</span></label><label class="label cursor-pointer gap-2"><input type="radio" v-model="dataForm.status" :value="0" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.disabled') }}</span></label></div></label>
          <label class="form-control"><div class="label"><span class="label-text">{{ t('common.field.remark') }}</span></div><textarea v-model="dataForm.remark" class="textarea textarea-bordered" rows="2"></textarea></label>
          <div class="flex justify-end gap-2 pt-2"><button type="button" class="btn" @click="dataDialogRef?.close()">{{ t('common.action.cancel') }}</button><button type="submit" class="btn btn-primary">{{ t('common.action.confirm') }}</button></div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { dictApi } from '@/api/system/dict';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const typeList = ref<any[]>([]);
const dataList = ref<any[]>([]);
const currentTypeId = ref<number>();
const currentTypeName = ref('');
const typeDialogRef = ref<HTMLDialogElement>();
const dataDialogRef = ref<HTMLDialogElement>();
const typeForm = reactive<any>({ id: undefined, name: '', code: '', status: 1, remark: '' });
const dataForm = reactive<any>({ id: undefined, dictTypeId: 0, label: '', value: '', sort: 0, status: 1, remark: '' });

const loadTypes = async () => { const res: any = await dictApi.typeList({}); typeList.value = res; };
const loadDataItems = async (row: any) => {
  currentTypeId.value = row.id; currentTypeName.value = row.name; loading.value = true;
  try { const res: any = await dictApi.dataList(row.id); dataList.value = res; }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const handleCreateType = () => { Object.assign(typeForm, { id: undefined, name: '', code: '', status: 1, remark: '' }); typeDialogRef.value?.showModal(); };
const handleEditType = (row: any) => { Object.assign(typeForm, row); typeDialogRef.value?.showModal(); };
const handleTypeSubmit = async () => {
  try {
    if (typeForm.id) { await dictApi.typeUpdate({ id: typeForm.id, name: typeForm.name, status: typeForm.status, remark: typeForm.remark }); ElMessage.success(t('common.message.updateSuccess')); }
    else { await dictApi.typeCreate({ name: typeForm.name, code: typeForm.code, status: typeForm.status, remark: typeForm.remark }); ElMessage.success(t('common.message.addSuccess')); }
    typeDialogRef.value?.close(); loadTypes();
  } catch (e: any) { ElMessage.error(e.message); }
};
const handleDeleteType = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await dictApi.typeDelete(row.id); ElMessage.success(t('common.message.deleteSuccess'));
  if (currentTypeId.value === row.id) { currentTypeId.value = undefined; dataList.value = []; }
  loadTypes();
};

const handleCreateData = () => { Object.assign(dataForm, { id: undefined, dictTypeId: currentTypeId.value, label: '', value: '', sort: 0, status: 1, remark: '' }); dataDialogRef.value?.showModal(); };
const handleEditData = (row: any) => { Object.assign(dataForm, { id: row.id, dictTypeId: row.dictTypeId, label: row.label, value: row.value, sort: row.sort, status: row.status, remark: row.remark }); dataDialogRef.value?.showModal(); };
const handleDataSubmit = async () => {
  try {
    if (dataForm.id) { await dictApi.dataUpdate(dataForm); ElMessage.success(t('common.message.updateSuccess')); }
    else { await dictApi.dataCreate(dataForm); ElMessage.success(t('common.message.addSuccess')); }
    dataDialogRef.value?.close(); if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
  } catch (e: any) { ElMessage.error(e.message); }
};
const handleDeleteData = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.label }), t('common.action.confirm'), { type: 'warning' });
  await dictApi.dataDelete(row.id); ElMessage.success(t('common.message.deleteSuccess'));
  if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
};

onMounted(() => loadTypes());
</script>
