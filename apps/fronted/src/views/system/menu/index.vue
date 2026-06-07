<template>
  <div class="page-container">
    <el-card class="filter-form">
      <el-form :inline="true" :model="queryParams">
        <el-form-item :label="t('system.menu.menuName')">
          <el-input
            v-model="queryParams.name"
            :placeholder="t('system.menu.placeholderName')"
            clearable
            @keyup.enter="loadData"
          />
        </el-form-item>
        <el-form-item :label="t('common.field.type')">
          <el-select v-model="queryParams.type" clearable class="filter-select">
            <el-option :label="t('system.menu.typeDir')" :value="1" />
            <el-option :label="t('system.menu.typeMenu')" :value="2" />
            <el-option :label="t('system.menu.typeBtn')" :value="3" />
          </el-select>
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
          <el-button type="primary" :icon="Plus" @click="handleCreate(0)">{{ t('system.menu.addMenu') }}</el-button>
          <el-button :icon="Refresh" @click="loadData">{{ t('common.action.refresh') }}</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border row-key="id" default-expand-all>
        <el-table-column prop="name" :label="t('system.menu.menuName')" min-width="200" />
        <el-table-column :label="t('common.field.type')" width="120">
          <template #default="{ row }">
            <el-tag effect="plain">
              {{ ['', t('system.menu.typeDir'), t('system.menu.typeMenu'), t('system.menu.typeBtn')][row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="t('system.menu.path')" min-width="160" />
        <el-table-column prop="component" :label="t('system.menu.component')" min-width="180" />
        <el-table-column prop="perms" :label="t('system.menu.permission')" min-width="180" />
        <el-table-column prop="sort" :label="t('common.field.sort')" width="100" />
        <el-table-column :label="t('common.field.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
              {{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.field.actions')" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.type !== 3"
              text
              type="primary"
              size="small"
              :icon="Plus"
              @click="handleCreate(row.id)"
            >
              {{ t('common.action.add') }}
            </el-button>
            <el-button text type="primary" size="small" :icon="Edit" @click="handleEdit(row)">
              {{ t('common.action.edit') }}
            </el-button>
            <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
              {{ t('common.action.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? t('system.menu.editMenu') : t('system.menu.addMenu')" width="680px">
      <el-form :model="form" label-width="100px" class="dialog-form">
        <el-form-item :label="t('system.menu.parentMenu')">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ label: 'name', children: 'children' }"
            value-key="id"
            check-strictly
            clearable
            :placeholder="t('system.dept.rootDept')"
          />
        </el-form-item>
        <el-form-item :label="t('system.menu.type')">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">{{ t('system.menu.typeDir') }}</el-radio>
            <el-radio :value="2">{{ t('system.menu.typeMenu') }}</el-radio>
            <el-radio :value="3">{{ t('system.menu.typeBtn') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('system.menu.menuName')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item v-if="form.type !== 3" :label="t('system.menu.path')">
          <el-input v-model="form.path" />
        </el-form-item>
        <el-form-item v-if="form.type === 2" :label="t('system.menu.component')">
          <el-input v-model="form.component" placeholder="system/user/index" />
        </el-form-item>
        <el-form-item v-if="form.type === 3" :label="t('system.menu.permission')">
          <el-input v-model="form.perms" placeholder="sys:user:list" />
        </el-form-item>
        <el-form-item v-if="form.type !== 3" :label="t('system.menu.icon')">
          <el-input v-model="form.icon" />
        </el-form-item>
        <el-form-item v-if="form.type !== 3" :label="t('system.menu.visible')">
          <el-switch
            :model-value="form.show === 1"
            @change="(value: string | number | boolean) => (form.show = Boolean(value) ? 1 : 0)"
          />
        </el-form-item>
        <el-form-item v-if="form.type === 2" :label="t('system.menu.keepAlive')">
          <el-switch
            :model-value="form.keepAlive === 1"
            @change="(value: string | number | boolean) => (form.keepAlive = Boolean(value) ? 1 : 0)"
          />
        </el-form-item>
        <el-form-item :label="t('common.field.sort')">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.disabled') }}</el-radio>
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
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { menuApi } from '@/api/system/menu';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { MenuType, VisibleStatus } from '@/types/menu';

const { t } = useI18n();
const loading = ref(false);
const tableData = ref<any[]>([]);
const menuTree = ref<any[]>([]);
const dialogVisible = ref(false);
const queryParams = reactive({
  name: '',
  type: undefined as MenuType | undefined,
  status: undefined as VisibleStatus | undefined,
});
const form = reactive<any>({
  id: undefined,
  parentId: 0,
  type: 1,
  name: '',
  path: '',
  component: '',
  perms: '',
  icon: '',
  sort: 0,
  status: 1,
  show: 1,
  keepAlive: 0,
});

const loadData = async () => {
  loading.value = true;
  try {
    const res: any = await menuApi.list(queryParams);
    tableData.value = res;
    await loadMenuTree();
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
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
  Object.assign(form, {
    id: undefined,
    parentId: parentId || 0,
    type: 1,
    name: '',
    path: '',
    component: '',
    perms: '',
    icon: '',
    sort: 0,
    status: 1,
    show: 1,
    keepAlive: 0,
  });
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId,
    type: row.type,
    name: row.name,
    path: row.path,
    component: row.component,
    perms: row.perms,
    icon: row.icon,
    sort: row.sort,
    status: row.status,
    show: row.show,
    keepAlive: row.keepAlive,
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    if (form.id) {
      await menuApi.update(form);
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      await menuApi.create(form);
      ElMessage.success(t('common.message.addSuccess'));
    }
    dialogVisible.value = false;
    loadData();
  } catch (e: any) {
    ElMessage.error(e.message || t('common.message.failed'));
  }
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(
    t('common.message.confirmDelete', { name: row.name }),
    t('common.action.confirm'),
    { type: 'warning' },
  );
  await menuApi.delete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  loadData();
};

onMounted(() => loadData());
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

.dialog-form :deep(.el-tree-select),
.dialog-form :deep(.el-input),
.dialog-form :deep(.el-select) {
  width: 100%;
}
</style>
