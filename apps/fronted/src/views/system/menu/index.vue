<template>
  <div class="space-y-4">
    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="form-control flex-1 min-w-48">
          <label class="label py-0"><span class="label-text text-xs">{{ t('system.menu.menuName') }}</span></label>
          <input v-model="queryParams.name" :placeholder="t('system.menu.placeholderName')" class="input input-bordered input-sm w-full" @keyup.enter="loadData" />
        </div>
        <div class="form-control min-w-32">
          <label class="label py-0"><span class="label-text text-xs">{{ t('common.field.type') }}</span></label>
          <select v-model="queryParams.type" class="select select-bordered select-sm w-full">
            <option :value="undefined">—</option>
            <option :value="1">{{ t('system.menu.typeDir') }}</option>
            <option :value="2">{{ t('system.menu.typeMenu') }}</option>
            <option :value="3">{{ t('system.menu.typeBtn') }}</option>
          </select>
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
        <button class="btn btn-sm btn-primary" @click="handleCreate(0)">{{ t('system.menu.addMenu') }}</button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200 text-xs">
              <th class="w-40">{{ t('system.menu.menuName') }}</th>
              <th class="w-20">{{ t('common.field.type') }}</th>
              <th>{{ t('system.menu.path') }}</th>
              <th>{{ t('system.menu.component') }}</th>
              <th class="w-32">{{ t('system.menu.permission') }}</th>
              <th class="w-20">{{ t('common.field.sort') }}</th>
              <th class="w-20">{{ t('common.field.status') }}</th>
              <th class="w-64">{{ t('common.field.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="8" class="text-center py-8"><span class="loading loading-spinner loading-sm text-primary"></span></td></tr>
            <template v-else>
              <template v-for="row in tableData" :key="row.id">
                <tr class="hover:bg-base-200/50">
                  <td class="text-sm font-medium">{{ row.name }}</td>
                  <td><span class="badge badge-sm badge-ghost">{{ ['', t('system.menu.typeDir'), t('system.menu.typeMenu'), t('system.menu.typeBtn')][row.type] }}</span></td>
                  <td class="text-xs font-mono">{{ row.path || '-' }}</td>
                  <td class="text-xs">{{ row.component || '-' }}</td>
                  <td class="text-xs font-mono">{{ row.perms || '-' }}</td>
                  <td class="text-xs">{{ row.sort }}</td>
                  <td><span class="badge badge-sm" :class="row.status === 1 ? 'badge-success' : 'badge-error'">{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</span></td>
                  <td>
                    <div class="flex gap-1 flex-wrap">
                      <button v-if="row.type !== 3" class="btn btn-xs btn-ghost" @click="handleCreate(row.id)">+</button>
                      <button class="btn btn-xs btn-primary" @click="handleEdit(row)">{{ t('common.action.edit') }}</button>
                      <button class="btn btn-xs btn-error" @click="handleDelete(row)">{{ t('common.action.delete') }}</button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <dialog ref="dialogRef" class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="font-bold text-lg mb-4">{{ form.id ? t('system.menu.editMenu') : t('system.menu.addMenu') }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.parentMenu') }}</span></div>
            <el-tree-select v-model="form.parentId" :data="menuTree" :props="{ label: 'name', value: 'id', children: 'children' }" check-strictly clearable :placeholder="t('system.dept.rootDept')" class="w-full" />
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.type') }} *</span></div>
            <div class="flex gap-4 pt-2">
              <label v-for="(label, idx) in [t('system.menu.typeDir'), t('system.menu.typeMenu'), t('system.menu.typeBtn')]" :key="idx" class="label cursor-pointer gap-2">
                <input type="radio" v-model="form.type" :value="idx + 1" class="radio radio-sm radio-primary" />
                <span class="label-text text-sm">{{ label }}</span>
              </label>
            </div>
          </label>
          <label class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.menuName') }} *</span></div>
            <input v-model="form.name" class="input input-bordered" required />
          </label>
          <label v-if="form.type !== 3" class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.path') }} *</span></div>
            <input v-model="form.path" class="input input-bordered" />
          </label>
          <label v-if="form.type === 2" class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.component') }}</span></div>
            <input v-model="form.component" class="input input-bordered" placeholder="system/user/index" />
          </label>
          <label v-if="form.type === 3" class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.permission') }}</span></div>
            <input v-model="form.perms" class="input input-bordered" placeholder="sys:user:list" />
          </label>
          <label v-if="form.type !== 3" class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.icon') }}</span></div>
            <input v-model="form.icon" class="input input-bordered" />
          </label>
          <label v-if="form.type !== 3" class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.visible') }}</span></div>
            <input type="checkbox" class="toggle" :checked="form.show === 1" @change="form.show = form.show === 1 ? 0 : 1" />
          </label>
          <label v-if="form.type === 2" class="form-control">
            <div class="label"><span class="label-text">{{ t('system.menu.keepAlive') }}</span></div>
            <input type="checkbox" class="toggle" :checked="form.keepAlive === 1" @change="form.keepAlive = form.keepAlive === 1 ? 0 : 1" />
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
import { menuApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const menuTree = ref<any[]>([]);
const dialogRef = ref<HTMLDialogElement>();
const queryParams = reactive({ name: '', type: undefined as number | undefined, status: undefined as number | undefined });
const form = reactive<any>({ id: undefined, parentId: 0, type: 1, name: '', path: '', component: '', perms: '', icon: '', sort: 0, status: 1, show: 1, keepAlive: 0 });

const loadData = async () => {
  loading.value = true;
  try { const res: any = await menuApi.list(queryParams); tableData.value = res; await loadMenuTree(); }
  catch { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const loadMenuTree = async () => { const res: any = await menuApi.tree(); menuTree.value = [{ id: 0, name: t('system.dept.rootDept'), children: res }]; };
const resetQuery = () => { queryParams.name = ''; queryParams.type = undefined; queryParams.status = undefined; loadData(); };

const handleCreate = (parentId: number) => {
  Object.assign(form, { id: undefined, parentId: parentId || 0, type: 1, name: '', path: '', component: '', perms: '', icon: '', sort: 0, status: 1, show: 1, keepAlive: 0 });
  dialogRef.value?.showModal();
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, parentId: row.parentId, type: row.type, name: row.name, path: row.path, component: row.component, perms: row.perms, icon: row.icon, sort: row.sort, status: row.status, show: row.show, keepAlive: row.keepAlive });
  dialogRef.value?.showModal();
};

const handleSubmit = async () => {
  try {
    if (form.id) { await menuApi.update(form); ElMessage.success(t('common.message.updateSuccess')); }
    else { await menuApi.create(form); ElMessage.success(t('common.message.addSuccess')); }
    dialogRef.value?.close(); loadData();
  } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await menuApi.delete(row.id); ElMessage.success(t('common.message.deleteSuccess')); loadData();
};

onMounted(() => loadData());
</script>