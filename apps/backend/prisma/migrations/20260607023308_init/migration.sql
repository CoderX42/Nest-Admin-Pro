-- CreateTable
CREATE TABLE `sys_tenant` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `contact_user` VARCHAR(50) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `expire_at` DATETIME(3) NULL,
    `max_users` INTEGER NOT NULL DEFAULT 100,
    `package_code` VARCHAR(50) NULL,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `sys_tenant_code_key`(`code`),
    INDEX `sys_tenant_code_idx`(`code`),
    INDEX `sys_tenant_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(200) NOT NULL,
    `nickname` VARCHAR(50) NOT NULL,
    `avatar` VARCHAR(255) NOT NULL DEFAULT '',
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `gender` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `dept_id` BIGINT NULL,
    `login_ip` VARCHAR(50) NULL,
    `login_at` DATETIME(3) NULL,
    `pwd_reset_at` DATETIME(3) NULL,
    `is_platform_admin` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    INDEX `sys_user_tenant_id_deleted_at_idx`(`tenant_id`, `deleted_at`),
    INDEX `sys_user_dept_id_idx`(`dept_id`),
    INDEX `sys_user_username_idx`(`username`),
    INDEX `sys_user_phone_idx`(`phone`),
    INDEX `sys_user_email_idx`(`email`),
    UNIQUE INDEX `uq_sys_user_tenant_username`(`tenant_id`, `username`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `data_scope` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    INDEX `sys_role_tenant_id_deleted_at_idx`(`tenant_id`, `deleted_at`),
    INDEX `sys_role_code_idx`(`code`),
    UNIQUE INDEX `uq_sys_role_tenant_code`(`tenant_id`, `code`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dept` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `parent_id` BIGINT NOT NULL DEFAULT 0,
    `ancestors` VARCHAR(500) NOT NULL DEFAULT '',
    `name` VARCHAR(50) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `leader_id` BIGINT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    INDEX `sys_dept_tenant_id_deleted_at_idx`(`tenant_id`, `deleted_at`),
    INDEX `sys_dept_parent_id_idx`(`parent_id`),
    INDEX `sys_dept_sort_idx`(`sort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_post` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    INDEX `sys_post_tenant_id_deleted_at_idx`(`tenant_id`, `deleted_at`),
    UNIQUE INDEX `uq_sys_post_tenant_code`(`tenant_id`, `code`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT NOT NULL DEFAULT 0,
    `name` VARCHAR(50) NOT NULL,
    `i18n_key` VARCHAR(100) NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `path` VARCHAR(255) NULL,
    `component` VARCHAR(255) NULL,
    `query` VARCHAR(255) NULL,
    `icon` VARCHAR(100) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `perms` VARCHAR(100) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `is_external` INTEGER NOT NULL DEFAULT 0,
    `is_cache` INTEGER NOT NULL DEFAULT 0,
    `is_visible` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `sys_menu_parent_id_idx`(`parent_id`),
    INDEX `sys_menu_sort_idx`(`sort`),
    INDEX `sys_menu_perms_idx`(`perms`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `sys_dict_type_code_key`(`code`),
    INDEX `sys_dict_type_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_data` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dict_type_id` BIGINT NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `value` VARCHAR(100) NOT NULL,
    `css_class` VARCHAR(100) NULL,
    `list_class` VARCHAR(100) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `is_default` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `sys_dict_data_dict_type_id_sort_idx`(`dict_type_id`, `sort`),
    UNIQUE INDEX `uq_sys_dict_data_type_value`(`dict_type_id`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `config_key` VARCHAR(100) NOT NULL,
    `config_value` TEXT NOT NULL,
    `value_type` VARCHAR(20) NOT NULL DEFAULT 'string',
    `is_builtin` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(500) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `sys_config_config_key_key`(`config_key`),
    INDEX `sys_config_config_key_idx`(`config_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_notice` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 0,
    `publish_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    INDEX `sys_notice_tenant_id_status_publish_at_idx`(`tenant_id`, `status`, `publish_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_file` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `object_key` VARCHAR(500) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `storage` VARCHAR(50) NOT NULL,
    `mime_type` VARCHAR(100) NULL,
    `ext` VARCHAR(20) NULL,
    `size` BIGINT NOT NULL DEFAULT 0,
    `biz_type` VARCHAR(50) NULL,
    `uploader_id` BIGINT NULL,
    `uploader_name` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `sys_file_tenant_id_deleted_at_idx`(`tenant_id`, `deleted_at`),
    INDEX `sys_file_storage_idx`(`storage`),
    INDEX `sys_file_object_key_idx`(`object_key`),
    INDEX `sys_file_uploader_id_idx`(`uploader_id`),
    INDEX `sys_file_biz_type_idx`(`biz_type`),
    INDEX `sys_file_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_login_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `user_id` BIGINT NULL,
    `username` VARCHAR(50) NOT NULL,
    `ip` VARCHAR(50) NOT NULL,
    `location` VARCHAR(255) NULL,
    `os` VARCHAR(100) NULL,
    `browser` VARCHAR(100) NULL,
    `device` VARCHAR(50) NULL,
    `login_type` INTEGER NOT NULL DEFAULT 1,
    `status` INTEGER NOT NULL DEFAULT 1,
    `msg` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_login_log_tenant_id_created_at_idx`(`tenant_id`, `created_at`),
    INDEX `sys_login_log_user_id_idx`(`user_id`),
    INDEX `sys_login_log_ip_idx`(`ip`),
    INDEX `sys_login_log_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_oper_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `user_id` BIGINT NULL,
    `username` VARCHAR(50) NOT NULL,
    `module` VARCHAR(100) NULL,
    `operation` VARCHAR(100) NULL,
    `req_method` VARCHAR(10) NULL,
    `req_url` VARCHAR(500) NOT NULL,
    `req_params` TEXT NULL,
    `req_ip` VARCHAR(50) NULL,
    `req_ua` VARCHAR(500) NULL,
    `req_os` VARCHAR(100) NULL,
    `req_browser` VARCHAR(100) NULL,
    `location` VARCHAR(255) NULL,
    `resp_code` INTEGER NULL,
    `resp_result` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `error_msg` TEXT NULL,
    `duration` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_oper_log_tenant_id_created_at_idx`(`tenant_id`, `created_at`),
    INDEX `sys_oper_log_user_id_idx`(`user_id`),
    INDEX `sys_oper_log_module_idx`(`module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_job` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `name` VARCHAR(100) NOT NULL,
    `group` VARCHAR(50) NOT NULL DEFAULT 'default',
    `invoke_target` VARCHAR(200) NOT NULL,
    `cron_expression` VARCHAR(100) NOT NULL,
    `misfire_policy` INTEGER NOT NULL DEFAULT 1,
    `concurrent` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 0,
    `remark` VARCHAR(500) NULL,
    `next_fire_at` DATETIME(3) NULL,
    `prev_fire_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    INDEX `sys_job_tenant_id_status_idx`(`tenant_id`, `status`),
    INDEX `sys_job_invoke_target_idx`(`invoke_target`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_job_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` BIGINT NULL,
    `job_id` BIGINT NOT NULL,
    `job_name` VARCHAR(100) NOT NULL,
    `invoke_target` VARCHAR(200) NOT NULL,
    `message` TEXT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `error_msg` TEXT NULL,
    `duration` INTEGER NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finished_at` DATETIME(3) NULL,

    INDEX `sys_job_log_job_id_started_at_idx`(`job_id`, `started_at`),
    INDEX `sys_job_log_tenant_id_started_at_idx`(`tenant_id`, `started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gen_table` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `table_name` VARCHAR(100) NOT NULL,
    `table_comment` VARCHAR(200) NULL,
    `class_name` VARCHAR(100) NOT NULL,
    `module_name` VARCHAR(50) NOT NULL,
    `business_name` VARCHAR(50) NOT NULL,
    `function_name` VARCHAR(100) NOT NULL,
    `package_name` VARCHAR(100) NULL,
    `tpl_category` VARCHAR(50) NOT NULL DEFAULT 'crud',
    `parent_menu_id` BIGINT NULL,
    `options` TEXT NULL,
    `author` VARCHAR(50) NOT NULL,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` BIGINT NULL,

    INDEX `gen_table_business_name_idx`(`business_name`),
    UNIQUE INDEX `gen_table_table_name_key`(`table_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gen_table_field` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `table_id` BIGINT NOT NULL,
    `column_name` VARCHAR(100) NOT NULL,
    `column_comment` VARCHAR(200) NULL,
    `column_type` VARCHAR(50) NOT NULL,
    `ts_type` VARCHAR(50) NULL,
    `field_name` VARCHAR(100) NOT NULL,
    `is_pk` INTEGER NOT NULL DEFAULT 0,
    `is_increment` INTEGER NOT NULL DEFAULT 0,
    `is_required` INTEGER NOT NULL DEFAULT 0,
    `is_insert` INTEGER NOT NULL DEFAULT 1,
    `is_edit` INTEGER NOT NULL DEFAULT 1,
    `is_list` INTEGER NOT NULL DEFAULT 1,
    `is_query` INTEGER NOT NULL DEFAULT 0,
    `query_type` VARCHAR(50) NULL,
    `html_type` VARCHAR(50) NULL,
    `dict_type` VARCHAR(50) NULL,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `gen_table_field_table_id_sort_idx`(`table_id`, `sort`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_role` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_user_role_role_id_idx`(`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_post` (
    `user_id` BIGINT NOT NULL,
    `post_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_user_post_post_id_idx`(`post_id`),
    PRIMARY KEY (`user_id`, `post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_menu` (
    `role_id` BIGINT NOT NULL,
    `menu_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_role_menu_menu_id_idx`(`menu_id`),
    PRIMARY KEY (`role_id`, `menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_dept` (
    `role_id` BIGINT NOT NULL,
    `dept_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sys_role_dept_dept_id_idx`(`dept_id`),
    PRIMARY KEY (`role_id`, `dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_user` ADD CONSTRAINT `sys_user_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user` ADD CONSTRAINT `sys_user_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `sys_dept`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role` ADD CONSTRAINT `sys_role_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_dept` ADD CONSTRAINT `sys_dept_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_dept` ADD CONSTRAINT `sys_dept_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `sys_dept`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_post` ADD CONSTRAINT `sys_post_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_menu` ADD CONSTRAINT `sys_menu_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `sys_menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_dict_data` ADD CONSTRAINT `sys_dict_data_dict_type_id_fkey` FOREIGN KEY (`dict_type_id`) REFERENCES `sys_dict_type`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_notice` ADD CONSTRAINT `sys_notice_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_file` ADD CONSTRAINT `sys_file_uploader_id_fkey` FOREIGN KEY (`uploader_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_file` ADD CONSTRAINT `sys_file_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_login_log` ADD CONSTRAINT `sys_login_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_login_log` ADD CONSTRAINT `sys_login_log_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_oper_log` ADD CONSTRAINT `sys_oper_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_oper_log` ADD CONSTRAINT `sys_oper_log_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_job` ADD CONSTRAINT `sys_job_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_job_log` ADD CONSTRAINT `sys_job_log_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `sys_job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_job_log` ADD CONSTRAINT `sys_job_log_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `sys_tenant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gen_table_field` ADD CONSTRAINT `gen_table_field_table_id_fkey` FOREIGN KEY (`table_id`) REFERENCES `gen_table`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `sys_user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_role` ADD CONSTRAINT `sys_user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_post` ADD CONSTRAINT `sys_user_post_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_user_post` ADD CONSTRAINT `sys_user_post_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `sys_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `sys_role_menu_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_menu` ADD CONSTRAINT `sys_role_menu_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_dept` ADD CONSTRAINT `sys_role_dept_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_role_dept` ADD CONSTRAINT `sys_role_dept_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `sys_dept`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
