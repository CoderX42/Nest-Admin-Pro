<template>
  <div class="space-y-4">
    <!-- Search & toolbar -->
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.role.roleName') }}</span></label>
          <input v-model="queryParams.name" :placeholder="t('system.role.placeholderName')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
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
        <button class="btn btn-sm btn-primary" @click="handleCreate">{{ t('system.role.addRole') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-16">{{ t('common.field.id') }}</th>
              <th>{{ t('system.role.roleName') }}</th>
              <th>{{ t('system.role.roleCode') }}</th>
              <th class="w-40">{{ t('system.role.dataScope') }}</th>
              <th class="w-20">{{ t('common.field.status') }}</th>
              <th class="w-36">{{ t('common.field.createTime') }}</th>
              <th class="w-72">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <tr v-else-if="!tableData.length"><td colspan="7" class="text-center text-base-content/40 py-8">No data</td></tr>
            <tr v-for="row in tableData" :key="row.id" class="hover:bg-base-200/50">
              <td class="text-xs">{{ row.id }}</td>
              <td class="text-sm font-medium">{{ row.name }}</td>
              <td class="text-xs font-mono">{{ row.code }}</td>
              <td><span class="badge badge-sm badge-ghost">{{ getDataScopeLabel(row.dataScope) }}</span></td>
              <td><input type="checkbox" class="toggle toggle-sm toggle-success" :checked="row.status === 1" @change="(e) => handleStatusChange(row, (e.target as HTMLInputElement).checked ? 1 : 0)" /></td>
              <td class="text-xs text-base-content/60">{{ row.createTime }}</td>
              <td>
                <div class="flex gap-1 flex-wrap">
                  <button class="btn btn-xs btn-primary" @click="handleEdit(row)">{{ t('common.action.edit') }}</button>
                  <button class="btn btn-xs btn-warning" @click="handleAssignPerm(row)">{{ t('common.action.assignPerm') }}</button>
                  <button class="btn btn-xs btn-error" @click="handleDelete(row)">{{ t('common.action.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-base-300">
        <span class="text-sm text-base-content/60">共 {{ total }} 条</span>
        <div class="join">
          <button class="join-item btn btn-sm" :disabled="queryParams.page <= 1" @click="queryParams.page--; loadData()">«</button>
          <button class="join-item btn btn-sm btn-active" disabled>{{ queryParams.page }}</button>
          <button class="join-item btn btn-sm" :disabled="queryParams.page * queryParams.limit >= total" @click="queryParams.page++; loadData()">»</button>
          <select class="join-item btn btn-sm" v-model="queryParams.limit" @change="loadData">
            <option :value="10">10/页</option>
            <option :value="20">20/页</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Edit dialog -->
    <dialog ref="editDialogRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{{ form.id ? t('system.role.editRole') : t('system.role.addRole') }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.role.roleName') }}</span></div>
            <input v-model="form.name" class="input input-bordered" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.role.roleCode') }}</span></div>
            <input v-model="form.code" class="input input-bordered" :disabled="!!form.id" required />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.role.dataScope') }}</span></div>
            <select v-model="form.dataScope" class="select select-bordered">
              <option :value="1">{{ t('system.role.scopeAll') }}</option>
              <option :value="2">{{ t('system.role.scopeCustom') }}</option>
              <option :value="3">{{ t('system.role.scopeDept') }}</option>
              <option :value="4">{{ t('system.role.scopeDeptChild') }}</option>
              <option :value="5">{{ t('system.role.scopeSelf') }}</option>
            </select>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('common.field.status') }}</span></div>
            <div class="flex gap-4 pt-2">
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.status" :value="1" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.enabled') }}</span></label>
              <label class="label cursor-pointer gap-2"><input type="radio" v-model="form.status" :value="0" class="radio radio-sm radio-primary" /><span class="label-text">{{ t('common.status.disabled') }}</span></label>
            </div>
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn" @click="editDialogRef?.close()">{{ t('common.action.cancel') }}</button>
            <button type="submit" class="btn btn-primary">{{ t('common.action.confirm') }}</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <!-- Permission dialog -->
    <dialog ref="permDialogRef" class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="font-bold text-lg mb-4">{{ t('system.role.assignPermissions') }}</h3>
        <el-tree ref="menuTreeRef" :data="menuTree" :props="{ label: 'name', children: 'children' }" show-checkbox node-key="id" default-expand-all />
        <template v-if="currentDataScope === 2">
          <hr class="my-3 border-base-300" />
          <div class="text-sm font-semibold mb-2">{{ t('system.role.dataScope') }}</div>
          <el-tree ref="deptTreeRef" :data="deptTree" :props="{ label: 'name', children: 'children' }" show-checkbox node-key="id" default-expand-all />
        </template>
        <div class="flex justify-end gap-2 pt-4">
          <button class="btn" @click="permDialogRef?.close()">{{ t('common.action.cancel') }}</button>
          <button class="btn btn-primary" @click="handlePermSubmit">{{ t('common.action.confirm') }}</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { roleApi, menuApi, deptApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ElTree } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ name: '', status: undefined as number | undefined, page: 1, limit: 10 });
const editDialogRef = ref<HTMLDialogElement>();
const permDialogRef = ref<HTMLDialogElement>();
const formRef = ref<any>();
const menuTreeRef = ref<InstanceType<typeof ElTree>>();
const deptTreeRef = ref<InstanceType<typeof ElTree>>();

const form = reactive<any>({ id: undefined, name: '', code: '', dataScope: 1, status: 1 });
const currentRoleId = ref<number>();
const currentDataScope = ref(1);
const menuTree = ref<any[]>([]);
const deptTree = ref<any[]>([]);

const getDataScopeLabel = (scope: number) =>
  [t('system.role.scopeAll'), t('system.role.scopeCustom'), t('system.role.scopeDept'), t('system.role.scopeDeptChild'), t('system.role.scopeSelf')][scope - 1] || '';

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await roleApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

onMounted(() => { loadData(); loadMenuTree(); loadDeptTree(); });

const loadMenuTree = async () => { const res: any = await menuApi.tree(); menuTree.value = res; };
const loadDeptTree = async () => { const res: any = await deptApi.tree(); deptTree.value = res; };
const resetQuery = () => { queryParams.name = ''; queryParams.status = undefined; queryParams.page = 1; loadData(); };

const handleCreate = () => {
  Object.assign(form, { id: undefined, name: '', code: '', dataScope: 1, status: 1 });
  editDialogRef.value?.showModal();
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, name: row.name, code: row.code, dataScope: row.dataScope, status: row.status });
  editDialogRef.value?.showModal();
};

const handleSubmit = async () => {
  try {
    if (form.id) { await roleApi.update({ id: form.id, name: form.name, dataScope: form.dataScope, status: form.status }); ElMessage.success(t('common.message.updateSuccess')); }
    else { await roleApi.create({ name: form.name, code: form.code, dataScope: form.dataScope }); ElMessage.success(t('common.message.addSuccess')); }
    editDialogRef.value?.close();
    loadData();
  } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
};

const handleAssignPerm = async (row: any) => {
  currentRoleId.value = row.id;
  currentDataScope.value = row.dataScope;
  await Promise.all([loadMenuTree(), loadDeptTree()]);
  const res: any = await roleApi.getRoleMenus(row.id);
  permDialogRef.value?.showModal();
  setTimeout(() => {
    menuTreeRef.value?.setCheckedKeys((res.menuIds || []).map((id: string) => parseInt(id)), false);
    deptTreeRef.value?.setCheckedKeys((res.deptIds || []).map((id: string) => parseInt(id)), false);
  }, 100);
};

const handlePermSubmit = async () => {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys() || [];
  const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || [];
  const deptKeys = currentDataScope.value === 2 ? deptTreeRef.value?.getCheckedKeys() || [] : [];
  await roleApi.assignPermissions(currentRoleId.value!, [...checkedKeys, ...halfCheckedKeys].map(String), deptKeys.map(String));
  ElMessage.success(t('common.message.updateSuccess'));
  permDialogRef.value?.close();
};

const handleStatusChange = async (row: any, status: number) => {
  try { await roleApi.changeStatus(row.id, status); ElMessage.success(t('common.message.statusUpdateSuccess')); }
  catch (e: any) { row.status = status === 1 ? 0 : 1; ElMessage.error(e.message || t('common.message.failed')); }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await roleApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};
</script>