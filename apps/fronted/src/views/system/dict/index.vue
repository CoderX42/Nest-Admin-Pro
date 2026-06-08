<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="9">
        <el-card class="split-card">
          <template #header>
            <div class="split-card__header">
              <span>{{ t('system.dict.dictName') }}</span>
              <el-button type="primary" :icon="Plus" @click="handleCreateType">{{ t('common.action.add') }}</el-button>
            </div>
          </template>

          <el-table :data="typeList" border highlight-current-row @current-change="handleCurrentTypeChange">
            <el-table-column prop="name" :label="t('system.dict.dictName')" min-width="140" />
            <el-table-column prop="type" :label="t('system.dict.dictCode')" min-width="140" />
            <el-table-column :label="t('common.field.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('common.field.actions')" width="120" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" :icon="Edit" @click.stop="handleEditType(row)" />
                <el-button text type="danger" size="small" :icon="Delete" @click.stop="handleDeleteType(row)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="15">
        <el-card class="split-card">
          <template #header>
            <div class="split-card__header">
              <span>{{ t('system.dict.dictData') }} {{ currentTypeName ? `(${currentTypeName})` : '' }}</span>
              <el-button type="primary" :icon="Plus" :disabled="!currentTypeId" @click="handleCreateData">
                {{ t('common.action.add') }}
              </el-button>
            </div>
          </template>

          <el-empty v-if="!currentTypeId" :description="'← 请先选择一个字典类型'" />
          <el-table v-else :data="dataList" v-loading="loading" border>
            <el-table-column prop="label" :label="t('system.dict.label')" min-width="140" />
            <el-table-column prop="value" :label="t('system.dict.value')" min-width="140" />
            <el-table-column prop="sort" :label="t('common.field.sort')" width="100" />
            <el-table-column :label="t('common.field.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" effect="plain">
                  {{ row.status === 1 ? t('common.status.enabled') : t('common.status.disabled') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('common.field.actions')" width="120" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" size="small" :icon="Edit" @click="handleEditData(row)" />
                <el-button text type="danger" size="small" :icon="Delete" @click="handleDeleteData(row)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="typeDialogVisible" :title="typeForm.id ? t('system.dict.editDict') : t('system.dict.addDict')" width="560px">
      <el-form :model="typeForm" label-width="100px">
        <el-form-item :label="t('system.dict.dictName')">
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item :label="t('system.dict.dictCode')">
          <el-input v-model="typeForm.type" :disabled="!!typeForm.id" />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')">
          <el-input v-model="typeForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleTypeSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dataDialogVisible" :title="dataForm.id ? t('system.dict.editData') : t('system.dict.addData')" width="560px">
      <el-form :model="dataForm" label-width="100px">
        <el-form-item :label="t('system.dict.label')">
          <el-input v-model="dataForm.label" />
        </el-form-item>
        <el-form-item :label="t('system.dict.value')">
          <el-input v-model="dataForm.value" />
        </el-form-item>
        <el-form-item :label="t('common.field.sort')">
          <el-input-number v-model="dataForm.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="t('common.field.status')">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="1">{{ t('common.status.enabled') }}</el-radio>
            <el-radio :value="0">{{ t('common.status.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.field.remark')">
          <el-input v-model="dataForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">{{ t('common.action.cancel') }}</el-button>
        <el-button type="primary" @click="handleDataSubmit">{{ t('common.action.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit, Plus } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { dictApi } from '@/api/system/dict';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const typeList = ref<any[]>([]);
const dataList = ref<any[]>([]);
const currentTypeId = ref<number>();
const currentTypeName = ref('');
const typeDialogVisible = ref(false);
const dataDialogVisible = ref(false);
const typeForm = reactive<any>({ id: undefined, name: '', type: '', status: 1, remark: '' });
const dataForm = reactive<any>({ id: undefined, dictTypeId: 0, label: '', value: '', sort: 0, status: 1, remark: '' });

const loadTypes = async () => {
  const res: any = await dictApi.typeList({});
  typeList.value = (res.items || res).map((item: any) => ({ ...item, type: item.type ?? item.code }));
};
const loadDataItems = async (row: any) => {
  currentTypeId.value = row.id;
  currentTypeName.value = row.name;
  loading.value = true;
  try {
    const res: any = await dictApi.dataList(row.id);
    dataList.value = res;
  } catch {
    ElMessage.error(t('common.message.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCurrentTypeChange = (row: any) => {
  if (!row) return;
  loadDataItems(row);
};

const handleCreateType = () => {
  Object.assign(typeForm, { id: undefined, name: '', type: '', status: 1, remark: '' });
  typeDialogVisible.value = true;
};
const handleEditType = (row: any) => {
  Object.assign(typeForm, { ...row, type: row.type ?? row.code });
  typeDialogVisible.value = true;
};
const handleTypeSubmit = async () => {
  try {
    if (typeForm.id) {
      await dictApi.typeUpdate({ id: typeForm.id, name: typeForm.name, type: typeForm.type, status: typeForm.status, remark: typeForm.remark });
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      await dictApi.typeCreate({ name: typeForm.name, type: typeForm.type, status: typeForm.status, remark: typeForm.remark });
      ElMessage.success(t('common.message.addSuccess'));
    }
    typeDialogVisible.value = false;
    loadTypes();
  } catch (e: any) {
    ElMessage.error(e.message);
  }
};
const handleDeleteType = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.name }), t('common.action.confirm'), { type: 'warning' });
  await dictApi.typeDelete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  if (currentTypeId.value === row.id) {
    currentTypeId.value = undefined;
    dataList.value = [];
  }
  loadTypes();
};

const handleCreateData = () => {
  Object.assign(dataForm, { id: undefined, dictTypeId: currentTypeId.value, label: '', value: '', sort: 0, status: 1, remark: '' });
  dataDialogVisible.value = true;
};
const handleEditData = (row: any) => {
  Object.assign(dataForm, { id: row.id, dictTypeId: row.dictTypeId, label: row.label, value: row.value, sort: row.sort, status: row.status, remark: row.remark });
  dataDialogVisible.value = true;
};
const handleDataSubmit = async () => {
  try {
    if (dataForm.id) {
      await dictApi.dataUpdate(dataForm);
      ElMessage.success(t('common.message.updateSuccess'));
    } else {
      await dictApi.dataCreate(dataForm);
      ElMessage.success(t('common.message.addSuccess'));
    }
    dataDialogVisible.value = false;
    if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
  } catch (e: any) {
    ElMessage.error(e.message);
  }
};
const handleDeleteData = async (row: any) => {
  await ElMessageBox.confirm(t('common.message.confirmDelete', { name: row.label }), t('common.action.confirm'), { type: 'warning' });
  await dictApi.dataDelete(row.id);
  ElMessage.success(t('common.message.deleteSuccess'));
  if (currentTypeId.value) loadDataItems({ id: currentTypeId.value, name: currentTypeName.value });
};

onMounted(() => loadTypes());
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.split-card {
  margin-bottom: 16px;
}

.split-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
