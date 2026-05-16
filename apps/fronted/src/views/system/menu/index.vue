<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.name" :placeholder="t('system.menu.placeholderName')" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.type" :placeholder="t('common.field.type')" style="width: 120px" clearable @clear="loadData"
      >
        <el-option :label="t('system.menu.typeDir')" :value="1" />
        <el-option :label="t('system.menu.typeMenu')" :value="2" />
        <el-option :label="t('system.menu.typeBtn')" :value="3" />
      </el-select>
      <el-select v-model="queryParams.status" :placeholder="t('common.field.status')" style="width: 120px" clearable @clear="loadData"
      >
        <el-option :label="t('common.status.enabled')" :value="1" />
        <el-option :label="t('common.status.disabled')" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData"
      >{{ t('common.action.search') }}</el-button
      >
      <el-button :icon="Refresh" @click="resetQuery">{{ t('common.action.reset') }}</el-button
      >
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate(0)"
      >{{ t('system.menu.addMenu') }}</el-button
      >
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id" default-expand-all>
      <el-table-column prop="name" :label="t('system.menu.menuName')" width="200" />
      <el-table-column prop="type" :label="t('system.menu.type')" width="100">
        <template #default="{ row }">
          <el-tag>{{ ['', t('system.menu.typeDir'), t('system.menu.typeMenu'), t('system.menu.typeBtn')][row.type] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" :label="t('system.menu.path')" />
      <el-table-column prop="component" :label="t('system.menu.component')" />
      <el-table-column prop="perms" :label="t('system.menu.permission')" width="180" />
      <el-table-column prop="icon" :label="t('system.menu.icon')" width="100" />
      <el-table-column prop="sort" :label="t('common.field.sort')" width="80" />
      <el-table-column prop="status" :label="t('common.field.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'"
          >{{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.field.actions')" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Plus" @click="handleCreate(row.id)" v-if="row.type !== 3"
          >{{ t('common.action.add') }}</el-button
          >
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)"
          >{{ t('common.action.edit') }}</el-button
          >
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)"
          >{{ t('common.action.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="t('system.menu.parentMenu')">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            check-strictly
            clearable
            :placeholder="t('system.dept.rootDept')"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('system.menu.type')" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">{{ t('system.menu.typeDir') }}</el-radio>
            <el-radio :label="2">{{ t('system.menu.typeMenu') }}</el-radio>
            <el-radio :label="3">{{ t('system.menu.typeBtn') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('system.menu.menuName')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('system.menu.path')" prop="path" v-if="form.type !== 3">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item :label="t('system.menu.component')" v-if="form.type === 2">
          <el-input v-model="form.component" />
        </el-form-item>
        <el-form-item :label="t('system.menu.permission')" v-if="form.type === 3">
          <el-input v-model="form.perms" />
        </el-form-item>
        <el-form-item :label="t('system.menu.icon')" v-if="form.type !== 3">
          <el-input v-model="form.icon" />
        </el-form-item>
        <el-form-item :label="t('system.menu.visible')" v-if="form.type !== 3">
          <el-switch v-model="form.show" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item :label="t('system.menu.keepAlive')" v-if="form.type === 2">
          <el-switch v-model="form.keepAlive" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item :label="t('common.field.sort')">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :label="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { menuApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const menuTree = ref<any[]>([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref<FormInstance>();

const queryParams = reactive({ name: '', type: undefined as number | undefined, status: undefined as number | undefined });
const form = reactive<any>({ id: undefined, parentId: 0, type: 1, name: '', path: '', component: '', perms: '', icon: '', sort: 0, status: 1, show: 1, keepAlive: 0, external: 0 });
const rules = { name: [{ required: true, message: t('system.menu.placeholderName'), trigger: 'blur' }] };

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await menuApi.list(queryParams);
    tableData.value = res;
    await loadMenuTree();
  } catch (e) { ElMessage.error(t('common.message.loadFailed')); }
  finally { loading.value = false; }
};

const loadMenuTree = async () => {
  const res: any = await menuApi.tree();
  menuTree.value = [{ id: 0, name: t('system.dept.rootDept'), children: res }];
};

const resetQuery = () => {
  queryParams.name = '';
  queryParams.type = undefined;
  queryParams.status = undefined;
  loadData();
};

const handleCreate = (parentId: number) => {
  Object.assign(form, { id: undefined, parentId: parentId || 0, type: 1, name: '', path: '', component: '', perms: '', icon: '', sort: 0, status: 1, show: 1, keepAlive: 0, external: 0 });
  dialogTitle.value = parentId ? t('system.menu.addMenu') : t('system.menu.addMenu');
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, parentId: row.parentId, type: row.type, name: row.name, path: row.path, component: row.component, perms: row.perms, icon: row.icon, sort: row.sort, status: row.status, show: row.show, keepAlive: row.keepAlive, external: row.external });
  dialogTitle.value = t('system.menu.editMenu');
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) { await menuApi.update(form); ElMessage.success(t('common.message.updateSuccess')); }
      else { await menuApi.create(form); ElMessage.success(t('common.message.addSuccess')); }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await menuApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => loadData());
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
</style>