import {
  INITIAL_ADMINS,
  INITIAL_USERS,
  INITIAL_ASSESSMENT_CYCLES,
  INITIAL_DAILY_LOGS,
  INITIAL_ASSESSMENTS,
  INITIAL_ADMIN_EVALUATIONS,
  INITIAL_CONFIGURATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_LOGIN_ATTEMPTS,
  OBESITY_CLASSES
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'obsense_users',
  CYCLES: 'obsense_cycles',
  DAILY_LOGS: 'obsense_daily_logs',
  ASSESSMENTS: 'obsense_assessments',
  EVALUATIONS: 'obsense_evaluations',
  CONFIGURATIONS: 'obsense_configurations',
  AUDIT_LOGS: 'obsense_audit_logs',
  ADMINS: 'obsense_admins',
  LOGIN_ATTEMPTS: 'obsense_login_attempts'
};

const getOrInit = (key, initial) => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initial;
  }
};

export const storageService = {
  // Users CRUD
  getUsers(includeDeleted = false) {
    const users = getOrInit(STORAGE_KEYS.USERS, INITIAL_USERS);
    return includeDeleted ? users : users.filter((u) => !u.deleted_at);
  },

  getAllUsersWithDeleted() {
    return getOrInit(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserById(id) {
    const users = this.getAllUsersWithDeleted();
    return users.find((u) => u.id === Number(id));
  },

  updateUser(id, updatedFields, adminName = 'Admin') {
    const users = this.getAllUsersWithDeleted();
    const index = users.findIndex((u) => u.id === Number(id));
    if (index === -1) return null;

    const before = { ...users[index] };
    let newBmi = users[index].bmi;
    let newClass = users[index].obesity_class;
    let newRisk = users[index].risk_level;

    // Recalculate BMI if height or weight changed
    const height = updatedFields.height !== undefined ? Number(updatedFields.height) : users[index].height;
    const weight = updatedFields.weight !== undefined ? Number(updatedFields.weight) : users[index].weight;

    if (height > 0 && weight > 0) {
      newBmi = Number((weight / ((height / 100) ** 2)).toFixed(1));
      if (newBmi < 18.5) {
        newClass = 'Insufficient_Weight';
        newRisk = 'Low';
      } else if (newBmi <= 24.9) {
        newClass = 'Normal_Weight';
        newRisk = 'Low';
      } else if (newBmi <= 27.4) {
        newClass = 'Overweight_Level_I';
        newRisk = 'Moderate';
      } else if (newBmi <= 29.9) {
        newClass = 'Overweight_Level_II';
        newRisk = 'Moderate';
      } else if (newBmi <= 34.9) {
        newClass = 'Obesity_Type_I';
        newRisk = 'High';
      } else if (newBmi <= 39.9) {
        newClass = 'Obesity_Type_II';
        newRisk = 'High';
      } else {
        newClass = 'Obesity_Type_III';
        newRisk = 'Critical';
      }
    }

    const updatedUser = {
      ...users[index],
      ...updatedFields,
      height,
      weight,
      bmi: newBmi,
      obesity_class: newClass,
      risk_level: newRisk,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    this.addAuditLog({
      action: 'UPDATE_USER',
      entity_type: 'User',
      entity_id: String(id),
      admin_name: adminName,
      details: { before, after: updatedUser }
    });

    return updatedUser;
  },

  toggleUserStatus(id, adminName = 'Admin') {
    const user = this.getUserById(id);
    if (!user) return null;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return this.updateUser(id, { status: newStatus }, adminName);
  },

  deleteUser(id, adminName = 'Admin') {
    const users = this.getAllUsersWithDeleted();
    const index = users.findIndex((u) => u.id === Number(id));
    if (index === -1) return false;

    const before = { ...users[index] };
    users[index].deleted_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    users[index].status = 'inactive';

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    this.addAuditLog({
      action: 'SOFT_DELETE_USER',
      entity_type: 'User',
      entity_id: String(id),
      admin_name: adminName,
      details: { before, after: users[index] }
    });

    return true;
  },

  // Daily Logs & Cycles
  getCycles() {
    return getOrInit(STORAGE_KEYS.CYCLES, INITIAL_ASSESSMENT_CYCLES);
  },

  getDailyLogs(filters = {}) {
    let logs = getOrInit(STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
    if (filters.userId) {
      logs = logs.filter((l) => l.user_id === Number(filters.userId));
    }
    if (filters.cycleId) {
      logs = logs.filter((l) => l.cycle_id === Number(filters.cycleId));
    }
    if (filters.startDate && filters.endDate) {
      logs = logs.filter((l) => l.log_date >= filters.startDate && l.log_date <= filters.endDate);
    }
    return logs;
  },

  updateDailyLog(id, fields, adminName = 'Admin') {
    const logs = getOrInit(STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
    const index = logs.findIndex((l) => l.id === Number(id));
    if (index === -1) return null;

    const before = { ...logs[index] };
    logs[index] = {
      ...logs[index],
      ...fields,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));

    this.addAuditLog({
      action: 'UPDATE_DAILY_LOG',
      entity_type: 'DailyLog',
      entity_id: String(id),
      admin_name: adminName,
      details: { before, after: logs[index] }
    });

    return logs[index];
  },

  deleteDailyLog(id, adminName = 'Admin') {
    const logs = getOrInit(STORAGE_KEYS.DAILY_LOGS, INITIAL_DAILY_LOGS);
    const target = logs.find((l) => l.id === Number(id));
    if (!target) return false;

    const filtered = logs.filter((l) => l.id !== Number(id));
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(filtered));

    this.addAuditLog({
      action: 'DELETE_DAILY_LOG',
      entity_type: 'DailyLog',
      entity_id: String(id),
      admin_name: adminName,
      details: { deletedRecord: target }
    });

    return true;
  },

  // Assessments
  getAssessments(userId = null) {
    const assessments = getOrInit(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    if (userId) {
      return assessments.filter((a) => a.user_id === Number(userId));
    }
    return assessments;
  },

  // Admin Evaluations (Append-Only)
  getEvaluations(userId = null) {
    const evals = getOrInit(STORAGE_KEYS.EVALUATIONS, INITIAL_ADMIN_EVALUATIONS);
    if (userId) {
      return evals.filter((e) => e.user_id === Number(userId));
    }
    return evals;
  },

  addEvaluation(evalData, adminName = 'Admin', adminId = 1) {
    const evals = getOrInit(STORAGE_KEYS.EVALUATIONS, INITIAL_ADMIN_EVALUATIONS);
    const newEval = {
      id: Date.now(),
      ...evalData,
      admin_id: adminId,
      adminName: adminName,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    evals.unshift(newEval);
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));

    this.addAuditLog({
      action: 'EVALUATE',
      entity_type: 'Assessment',
      entity_id: String(evalData.assessment_id || evalData.user_id),
      admin_name: adminName,
      details: { newEvaluation: newEval }
    });

    return newEval;
  },

  // Configurations
  getConfigurations() {
    return getOrInit(STORAGE_KEYS.CONFIGURATIONS, INITIAL_CONFIGURATIONS);
  },

  updateConfigurations(newConfig, adminName = 'Dr. Sarah Amalia, Sp.GK') {
    const current = this.getConfigurations();
    const before = { ...current };

    const updated = {
      ...current,
      ...newConfig,
      audit_info: {
        last_modified_by: adminName,
        last_modified_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    };

    localStorage.setItem(STORAGE_KEYS.CONFIGURATIONS, JSON.stringify(updated));

    this.addAuditLog({
      action: 'UPDATE_CONFIG',
      entity_type: 'Config',
      entity_id: 'SYSTEM_SETTINGS',
      admin_name: adminName,
      details: { before, after: updated }
    });

    return updated;
  },

  // Audit Logs
  getAuditLogs(filters = {}) {
    let logs = getOrInit(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (filters.action) {
      logs = logs.filter((l) => l.action.toLowerCase() === filters.action.toLowerCase());
    }
    if (filters.entity) {
      logs = logs.filter((l) => l.entity_type.toLowerCase() === filters.entity.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.admin_name?.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entity_type.toLowerCase().includes(q)
      );
    }
    return logs;
  },

  addAuditLog(entry) {
    const logs = getOrInit(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog = {
      id: Date.now(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '127.0.0.1 (Local Session)',
      ...entry
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    return newLog;
  },

  // Login Attempts
  getLoginAttempts() {
    return getOrInit(STORAGE_KEYS.LOGIN_ATTEMPTS, INITIAL_LOGIN_ATTEMPTS);
  },

  recordLoginAttempt(email, status, userAgent = 'Web Browser') {
    const attempts = getOrInit(STORAGE_KEYS.LOGIN_ATTEMPTS, INITIAL_LOGIN_ATTEMPTS);
    const newAttempt = {
      id: Date.now(),
      email,
      status,
      ip: '127.0.0.1',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user_agent: userAgent
    };
    attempts.unshift(newAttempt);
    localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(attempts));
    return newAttempt;
  },

  // Admins CRUD
  getAdmins() {
    return getOrInit(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
  },

  addAdmin(adminData, currentAdminName = 'Super Admin') {
    const admins = this.getAdmins();
    const newAdmin = {
      id: Date.now(),
      is_active: true,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      last_login_at: null,
      ...adminData
    };
    admins.push(newAdmin);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));

    this.addAuditLog({
      action: 'CREATE_ADMIN',
      entity_type: 'Admin',
      entity_id: String(newAdmin.id),
      admin_name: currentAdminName,
      details: { newAdmin: { ...newAdmin, password: '***' } }
    });

    return newAdmin;
  },

  updateAdmin(id, fields, currentAdminName = 'Super Admin') {
    const admins = this.getAdmins();
    const index = admins.findIndex((a) => a.id === Number(id));
    if (index === -1) return null;

    const before = { ...admins[index] };
    admins[index] = { ...admins[index], ...fields };
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));

    this.addAuditLog({
      action: 'UPDATE_ADMIN',
      entity_type: 'Admin',
      entity_id: String(id),
      admin_name: currentAdminName,
      details: { before, after: admins[index] }
    });

    return admins[index];
  },

  resetAdminPassword(id, currentAdminName = 'Super Admin') {
    const admins = this.getAdmins();
    const target = admins.find((a) => a.id === Number(id));
    if (!target) return false;

    this.addAuditLog({
      action: 'RESET_ADMIN_PASSWORD',
      entity_type: 'Admin',
      entity_id: String(id),
      admin_name: currentAdminName,
      details: { target_admin: target.email, message: 'Password reset to default (admin123)' }
    });

    return true;
  },

  // Aggregate Stats Calculator
  getDashboardStats() {
    const users = this.getUsers(false);
    const totalUsers = users.length;
    const avgBmi = totalUsers > 0
      ? (users.reduce((acc, u) => acc + (u.bmi || 0), 0) / totalUsers).toFixed(1)
      : '0.0';

    const classCounts = {};
    OBESITY_CLASSES.forEach((c) => {
      classCounts[c.key] = 0;
    });

    users.forEach((u) => {
      if (classCounts[u.obesity_class] !== undefined) {
        classCounts[u.obesity_class] += 1;
      }
    });

    const highRiskCount = users.filter(
      (u) => u.risk_level === 'High' || u.risk_level === 'Critical'
    ).length;

    const cycles = this.getCycles();
    const completedCycles = cycles.filter((c) => c.status === 'completed').length;
    const completionRate = cycles.length > 0
      ? Math.round((completedCycles / cycles.length) * 100)
      : 0;

    return {
      totalUsers,
      avgBmi: Number(avgBmi),
      classCounts,
      highRiskCount,
      completedCycles,
      completionRate,
      activeCycles: cycles.filter((c) => c.status === 'in_progress').length
    };
  },

  // Export to CSV Helper
  exportToCSV(data, filename = 'export.csv') {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        let val = row[header];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val).replace(/"/g, '""');
        } else if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default storageService;
