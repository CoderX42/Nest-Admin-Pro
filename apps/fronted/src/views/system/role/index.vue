<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.role.roleName')">
          <el-input
            v-model="queryParams.name"
            :placeholder="t('system.role.placeholderName')"
            clearable
            @keyup.enter="loadData"
          />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-select v-model="queryParams.status" clearable class="filter-select">
            <el-option :label="t('common.status.enabled')" :value="1" />
            <el-option :label="t('common.status.disabled')" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">{{ t('common.action.search') }}</el-button>
          <el-button :icon="Refresh" @click="resetQuery">{{ t('common.action.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-wrap">
      <template #header>
        <div class="action-bar">
          <el-button type="primary" :icon="Plus" @click="handleCreate">{{ t('system.role.addRole') }}</el-button>
          <el-button :icon="Refresh" @click="loadData">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" :label="t('common.field.id')" min-width="90" />
        <el-table-column prop="name" :label="t('system.role.roleName')" min-width="160" />
        <el-table-column prop="code" :label="t('system.role.roleCode')" min-width="160" />
        <el-table-column :label="t('system.role.dataScope')" min-width="150">
          <template #default="{ row }">
            <el-tag effect="plain">{{ getDataScopeLabel(row.dataScope) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.status')" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(value: boolean) => handleStatusChange(row, value ? 1 : 0)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="t('common.field.createTime')" min-width="180" />
        <el-table-column :label="t('common.field.actions')" width="260" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
              {{ t('common.action.edit') }}
            </el-button>
            <el-button text type="warning" size="small" :icon="Setting" @click="handleAssignPerm(row)">
              {{ t('common.action.assignPerm') }}
            </el-button>
            <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              {{ t('common.action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="editDialogVisible" :title="form.id ? t('system.role.editRole') : t('system.role.addRole')" width="600px">
      <el-form :model="form" label-width="100px" class="dialog-form">
        <el-form-item :label="t('system.role.roleName')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('system.role.roleCode')">
          <el-input v-model="form.code" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item :label="t('system.role.dataScope')">
          <el-select v-model="form.dataScope">
            <el-option :label="t('system.role.scopeAll')" :value="1" />
            <el-option :label="t('system.role.scopeCustom')" :value="2" />
            <el-option :label="t('system.role.scopeDept')" :value="3" />
            <el-option :label="t('system.role.scopeDeptChild')" :value="4" />
            <el-option :label="t('system.role.scopeSelf')" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permDialogVisible" :title="t('system.role.assignPermissions')" width="680px">
      <div class="permission-section">
        <div class="permission-section__title">{{ t('system.role.assignPermissions') }}</div>
        <el-tree
          ref="menuTreeRef"
          :data="menuTree"
          :props="{ label: 'name', children: 'children' }"
          show-checkbox
          node-key="id"
          default-expand-all
        />
      </div>
      <div v-if="currentDataScope === 2" class="permission-section">
        <div class="permission-section__title">{{ t('system.role.dataScope') }}</div>
        <el-tree
          ref="deptTreeRef"
          :data="deptTree"
          :props="{ label: 'name', children: 'children' }"
          show-checkbox
          node-key="id"
          default-expand-all
        />
      </div>
      <template #footer>
        <el-button @click="permDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handlePermSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit, Plus, Refresh, Search, Setting } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { deptApi } from '@/api/system/dept';
import { menuApi } from '@/api/system/menu';
import { roleApi } from '@/api/system/role';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ElTree } from 'element-plus';
import type { Id } from '@/types/api';
import type { DataScope, RoleStatus } from '@/types/role';

const { t } = useI18n();

const loading = ref(false);
const tableData = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive({
  name: '',
  status: undefined as RoleStatus | undefined,
  page: 1,
  limit: 10,
});
const editDialogVisible = ref(false);
const permDialogVisible = ref(false);
const formRef = ref<any>();
const menuTreeRef = ref<InstanceType<typeof ElTree>>();
const deptTreeRef = ref<InstanceType<typeof ElTree>>();

const form = reactive<any>({ id: undefined, name: '', code: '', dataScope: 1, status: 1 });
const currentRoleId = ref<Id>();
const currentDataScope = ref<DataScope>(1);
const menuTree = ref<any[]>([]);
const deptTree = ref<any[]>([]);

const getDataScopeLabel = (scope: number) =>
  [
    t('system.role.scopeAll'),
    t('system.role.scopeCustom'),
    t('system.role.scopeDept'),
    t('system.role.scopeDeptChild'),
    t('system.role.scopeSelf'),
  ][scope - 1] || '';

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await roleApi.list(queryParams);
    tableData.value = res.items || [];
    total.value = res.total || 0;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
  loadMenuTree();
  loadDeptTree();
});

const loadMenuTree = async () => {
  const res: any = await menuApi.tree();
  menuTree.value = res;
};
const loadDeptTree = async () => {
  const res: any = await deptApi.tree();
  deptTree.value = res;
};
const resetQuery = () => {
  queryParams.name = '';
  queryParams.status = undefined;
  queryParams.page = 1;
  loadData();
};

const handleCreate = () => {
  Object.assign(form, { id: undefined, name: '', code: '', dataScope: 1, status: 1 });
  editDialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, { id: row.id, name: row.name, code: row.code, dataScope: row.dataScope, status: row.status });
  editDialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (form.id) {
      await roleApi.update({
        id: form.id,
        name: form.name,
        code: form.code,
        sort: form.sort ?? 0,
        dataScope: form.dataScope,
        status: form.status,
      });
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      await roleApi.create({
        name: form.name,
        code: form.code,
        sort: form.sort ?? 0,
        status: form.status,
        dataScope: form.dataScope,
      });
      ElMessage.success(t('common.message.addSuccess'));
    }
    editDialogVisible.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleAssignPerm = async (row: any) => {
  currentRoleId.value = row.id;
  currentDataScope.value = row.dataScope;
  await Promise.all([loadMenuTree(), loadDeptTree()]);
  const res: any = await roleApi.getRoleMenus(row.id);
  permDialogVisible.value = true;
  setTimeout(() => {
    menuTreeRef.value?.setCheckedKeys((res.menuIds || []).map((id: string) => parseInt(id, 10)), false);
    deptTreeRef.value?.setCheckedKeys((res.deptIds || []).map((id: string) => parseInt(id, 10)), false);
  }, 100);
};

const handlePermSubmit = async () => {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys() || [];
  const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || [];
  const deptKeys = currentDataScope.value === 2 ? deptTreeRef.value?.getCheckedKeys() || [] : [];
  await roleApi.assignPermissions(
    currentRoleId.value!,
    [...checkedKeys, ...halfCheckedKeys].map(String),
    deptKeys.map(String),
  );
  ElMessage.success(t('common.message.updateSuccess'));
  permDialogVisible.value = false;
};

const handleStatusChange = async (row: any, status: RoleStatus) => {
  try {
    await roleApi.changeStatus(row.id, status);
    ElMessage.success(t('common.message.statusUpdateSuccess'));
  } catch (e: any) {
    row.status = status === 1 ? 0 : 1;
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(
    t('common.message.confirmDelete', { name: row.name }),
    t('common.action.confirm'),
    { type: 'warning' },
  );
  await roleApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.filter-form,
.table-wrap {
  margin-bottom: 16px;
}

.filter-select {
  width: 140px;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-form :deep(.el-select) {
  width: 100%;
}

.permission-section + .permission-section {
  margin-top: 16px;
}

.permission-section__title {
  margin-bottom: 12px;
  font-weight: 600;
}
</style>
