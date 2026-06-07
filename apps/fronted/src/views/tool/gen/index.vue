<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="page-header">
          <div>
            <div class="page-title">代码生成</div>
            <div class="page-desc">基于数据库表生成前后端 CRUD 代码</div>
          </div>
        </div>
      </template>
      <el-empty description="代码生成器模块开发中" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Placeholder for code generator (S7).
// Backend gen.service.ts already partially exists but template engine not wired.
</script>

<style scoped>
.page-container {
  padding: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.page-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
