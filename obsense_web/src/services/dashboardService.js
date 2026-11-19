import { OBESITY_CLASSES } from '../mock/mockData';
import userService from './userService';
import cycleService from './cycleService';

const buildEmptyClassCounts = () =>
  OBESITY_CLASSES.reduce((acc, c) => {
    acc[c.key] = 0;
    return acc;
  }, {});

export const EMPTY_STATS = {
  totalUsers: 0,
  avgBmi: 0,
  classCounts: buildEmptyClassCounts(),
  highRiskCount: 0,
  completedCycles: 0,
  activeCycles: 0,
  completionRate: 0,
  topCriticalUser: null,
};

const RISK_RANK = { Critical: 2, High: 1 };

export const dashboardService = {
  async getStats() {
    const [users, cycles] = await Promise.all([
      userService.getUsersWithLatest(),
      cycleService.getCycles().catch(() => []),
    ]);

    const totalUsers = users.length;
    const usersWithBmi = users.filter((u) => typeof u.bmi === 'number' && !Number.isNaN(u.bmi));
    const avgBmi =
      usersWithBmi.length > 0
        ? Number((usersWithBmi.reduce((acc, u) => acc + u.bmi, 0) / usersWithBmi.length).toFixed(1))
        : 0;

    const classCounts = buildEmptyClassCounts();
    users.forEach((u) => {
      if (classCounts[u.obesity_class] !== undefined) {
        classCounts[u.obesity_class] += 1;
      }
    });

    const highRiskCount = users.filter(
      (u) => u.risk_level === 'High' || u.risk_level === 'Critical'
    ).length;

    const completedCycles = cycles.filter((c) => c.status === 'completed').length;
    const activeCycles = cycles.filter((c) => c.status === 'in_progress').length;
    const completionRate =
      cycles.length > 0 ? Math.round((completedCycles / cycles.length) * 100) : 0;

    const topCriticalUser =
      users
        .filter((u) => RISK_RANK[u.risk_level])
        .sort(
          (a, b) =>
            RISK_RANK[b.risk_level] - RISK_RANK[a.risk_level] || (b.bmi || 0) - (a.bmi || 0)
        )[0] || null;

    return {
      totalUsers,
      avgBmi,
      classCounts,
      highRiskCount,
      completedCycles,
      activeCycles,
      completionRate,
      topCriticalUser,
    };
  },
};

export default dashboardService;
