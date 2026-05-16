<template>
  <div class="page-container">
    <div class="search-bar">
      <el-input v-model="queryParams.name" :placeholder="t('system.role.placeholderName')" style="width: 200px" clearable @clear="loadData" />
      <el-select v-model="queryParams.status" :placeholder="t('common.field.status')" style="width: 120px" clearable @clear="loadData"
      >
        <el-option :label="t('common.status.enabled')" :value="1" />
        <el-option :label="t('common.status.disabled')" :value="0" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadData"
      >{{ t('common.action.search') }}</el-button
      >
      <el-button :icon="Refresh" @click="resetQuery"
      >{{ t('common.action.reset') }}</el-button
      >
    </div>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleCreate"
      >{{ t('system.role.addRole') }}</el-button
      >
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id"
    >
      <el-table-column prop="id" :label="t('common.field.id')" width="80" />
      <el-table-column prop="name" :label="t('system.role.roleName')" />
      <el-table-column prop="code" :label="t('system.role.roleCode')" />
      <el-table-column prop="dataScope" :label="t('system.role.dataScope')" width="180"
      >
        <template #default="{ row }"
        >
          <el-tag>{{ getDataScopeLabel(row.dataScope) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('common.field.status')" width="100"
      >
        <template #default="{ row }"
        >
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="(status: number) => handleStatusChange(row, status)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" :label="t('common.field.createTime')" width="180" />
      <el-table-column :label="t('common.field.actions')" width="280" fixed="right"
      >
        <template #default="{ row }"
        >
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)"
          >{{ t('common.action.edit') }}</el-button
          >
          <el-button size="small" type="warning" :icon="Key" @click="handleAssignPerm(row)"
          >{{ t('common.action.assignPerm') }}</el-button
          >
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)"
          >{{ t('common.action.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.limit" :total="total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="loadData" @current-change="loadData" style="margin-top: 16px" />

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.role.editRole') : t('system.role.addRole')" width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px"
      >
        <el-form-item :label="t('system.role.roleName')" prop="name"
        >
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('system.role.roleCode')" prop="code"
        >
          <el-input v-model="form.code" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item :label="t('system.role.dataScope')"
        >
          <el-select v-model="form.dataScope" style="width: 100%"
          >
            <el-option :label="t('system.role.scopeAll')" :value="1" />
            <el-option :label="t('system.role.scopeCustom')" :value="2" />
            <el-option :label="t('system.role.scopeDept')" :value="3" />
            <el-option :label="t('system.role.scopeDeptChild')" :value="4" />
            <el-option :label="t('system.role.scopeSelf')" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.field.status')"
        >
          <el-radio-group v-model="form.status"
          >
            <el-radio :label="1"
            >{{ t('common.status.enabled') }}</el-radio
            >
            <el-radio :label="0"
            >{{ t('common.status.disabled') }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false"
        >{{ t('common.action.cancel') }}</el-button
        >
        <el-button type="primary" @click="handleSubmit"
        >{{ t('common.action.confirm') }}</el-button
        >
      </template>
    </el-dialog>

    <!-- Permission Dialog -->
    <el-dialog v-model="permDialogVisible" :title="t('system.role.assignPermissions')" width="500px"
    >
      <el-tree ref="menuTreeRef" :data="menuTree" :props="{ label: 'name', children: 'children' }" show-checkbox node-key="id" default-expand-all />
      <template v-if="currentDataScope === 2"
      >
        <el-divider />
        <div class="perm-section-title"
        >{{ t('system.role.dataScope') }}</div>
        <el-tree ref="deptTreeRef" :data="deptTree" :props="{ label: 'name', children: 'children' }" show-checkbox node-key="id" default-expand-all />
      </template>
      <template #footer>
        <el-button @click="permDialogVisible = false"
        >{{ t('common.action.cancel') }}</el-button
        >
        <el-button type="primary" @click="handlePermSubmit"
        >{{ t('common.action.confirm') }}</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { roleApi, menuApi, deptApi } from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh, Key } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import type { ElTree } from 'element-plus';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({ name: '', status: undefined as number | undefined, page: 1, limit: 10 });
const dialogVisible = ref(false);
const permDialogVisible = ref(false);
const formRef = ref<FormInstance>();
const menuTreeRef = ref<InstanceType<typeof ElTree>>();
const deptTreeRef = ref<InstanceType<typeof ElTree>>();

const form = reactive<any>({ id: undefined, name: '', code: '', dataScope: 1, status: 1 });
const currentRoleId = ref<number>();
const currentDataScope = ref(1);
const menuTree = ref<any[]>([]);
const deptTree = ref<any[]>([]);
const rules = { name: [{ required: true, message: t('system.role.placeholderName'), trigger: 'blur' }], code: [{ required: true, message: 'Please enter role code', trigger: 'blur' }] };

const getDataScopeLabel = (scope: number) =>
  [t('system.role.scopeAll'), t('system.role.scopeCustom'), t('system.role.scopeDept'), t('system.role.scopeDeptChild'), t('system.role.scopeSelf')][scope - 1] || '';

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await roleApi.list(queryParams);
    tableData.value = res.items;
    total.value = res.total;
  } catch (e) {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const loadMenuTree = async () => {
  const res: any = await menuApi.tree();
  menuTree.value = res;
};

const loadDeptTree = async () => {
  const res: any = await deptApi.tree();
  deptTree.value = res;
};

const resetQuery = () => { queryParams.name = ''; queryParams.status = undefined; loadData(); };

const handleCreate = () => {
  Object.assign(form, { id: undefined, name: '', code: '', dataScope: 1, status: 1 });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, name: row.name, code: row.code, dataScope: row.dataScope, status: row.status });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await roleApi.update({ id: form.id, name: form.name, dataScope: form.dataScope, status: form.status });
        ElMessage.success(t('common.message.updateSuccess'));
      }
      else {
        await roleApi.create({ name: form.name, code: form.code, dataScope: form.dataScope });
        ElMessage.success(t('common.message.addSuccess'));
      }
      dialogVisible.value = false;
      loadData();
    } catch (e: any) { ElMessage.error(e.message || t('common.message.failed')); }
  });
};

const handleAssignPerm = async (row: any) => {
  currentRoleId.value = row.id;
  currentDataScope.value = row.dataScope;
  await Promise.all([loadMenuTree(), loadDeptTree()]);
  const res: any = await roleApi.getRoleMenus(row.id);
  permDialogVisible.value = true;
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
  permDialogVisible.value = false;
};

const handleStatusChange = async (row: any, status: number) => {
  try {
    await roleApi.changeStatus(row.id, status);
    ElMessage.success(t('common.message.statusUpdateSuccess'));
  } catch (e: any) {
    row.status = status === 1 ? 0 : 1;
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await roleApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => { loadData(); loadMenuTree(); loadDeptTree(); });
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
.perm-section-title { margin-bottom: 12px; font-weight: 600; color: var(--text); }
</style>