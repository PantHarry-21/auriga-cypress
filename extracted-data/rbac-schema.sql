-- ═══════════════════════════════════════════════════════════════════════════
-- RBAC Database Schema - Auto-generated from YLIMS UAT
-- Generated: 2026-05-18T14:30:00Z
-- DO NOT EDIT MANUALLY - Use extraction script to update
-- ═══════════════════════════════════════════════════════════════════════════

-- Create roles table (19 roles)
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY COMMENT 'Role unique identifier',
  name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Role name',
  description TEXT COMMENT 'Role description',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Role status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Role definitions';

-- Create modules table (3 main modules)
CREATE TABLE IF NOT EXISTS modules (
  id VARCHAR(50) PRIMARY KEY COMMENT 'Module unique identifier',
  name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Module name',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Module code',
  description TEXT COMMENT 'Module description',
  category VARCHAR(100) COMMENT 'Module category',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Module status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
  INDEX idx_code (code),
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Module definitions';

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(50) PRIMARY KEY COMMENT 'Permission unique identifier',
  name VARCHAR(255) NOT NULL COMMENT 'Permission name',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Permission code',
  description TEXT COMMENT 'Permission description',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permission types';

-- Create role-module-permission mapping table
CREATE TABLE IF NOT EXISTS role_module_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mapping unique identifier',
  role_id VARCHAR(50) NOT NULL COMMENT 'Reference to roles table',
  module_id VARCHAR(50) NOT NULL COMMENT 'Reference to modules table',
  permission_id VARCHAR(50) NOT NULL COMMENT 'Reference to permissions table',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_role_module_permission (role_id, module_id, permission_id),
  INDEX idx_role_id (role_id),
  INDEX idx_module_id (module_id),
  INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Role-Module-Permission mappings';

-- Create user_roles assignment table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id VARCHAR(50) NOT NULL COMMENT 'User identifier',
  role_id VARCHAR(50) NOT NULL COMMENT 'Reference to roles table',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Assignment timestamp',
  assigned_by VARCHAR(50) COMMENT 'Admin who assigned the role',
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  INDEX idx_assigned_at (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User role assignments';

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT ROLES (19 Roles)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO roles (id, name, description, status) VALUES
('admin', 'Administrator', 'Full system access with all permissions', 'active'),
('reception', 'Reception', 'Reception desk operations', 'active'),
('booking_personel', 'Booking Personnel', 'Booking and test request management', 'active'),
('master_personel', 'Master Personnel', 'Master data management operations', 'active'),
('master_controler', 'Master Controller', 'Master data approval and control', 'active'),
('analyst', 'Analyst', 'Data analysis and reporting', 'active'),
('department_reviewer', 'Department Reviewer', 'Department level review and approval', 'active'),
('department_head', 'Department Head', 'Department head management and oversight', 'active'),
('compilation', 'Compilation', 'Report compilation and generation', 'active'),
('reviewer', 'Reviewer', 'Data and process review', 'active'),
('person_incharge', 'Person In Charge', 'Person in charge operations', 'active'),
('customer_coordinator', 'Customer Coordinator', 'Customer coordination and support', 'active'),
('sales_personel', 'Sales Personnel (AM)', 'Sales and account management', 'active'),
('accountant_admin', 'Accountant (Admin)', 'Accounting administration', 'active'),
('accountant_crm', 'Accountant (CRM)', 'CRM accounting operations', 'active'),
('quality_personel', 'Quality Personnel', 'Quality assurance operations', 'active'),
('quality_manger', 'Quality Manager', 'Quality management and oversight', 'active'),
('dept_assistant', 'Department Assistant', 'Department administrative support', 'active'),
('jr_analyst', 'Jr. Analyst', 'Junior analyst operations', 'active'),
('dept_trainee', 'Department Trainee', 'Department trainee program', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT MODULES (3 Modules)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO modules (id, name, code, description, category, status) VALUES
('dashboard', 'Dashboard', 'DASH', 'System dashboard and analytics', 'core', 'active'),
('generic-master', 'Generic Master', 'GENM', 'Generic master data management', 'master', 'active'),
('stp-master', 'STP Master', 'STP', 'Standard test procedure master', 'master', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), description=VALUES(description);

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT PERMISSIONS (6 Permission Types)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO permissions (id, name, code, description) VALUES
('view', 'View', 'VIEW', 'View module and data'),
('create', 'Create', 'CREATE', 'Create new records'),
('edit', 'Edit', 'EDIT', 'Edit existing records'),
('delete', 'Delete', 'DELETE', 'Delete records'),
('approve', 'Approve', 'APPROVE', 'Approve changes and submissions'),
('export', 'Export', 'EXPORT', 'Export data to external formats')
ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), description=VALUES(description);

-- ═══════════════════════════════════════════════════════════════════════════
-- INSERT ROLE-MODULE-PERMISSION MAPPINGS
-- ═══════════════════════════════════════════════════════════════════════════

-- Admin - Full access to all modules
INSERT INTO role_module_permissions (role_id, module_id, permission_id) VALUES
('admin', 'dashboard', 'view'),
('admin', 'dashboard', 'create'),
('admin', 'dashboard', 'edit'),
('admin', 'dashboard', 'delete'),
('admin', 'dashboard', 'export'),
('admin', 'generic-master', 'view'),
('admin', 'generic-master', 'create'),
('admin', 'generic-master', 'edit'),
('admin', 'generic-master', 'delete'),
('admin', 'generic-master', 'approve'),
('admin', 'stp-master', 'view'),
('admin', 'stp-master', 'create'),
('admin', 'stp-master', 'edit'),
('admin', 'stp-master', 'delete'),
('admin', 'stp-master', 'approve'),

-- Reception - View Dashboard only
('reception', 'dashboard', 'view'),

-- Booking Personnel
('booking_personel', 'generic-master', 'view'),
('booking_personel', 'generic-master', 'create'),
('booking_personel', 'generic-master', 'edit'),

-- Master Personnel
('master_personel', 'generic-master', 'view'),
('master_personel', 'generic-master', 'create'),
('master_personel', 'generic-master', 'edit'),
('master_personel', 'generic-master', 'delete'),
('master_personel', 'stp-master', 'view'),
('master_personel', 'stp-master', 'create'),
('master_personel', 'stp-master', 'edit'),

-- Master Controller - Approve permissions
('master_controler', 'generic-master', 'view'),
('master_controler', 'generic-master', 'edit'),
('master_controler', 'generic-master', 'approve'),
('master_controler', 'stp-master', 'view'),
('master_controler', 'stp-master', 'approve'),

-- Analyst - View & Export
('analyst', 'dashboard', 'view'),
('analyst', 'dashboard', 'export'),

-- Department Reviewer
('department_reviewer', 'generic-master', 'view'),
('department_reviewer', 'generic-master', 'approve'),

-- Department Head
('department_head', 'generic-master', 'view'),
('department_head', 'generic-master', 'approve'),
('department_head', 'stp-master', 'view'),
('department_head', 'stp-master', 'approve'),

-- Compilation
('compilation', 'dashboard', 'view'),

-- Reviewer
('reviewer', 'generic-master', 'view'),

-- Person in Charge
('person_incharge', 'generic-master', 'view'),

-- Customer Coordinator
('customer_coordinator', 'dashboard', 'view'),

-- Sales Personnel
('sales_personel', 'dashboard', 'view'),

-- Accountant Admin
('accountant_admin', 'dashboard', 'view'),

-- Accountant CRM
('accountant_crm', 'dashboard', 'view'),

-- Quality Personnel
('quality_personel', 'generic-master', 'view'),

-- Quality Manager
('quality_manger', 'generic-master', 'view'),
('quality_manger', 'generic-master', 'approve'),

-- Department Assistant
('dept_assistant', 'generic-master', 'view'),

-- Jr. Analyst
('jr_analyst', 'generic-master', 'view'),

-- Department Trainee
('dept_trainee', 'dashboard', 'view')
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Verify roles inserted
-- SELECT COUNT(*) as total_roles FROM roles;
-- Expected: 19

-- Verify modules inserted
-- SELECT COUNT(*) as total_modules FROM modules;
-- Expected: 3

-- Verify permissions inserted
-- SELECT COUNT(*) as total_permissions FROM permissions;
-- Expected: 6

-- Verify mappings inserted
-- SELECT COUNT(*) as total_mappings FROM role_module_permissions;
-- Expected: 50+

-- View role with all permissions
-- SELECT r.name, m.name as module, GROUP_CONCAT(p.name) as permissions
-- FROM role_module_permissions rmp
-- JOIN roles r ON r.id = rmp.role_id
-- JOIN modules m ON m.id = rmp.module_id
-- JOIN permissions p ON p.id = rmp.permission_id
-- GROUP BY r.id, m.id
-- ORDER BY r.name, m.name;
