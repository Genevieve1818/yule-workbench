/* ============================================================
 *  我的工作台 - 主应用逻辑
 *  板块：今事今毕 / CPA学习 / 英语学习 / 韩语学习
 * ============================================================ */

// ==================== 数据管理层 ====================
const Storage = {
  prefix: 'workbench_',
  get(key, def) {
    try {
      const v = localStorage.getItem(this.prefix + key);
      return v ? JSON.parse(v) : def;
    } catch(e) { return def; }
  },
  set(key, val) {
    localStorage.setItem(this.prefix + key, JSON.stringify(val));
  },
  remove(key) { localStorage.removeItem(this.prefix + key); }
};

// 日期工具
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function formatDateCN(y, m) { return `${y}年${m+1}月`; }

// Toast 通知
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ==================== 导航 ====================
function navigateTo(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  const sidebarItem = document.querySelector(`.nav-item[data-section="${section}"]`);
  const mobileItem = document.querySelector(`.mobile-nav-item[data-section="${section}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');
  if (mobileItem) mobileItem.classList.add('active');

  // 宫崎骏风格：切换主题色
  const mainContent = document.querySelector('.main-content');
  const themes = { calendar: 'green', cpa: 'blue', english: 'purple', korean: 'pink' };
  mainContent.setAttribute('data-theme', themes[section] || 'green');

  // 同步 theme-color meta（iOS PWA）
  const themeColors = { green: '#6B8E6B', blue: '#6B8E9B', purple: '#8E7B9B', pink: '#B88A95' };
  document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColors[themes[section]] || '#6B8E6B');

  // 移动端滚动到顶部
  if (window.innerWidth <= 768) {
    document.querySelector('.main-content').scrollTop = 0;
  }

  if (section === 'calendar') Calendar.render();
  if (section === 'cpa') CPA.render();
  if (section === 'english') English.render();
  if (section === 'korean') Korean.render();
}

// ==================== 树苗SVG生成（宫崎骏风格） ====================
const TreeSVG = {
  // 空状态（未记录）— 一颗沉睡的种子
  empty() {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="36" rx="8" ry="2.5" fill="#DCC8B8" opacity="0.6"/>
      <circle cx="20" cy="32" r="2.5" fill="#C4A898" opacity="0.4"/>
      <path d="M20 32 L20 28" stroke="#C4A898" stroke-width="1" opacity="0.3" stroke-linecap="round"/>
    </svg>`;
  },
  // 树苗状态（<30%）— 刚发芽的小苗
  seedling() {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sg1" cx="50%" cy="100%"><stop offset="0%" stop-color="#A08070"/><stop offset="100%" stop-color="#8B6B58"/></radialGradient>
      </defs>
      <ellipse cx="20" cy="38" rx="9" ry="2.5" fill="url(#sg1)" opacity="0.7"/>
      <path d="M20 38 Q19 28 20 22" stroke="#8BBA6B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="12" cy="25" rx="7" ry="3.5" fill="#A8D889" transform="rotate(-40 12 25)" opacity="0.9"/>
      <ellipse cx="27" cy="21" rx="7" ry="3.5" fill="#A8D889" transform="rotate(40 27 21)" opacity="0.9"/>
      <ellipse cx="20" cy="16" rx="5.5" ry="3" fill="#C2E8A0" opacity="0.85"/>
    </svg>`;
  },
  // 小树状态（30%-90%）— 茁壮成长的小树
  smallTree() {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="st11" cx="40%" cy="100%"><stop offset="0%" stop-color="#A08070"/><stop offset="100%" stop-color="#7B5C48"/></radialGradient>
        <radialGradient id="st12" cx="50%" cy="40%"><stop offset="0%" stop-color="#7DBA5A"/><stop offset="100%" stop-color="#5A8B3F"/></radialGradient>
      </defs>
      <ellipse cx="20" cy="38" rx="9" ry="2.5" fill="url(#st11)" opacity="0.7"/>
      <rect x="17.5" y="22" width="5" height="16" fill="#8B6C58" rx="2.5"/>
      <circle cx="20" cy="15" r="10.5" fill="url(#st12)" opacity="0.9"/>
      <circle cx="12" cy="19" r="7.5" fill="#8BD06A" opacity="0.85"/>
      <circle cx="28" cy="19" r="7.5" fill="#8BD06A" opacity="0.85"/>
      <circle cx="20" cy="9" r="7" fill="#A8E877" opacity="0.8"/>
      <!-- 小阳光点 -->
      <circle cx="16" cy="11" r="1.5" fill="#F8E870" opacity="0.5"/>
    </svg>`;
  },
  // 苍天大树状态（>90%）— 开满黄花的茂盛大树
  bigTree() {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bt11" cx="40%" cy="100%"><stop offset="0%" stop-color="#A08070"/><stop offset="100%" stop-color="#6B4C38"/></radialGradient>
        <radialGradient id="bt12" cx="50%" cy="30%"><stop offset="0%" stop-color="#6BAA48"/><stop offset="100%" stop-color="#3D6B28"/></radialGradient>
      </defs>
      <ellipse cx="20" cy="39" rx="10" ry="2.5" fill="url(#bt11)" opacity="0.7"/>
      <rect x="16" y="20" width="8" height="19" fill="#7B5C48" rx="3"/>
      <ellipse cx="20" cy="11" rx="14" ry="12" fill="url(#bt12)" opacity="0.9"/>
      <circle cx="10" cy="16" r="9.5" fill="#5A9B3A" opacity="0.85"/>
      <circle cx="30" cy="16" r="9.5" fill="#5A9B3A" opacity="0.85"/>
      <circle cx="20" cy="6" r="9" fill="#7BBA58" opacity="0.8"/>
      <circle cx="13" cy="8" r="5" fill="#8BD068" opacity="0.7"/>
      <circle cx="27" cy="8" r="5" fill="#8BD068" opacity="0.7"/>
      <!-- 黄色小花 -->
      <circle cx="15" cy="10" r="2.5" fill="#F8D860"/>
      <circle cx="25" cy="12" r="2.5" fill="#F8D860"/>
      <circle cx="20" cy="17" r="2" fill="#FCE880"/>
      <circle cx="11" cy="17" r="2" fill="#FCE880"/>
      <circle cx="29" cy="13" r="2" fill="#F8D860"/>
      <circle cx="18" cy="8" r="1.8" fill="#FAE060"/>
      <circle cx="23" cy="6" r="1.8" fill="#FAE060"/>
      <circle cx="8" cy="14" r="1.6" fill="#FCE880"/>
      <!-- 花蕊 -->
      <circle cx="15" cy="10" r="1" fill="#E8C840" opacity="0.6"/>
      <circle cx="25" cy="12" r="1" fill="#E8C840" opacity="0.6"/>
      <circle cx="11" cy="17" r="0.8" fill="#E8C840" opacity="0.6"/>
    </svg>`;
  },
  // 根据完成率获取对应SVG
  getByRate(completed, total) {
    if (total === 0) return this.empty();
    const rate = completed / total;
    if (rate < 0.3) return this.seedling();
    if (rate < 0.9) return this.smallTree();
    return this.bigTree();
  },
  getStateByRate(completed, total) {
    if (total === 0) return 'empty';
    const rate = completed / total;
    if (rate < 0.3) return 'seedling';
    if (rate < 0.9) return 'smallTree';
    return 'bigTree';
  }
};

// ==================== 今事今毕 - 日历板块 ====================
const Calendar = {
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),
  selectedDate: null,
  weekdays: ['日','一','二','三','四','五','六'],

  init() {
    // 导航按钮
    document.getElementById('prevMonth').onclick = () => {
      this.viewMonth--;
      if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
      this.render();
    };
    document.getElementById('nextMonth').onclick = () => {
      this.viewMonth++;
      if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
      this.render();
    };
    document.getElementById('todayBtn').onclick = () => {
      const d = new Date();
      this.viewYear = d.getFullYear();
      this.viewMonth = d.getMonth();
      this.render();
    };

    // 弹窗
    document.getElementById('modalClose').onclick = () => this.closeModal();
    document.getElementById('taskModal').onclick = (e) => {
      if (e.target.id === 'taskModal') this.closeModal();
    };
    document.getElementById('addTaskBtn').onclick = () => this.addTask();
    document.getElementById('taskInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    // 图例
    document.getElementById('legendSeedling').innerHTML = TreeSVG.seedling();
    document.getElementById('legendSmallTree').innerHTML = TreeSVG.smallTree();
    document.getElementById('legendBigTree').innerHTML = TreeSVG.bigTree();
    document.getElementById('legendEmpty').innerHTML = TreeSVG.empty();
  },

  getTasks(dateStr) {
    const all = Storage.get('tasks', {});
    return all[dateStr] || [];
  },

  saveTasks(dateStr, tasks) {
    const all = Storage.get('tasks', {});
    all[dateStr] = tasks;
    Storage.set('tasks', all);
  },

  getCompletion(dateStr) {
    const tasks = this.getTasks(dateStr);
    if (tasks.length === 0) return { completed: 0, total: 0, rate: 0 };
    const completed = tasks.filter(t => t.done).length;
    return { completed, total: tasks.length, rate: completed / tasks.length };
  },

  render() {
    document.getElementById('monthLabel').textContent = formatDateCN(this.viewYear, this.viewMonth);
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // 星期标题
    this.weekdays.forEach(w => {
      const el = document.createElement('div');
      el.className = 'cal-weekday';
      el.textContent = w;
      grid.appendChild(el);
    });

    // 计算日历
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const today = todayStr();

    // 空白格
    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      grid.appendChild(el);
    }

    // 日期格
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = dateStr(this.viewYear, this.viewMonth, d);
      const comp = this.getCompletion(ds);
      const el = document.createElement('div');
      el.className = 'cal-day';
      if (ds === today) el.classList.add('today');

      const treeState = TreeSVG.getStateByRate(comp.completed, comp.total);
      // 根据完成状态设定不同深浅背景
      if (treeState === 'seedling') el.style.background = 'rgba(255,240,200,0.3)';
      else if (treeState === 'smallTree') el.style.background = 'rgba(180,210,150,0.18)';
      else if (treeState === 'bigTree') el.style.background = 'rgba(140,190,120,0.22)';

      el.innerHTML = `
        <div class="cal-day-num">${d}</div>
        <div class="cal-day-tree">${TreeSVG.getByRate(comp.completed, comp.total)}</div>
        ${comp.total > 0 ? `<div class="cal-day-task-count">${comp.completed}/${comp.total}</div>` : ''}
      `;
      el.onclick = () => this.openModal(ds, d);
      grid.appendChild(el);
    }

    this.renderMonthSummary();
  },

  renderMonthSummary() {
    const summary = document.getElementById('monthSummary');
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    let seedlings = 0, smallTrees = 0, bigTrees = 0, empty = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = dateStr(this.viewYear, this.viewMonth, d);
      const comp = this.getCompletion(ds);
      const state = TreeSVG.getStateByRate(comp.completed, comp.total);
      if (state === 'seedling') seedlings++;
      else if (state === 'smallTree') smallTrees++;
      else if (state === 'bigTree') bigTrees++;
      else empty++;
    }

    const totalRecorded = seedlings + smallTrees + bigTrees;
    let msg = '';
    if (totalRecorded === 0) {
      msg = '📅 本月还未开始记录任务，点击任意日期开始添加任务吧！';
    } else {
      const rate = totalRecorded > 0 ? (bigTrees / totalRecorded * 100).toFixed(1) : 0;
      if (bigTrees >= 20) {
        msg = `🎉 本月表现优异！${bigTrees}天达成苍天大树，完成率极高。继续保持这个势头，你的习惯之林正在茁壮成长！`;
      } else if (bigTrees >= 10) {
        msg = `💪 本月不错！${bigTrees}天达成苍天大树。还有${smallTrees}天是小树，${seedlings}天是树苗。尝试提高完成率让更多小树长成大树吧！`;
      } else if (totalRecorded >= 10) {
        msg = `💚 本月已记录${totalRecorded}天。大树${bigTrees}棵，小树${smallTrees}棵，树苗${seedlings}棵。继续坚持，让树苗成长为苍天大树！`;
      } else {
        msg = `🌤️ 本月已记录${totalRecorded}天，刚开始记录。坚持每天添加任务并完成，你的日历森林会越来越茂盛！`;
      }
    }

    summary.innerHTML = `
      <h3>📊 ${formatDateCN(this.viewYear, this.viewMonth)} 月度统计</h3>
      <div class="summary-stats">
        <div class="summary-stat">
          ${TreeSVG.seedling()}
          <div>
            <div class="stat-num">${seedlings}</div>
            <div class="stat-desc">树苗（&lt;30%）</div>
          </div>
        </div>
        <div class="summary-stat">
          ${TreeSVG.smallTree()}
          <div>
            <div class="stat-num">${smallTrees}</div>
            <div class="stat-desc">小树（30%-90%）</div>
          </div>
        </div>
        <div class="summary-stat">
          ${TreeSVG.bigTree()}
          <div>
            <div class="stat-num">${bigTrees}</div>
            <div class="stat-desc">苍天大树（&gt;90%）</div>
          </div>
        </div>
        <div class="summary-stat">
          ${TreeSVG.empty()}
          <div>
            <div class="stat-num">${empty}</div>
            <div class="stat-desc">未记录</div>
          </div>
        </div>
      </div>
      <div class="month-summary-message">${msg}</div>
    `;
  },

  openModal(dateStr, dayNum) {
    this.selectedDate = dateStr;
    document.getElementById('modalDateLabel').textContent = `${this.viewYear}年${this.viewMonth+1}月${dayNum}日 任务`;
    document.getElementById('taskInput').value = '';
    this.renderTaskList();
    document.getElementById('taskModal').classList.add('active');
    setTimeout(() => document.getElementById('taskInput').focus(), 100);
  },

  closeModal() {
    document.getElementById('taskModal').classList.remove('active');
    this.selectedDate = null;
  },

  renderTaskList() {
    const tasks = this.getTasks(this.selectedDate);
    const list = document.getElementById('taskList');

    if (tasks.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:30px;color:#bbb;font-size:14px;">还没有任务，添加第一个任务吧！</div>';
    } else {
      list.innerHTML = tasks.map((t, i) => `
        <div class="task-item ${t.done ? 'completed' : ''}">
          <div class="task-checkbox ${t.done ? 'checked' : ''}" onclick="Calendar.toggleTask(${i})"></div>
          <div class="task-text">${this.escapeHtml(t.text)}</div>
          <button class="task-delete" onclick="Calendar.deleteTask(${i})">&times;</button>
        </div>
      `).join('');
    }

    // 完成率
    const comp = this.getCompletion(this.selectedDate);
    const rate = comp.total > 0 ? (comp.rate * 100).toFixed(0) : 0;
    const state = TreeSVG.getStateByRate(comp.completed, comp.total);
    const stateLabel = { empty: '未记录', seedling: '💚 树苗', smallTree: '🌳 小树', bigTree: '🌲🌻 苍天大树' }[state];

    document.getElementById('completionRate').innerHTML = `
      <div class="completion-rate-text">
        完成率：${comp.completed}/${comp.total} = ${rate}% | 状态：${stateLabel}
      </div>
      ${comp.total > 0 ? `<div class="completion-rate-bar"><div class="completion-rate-fill" style="width:${rate}%"></div></div>` : ''}
    `;
  },

  addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;
    if (!this.selectedDate) return;

    const tasks = this.getTasks(this.selectedDate);
    tasks.push({ text, done: false, createdAt: Date.now() });
    this.saveTasks(this.selectedDate, tasks);

    input.value = '';
    this.renderTaskList();
    this.render();
    updateStreak();
    showToast('任务已添加', 'success');
  },

  toggleTask(index) {
    const tasks = this.getTasks(this.selectedDate);
    if (tasks[index]) {
      tasks[index].done = !tasks[index].done;
      this.saveTasks(this.selectedDate, tasks);
      this.renderTaskList();
      this.render();
      updateStreak();
    }
  },

  deleteTask(index) {
    const tasks = this.getTasks(this.selectedDate);
    tasks.splice(index, 1);
    this.saveTasks(this.selectedDate, tasks);
    this.renderTaskList();
    this.render();
    showToast('任务已删除');
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ==================== 连续打卡天数 ====================
function updateStreak() {
  // 统计所有有任务记录的天数
  const all = Storage.get('tasks', {});
  let count = 0;
  Object.keys(all).forEach(date => {
    if (all[date] && all[date].length > 0) count++;
  });
  document.getElementById('streakCount').textContent = count;
}

// ==================== CPA 学习板块 ====================
const CPA = {
  // 三年通关计划
  plan: {
    year1: {
      label: '第一年',
      sub: '2026-2027',
      title: '会计 + 税法 + 经济法',
      desc: '会计是CPA的核心基础，优先攻克。税法和经济法偏记忆，与会计搭配减轻压力。',
      subjects: [
        { name: '会计', priority: 'priority', status: 'ongoing' },
        { name: '税法', priority: 'normal', status: 'planned' },
        { name: '经济法', priority: 'normal', status: 'planned' }
      ]
    },
    year2: {
      label: '第二年',
      sub: '2027-2028',
      title: '审计 + 财管 + 战略',
      desc: '审计需会计基础，第二年学正合适。财管计算量大，战略框架性强可快速突破。',
      subjects: [
        { name: '审计', priority: 'priority', status: 'planned' },
        { name: '财管', priority: 'normal', status: 'planned' },
        { name: '战略', priority: 'optional', status: 'planned' }
      ]
    },
    year3: {
      label: '第三年',
      sub: '2028-2029',
      title: '补考 + 综合阶段',
      desc: '补考未通过的科目，同时准备综合阶段考试。力争6门全过+综合阶段通关！',
      subjects: [
        { name: '补考科目', priority: 'optional', status: 'planned' },
        { name: '综合阶段', priority: 'priority', status: 'planned' }
      ]
    }
  },

  // 每日学习任务模板
  dailyTemplate: [
    { title: '看视频课程', meta: '建议1小时（1.5倍速），工作日1h/周末3h', time: 60 },
    { title: '章节练习题', meta: '建议15-20道选择题+5道主观题', time: 45 },
    { title: '错题复盘', meta: '回顾当天错题，回到讲义找原文', time: 15 },
    { title: '讲义复习', meta: '通读当天学习章节讲义，标记重点', time: 20 }
  ],

  // 知识点复习库（按科目）
  reviewBank: {
    '会计': [
      { title: '长期股权投资', points: '成本法与权益法的适用场景、转换处理、合并报表中的抵消分录。重点掌握同一控制下和非同一控制下企业合并的会计处理差异。' },
      { title: '收入准则', points: '五步法模型：识别合同→识别履约义务→确定交易价格→分摊交易价格→确认收入。合同变更的三种处理方式。' },
      { title: '金融工具', points: '金融资产分类（摊余成本、FVOCI、FVTPL）、减值模型（预期信用损失法）、套期会计的基本概念。' },
      { title: '合并报表', points: '合并范围的确定（控制三要素）、内部交易的抵消处理（存货、固定资产、债权债务）、少数股东权益的计算。' },
      { title: '租赁准则', points: '承租人不再区分经营租赁和融资租赁，确认使用权资产和租赁负债。出租人分类为融资租赁和经营租赁。' }
    ],
    '税法': [
      { title: '增值税', points: '视同销售的九种情形、进项税额抵扣规则（不得抵扣的项目）、简易计税方法、纳税义务发生时间。' },
      { title: '企业所得税', points: '税前扣除项目（工资、福利费、广告费等限额）、税收优惠政策（高新企业15%、小型微利企业）、应纳税所得额调整。' },
      { title: '个人所得税', points: '综合所得（工资薪金、劳务报酬、稿酬、特许权使用费）的汇算清缴、专项附加扣除、经营所得和分类所得。' }
    ],
    '经济法': [
      { title: '公司法', points: '股东出资方式及责任、公司治理结构（股东会/董事会/监事会）、股权转让规则、公司合并分立的程序。' },
      { title: '证券法', points: '首发上市条件、信息披露要求、内幕交易的认定、重大资产重组的标准和程序。' },
      { title: '合同法（民法典）', points: '合同效力（有效/无效/可撤销/效力待定）、合同的履行（抗辩权）、违约责任、典型合同的特殊规则。' }
    ],
    '审计': [
      { title: '审计目标', points: '合理保证财务报表不存在重大错报。认定层次：存在/完整性/准确性/计价/列报。审计风险=重大错报风险×检查风险。' },
      { title: '风险评估', points: '了解被审计单位及其环境、评估财务报表层次和认定层次的重大错报风险、识别特别风险。' },
      { title: '审计证据', points: '充分性和适当性。函证程序（对象/范围/时间/控制）、分析程序、监盘程序的实施要点。' }
    ],
    '财管': [
      { title: '资本预算', points: '净现值法、内含报酬率法、回收期法。互斥项目决策、资本限量决策。现金流量的估计原则。' },
      { title: '资本成本', points: '债务资本成本、权益资本成本（CAPM模型）、加权平均资本成本（WACC）。影响资本成本的因素。' },
      { title: '财务分析', points: '杜邦分析体系、管理用财务报表、可持续增长率。营运能力、偿债能力、盈利能力指标体系。' }
    ],
    '战略': [
      { title: '战略分析', points: 'PEST分析、波特五力模型、价值链分析、SWOT分析。竞争环境分析框架。' },
      { title: '战略选择', points: '总体战略（发展/稳定/收缩）、业务单位战略（成本领先/差异化/集中化）、职能战略。国际化战略。' },
      { title: '风险与内控', points: '企业面临的主要风险类型、风险管理策略、内部控制规范体系（COSO五要素）。' }
    ]
  },

  currentSubject: '会计',

  init() {
    document.getElementById('cpaCheckinBtn').onclick = () => this.checkin();
  },

  getCheckinData() {
    return Storage.get('cpa_checkin', {});
  },

  isCheckedInToday() {
    return !!this.getCheckinData()[todayStr()];
  },

  checkin() {
    if (this.isCheckedInToday()) {
      showToast('今天已经打卡了！', 'warning');
      return;
    }
    const data = this.getCheckinData();
    // 获取今日任务完成状态
    const tasks = Storage.get('cpa_daily_tasks', {});
    const todayTasks = tasks[todayStr()] || this.dailyTemplate.map(t => ({ ...t, done: false }));
    const completedCount = todayTasks.filter(t => t.done).length;

    data[todayStr()] = {
      date: todayStr(),
      completed: completedCount,
      total: todayTasks.length,
      hours: todayTasks.reduce((sum, t) => t.done ? sum + t.time/60 : sum, 0),
      questions: todayTasks.filter(t => t.done && t.title.includes('题')).length * 20
    };
    Storage.set('cpa_checkin', data);

    // 自动记录复习笔记（取当前科目的一个知识点）
    const reviews = Storage.get('cpa_reviews', []);
    const bank = this.reviewBank[this.currentSubject] || [];
    if (bank.length > 0) {
      const idx = reviews.length % bank.length;
      reviews.push({ ...bank[idx], subject: this.currentSubject, date: todayStr() });
      Storage.set('cpa_reviews', reviews);
    }

    showToast('CPA学习打卡成功！🎉', 'success');
    this.render();
  },

  getDailyTasks() {
    const all = Storage.get('cpa_daily_tasks', {});
    if (!all[todayStr()]) {
      all[todayStr()] = this.dailyTemplate.map(t => ({ ...t, done: false }));
      Storage.set('cpa_daily_tasks', all);
    }
    return all[todayStr()];
  },

  toggleDailyTask(index) {
    const tasks = this.getDailyTasks();
    if (tasks[index]) {
      tasks[index].done = !tasks[index].done;
      const all = Storage.get('cpa_daily_tasks', {});
      all[todayStr()] = tasks;
      Storage.set('cpa_daily_tasks', all);
      this.render();
    }
  },

  render() {
    // 统计数据
    const checkinData = this.getCheckinData();
    const dates = Object.keys(checkinData);
    const totalDays = dates.length;
    const totalHours = dates.reduce((sum, d) => sum + (checkinData[d].hours || 0), 0);
    const totalQuestions = dates.reduce((sum, d) => sum + (checkinData[d].questions || 0), 0);

    document.getElementById('cpaTotalDays').textContent = totalDays;
    document.getElementById('cpaTotalHours').textContent = totalHours.toFixed(1);
    document.getElementById('cpaQuestionsDone').textContent = totalQuestions;

    // 通过科目数（这里简化处理，用户可手动标记）
    const passedSubjects = Storage.get('cpa_passed', []);
    document.getElementById('cpaSubjectsPassed').textContent = `${passedSubjects.length}/6`;

    // 时间线
    const timeline = document.getElementById('cpaTimeline');
    timeline.innerHTML = '<h2>📅 三年通关计划</h2>';
    [this.plan.year1, this.plan.year2, this.plan.year3].forEach(year => {
      const subjectHTML = year.subjects.map(s => {
        const passed = passedSubjects.includes(s.name);
        const cls = passed ? 'tag-done' : `tag-${s.priority}`;
        return `<span class="subject-tag ${cls}">${s.name}</span>`;
      }).join('');

      timeline.innerHTML += `
        <div class="timeline-item">
          <div class="timeline-year">
            <div class="year-label">${year.label}</div>
            <div class="year-sub">${year.sub}</div>
          </div>
          <div class="timeline-content">
            <h4>${year.title}</h4>
            <p>${year.desc}</p>
            <div class="subject-tags">${subjectHTML}</div>
          </div>
        </div>
      `;
    });

    // 学习节奏建议
    timeline.innerHTML += `
      <div style="margin-top:16px;padding:16px;background:var(--primary-bg);border-radius:8px;font-size:13px;color:var(--primary-dark);line-height:1.8;">
        <strong>🩵 学习节奏建议（来自经验贴总结）：</strong><br>
        • 工作日：每天2.5-3小时（1h听课+1.5h刷题+错题整理）<br>
        • 周末：每天6-8小时（整套真题模拟+主观题练习）<br>
        • 复习轮次：第一轮听课+章节练习（3个月）→ 第二轮重读讲义+查漏补缺（1.5个月）→ 第三轮近5年真题2遍+考前冲刺（1.5个月）<br>
        • 备考周期：每科约6个月，每年准备3科，2年过6科+1年综合阶段
      </div>
    `;

    // 今日任务
    const tasks = this.getDailyTasks();
    const taskList = document.getElementById('cpaDailyTasks');
    taskList.innerHTML = tasks.map((t, i) => `
      <div class="daily-task-item ${t.done ? 'completed' : ''}">
        <div class="daily-task-checkbox ${t.done ? 'checked' : ''}" onclick="CPA.toggleDailyTask(${i})"></div>
        <div class="daily-task-info">
          <div class="daily-task-title">${t.title}</div>
          <div class="daily-task-meta">⏱️ ${t.time}分钟 | ${t.meta}</div>
        </div>
      </div>
    `).join('');

    // 打卡按钮状态
    const btn = document.getElementById('cpaCheckinBtn');
    if (this.isCheckedInToday()) {
      btn.disabled = true;
      btn.textContent = '✅ 今日已打卡';
    } else {
      btn.disabled = false;
      btn.textContent = '✅ 今日打卡';
    }

    // 昨日复习
    this.renderReview();
  },

  renderReview() {
    const reviews = Storage.get('cpa_reviews', []);
    const container = document.getElementById('cpaReviewContent');

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="review-empty">
          还没有复习记录。<br>
          每日打卡后，系统会自动从前一天的学习内容中提取知识点供你复习。
        </div>
      `;
      return;
    }

    // 显示最近3条复习记录
    const recent = reviews.slice(-3).reverse();
    container.innerHTML = recent.map(r => `
      <div class="review-item">
        <h5>📌 ${r.subject} - ${r.title} <span style="font-size:11px;color:var(--text-light);">(${r.date})</span></h5>
        <p>${r.points}</p>
      </div>
    `).join('');
  }
};

// ==================== 英语学习板块 ====================
const English = {
  // 三阶段计划（2026-2028，每天≤30分钟）
  phases: [
    {
      name: '第一阶段：基础积累期',
      period: '2026年全年',
      badge: '基础',
      current: true,
      details: [
        { label: '每日单词', value: '15个新词 + SRS复习旧词（10分钟）' },
        { label: '每日听力', value: 'BBC 6 Minute English / 播客精听（10分钟）' },
        { label: '每日阅读', value: '1篇短文/外刊精读（10分钟）' },
        { label: '每周写作', value: '周六写1篇短文（20分钟）' },
        { label: '每周口语', value: '周日跟读练习5个话题（15分钟）' },
        { label: '阶段目标', value: '词汇量达6000+，能听懂日常对话，读懂500词文章' }
      ]
    },
    {
      name: '第二阶段：专项突破期',
      period: '2027年全年',
      badge: '强化',
      current: false,
      details: [
        { label: '每日单词', value: '20个新词 + 复习（10分钟）' },
        { label: '每日听力', value: '剑桥真题Section 3-4精听（10分钟）' },
        { label: '每日阅读', value: '1篇雅思真题阅读+同义替换整理（10分钟）' },
        { label: '每周写作', value: '2篇写作（图表+议论文），对照范文修改' },
        { label: '每周口语', value: '3次Part 2话题演练，录音复盘' },
        { label: '阶段目标', value: '听力阅读正确率稳定70%+，写作形成模板框架' }
      ]
    },
    {
      name: '第三阶段：冲刺模考期',
      period: '2028年1-8月',
      badge: '冲刺',
      current: false,
      details: [
        { label: '每日单词', value: '高频词复习 + 易错词巩固（8分钟）' },
        { label: '每日听力', value: '真题模考+精听复盘（12分钟）' },
        { label: '每日阅读', value: '限时阅读训练（10分钟）' },
        { label: '每周模考', value: '1套完整真题模考（周末进行）' },
        { label: '写作口语', value: '每周各3次专项练习+修改迭代' },
        { label: '阶段目标', value: '总分6.5-7.0+，2028年下半年参加考试' }
      ]
    }
  ],

  dailyTemplate: [
    { title: '背单词', meta: '15个新词+复习旧词（用APP或单词本）', time: 10 },
    { title: '听力练习', meta: 'BBC 6 Minute English 精听+跟读', time: 10 },
    { title: '阅读练习', meta: '1篇短文/外刊，积累生词和表达', time: 10 }
  ],

  reviewBank: [
    { title: '同义替换', points: '雅思核心技巧。如 important = crucial/vital/significant；problem = issue/challenge/dilemma。每天积累3组同义替换，阅读和写作都能用。' },
    { title: '听力关键词', points: '注意转折词（but/however/actually）后的信息往往是答案。连读和弱读：not at all → no-ta-tall。预判考点：圈出题干定位词。' },
    { title: '阅读定位法', points: '先看题目→标记关键词→回文定位→对比选项。注意同义替换是正确答案的核心特征。Heading题用首末句+核心词。' },
    { title: '写作结构', points: '大作文：Introduction（改写题目+立场）→ Body 1（论点1+例证）→ Body 2（论点2+例证）→ Conclusion（总结+重申）。每段开头用连接词。' },
    { title: '口语Part 2', points: '准备万能素材：一个人/一个地方/一件事/一个物品。用5W1H展开：When/Where/Who/What/Why/How。说满2分钟是关键。' },
    { title: '语法重点', points: '定语从句、被动语态、虚拟语气、倒装句。写作中主动使用复杂句型提升分数，但确保正确性。' },
    { title: '高频词汇', points: '学术词汇表（AWL）是雅思核心。如 analyze/approach/assess/concept/derive/distribute/emphasize/establish/evaluate/identify。' },
    { title: '听力场景', points: '租房场景（deposit/lease/utility）、选课场景（semester/assignment/tutorial）、旅游场景（itinerary/accommodation/excursion）。' }
  ],

  init() {
    document.getElementById('engCheckinBtn').onclick = () => this.checkin();
  },

  getCheckinData() { return Storage.get('eng_checkin', {}); },
  isCheckedInToday() { return !!this.getCheckinData()[todayStr()]; },

  checkin() {
    if (this.isCheckedInToday()) {
      showToast('今天已经打卡了！', 'warning');
      return;
    }
    const data = this.getCheckinData();
    const tasks = this.getDailyTasks();
    const completedCount = tasks.filter(t => t.done).length;

    data[todayStr()] = {
      date: todayStr(),
      completed: completedCount,
      total: tasks.length,
      words: tasks.filter(t => t.done && t.title.includes('单词')).length * 15,
      articles: tasks.filter(t => t.done && t.title.includes('阅读')).length
    };
    Storage.set('eng_checkin', data);

    // 记录复习笔记
    const reviews = Storage.get('eng_reviews', []);
    const idx = reviews.length % this.reviewBank.length;
    reviews.push({ ...this.reviewBank[idx], date: todayStr() });
    Storage.set('eng_reviews', reviews);

    showToast('英语学习打卡成功！🎉', 'success');
    this.render();
  },

  getDailyTasks() {
    const all = Storage.get('eng_daily_tasks', {});
    if (!all[todayStr()]) {
      all[todayStr()] = this.dailyTemplate.map(t => ({ ...t, done: false }));
      Storage.set('eng_daily_tasks', all);
    }
    return all[todayStr()];
  },

  toggleDailyTask(index) {
    const tasks = this.getDailyTasks();
    if (tasks[index]) {
      tasks[index].done = !tasks[index].done;
      const all = Storage.get('eng_daily_tasks', {});
      all[todayStr()] = tasks;
      Storage.set('eng_daily_tasks', all);
      this.render();
    }
  },

  render() {
    // 统计
    const data = this.getCheckinData();
    const dates = Object.keys(data);
    const totalDays = dates.length;
    const totalWords = dates.reduce((s, d) => s + (data[d].words || 0), 0);
    const totalArticles = dates.reduce((s, d) => s + (data[d].articles || 0), 0);

    // 连续天数
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const ds = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
      if (data[ds]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    document.getElementById('engTotalDays').textContent = totalDays;
    document.getElementById('engTotalWords').textContent = totalWords;
    document.getElementById('engStreakDays').textContent = streak;
    document.getElementById('engArticlesRead').textContent = totalArticles;

    // 阶段计划
    const plan = document.getElementById('engPhasePlan');
    plan.innerHTML = '<h2>📅 雅思备考三年计划（每天≤30分钟）</h2>';
    this.phases.forEach(phase => {
      const detailsHTML = phase.details.map(d => `
        <div><strong>${d.label}：</strong>${d.value}</div>
      `).join('');
      plan.innerHTML += `
        <div class="phase-item ${phase.current ? 'current' : ''}">
          <h4>${phase.name} <span class="phase-badge">${phase.badge}</span></h4>
          <div class="phase-detail">
            <div style="margin-bottom:6px;color:var(--text-light);">${phase.period}</div>
            ${detailsHTML}
          </div>
        </div>
      `;
    });

    // 习惯养成提示
    plan.innerHTML += `
      <div style="margin-top:16px;padding:16px;background:var(--accent-light);border-radius:8px;font-size:13px;color:#F57F17;line-height:1.8;">
        <strong>💡 习惯养成核心原则（来自经验贴总结）：</strong><br>
        • 每天固定时间学习（如早起后或睡前），形成肌肉记忆<br>
        • 单词用艾宾浩斯遗忘曲线法：新词在第1/2/4/7/15天复习<br>
        • 听力利用碎片时间（通勤、做家务）泛听，正式学习时间精听<br>
        • 不要急于刷真题！基础期先积累词汇和语感，强化期再刷剑桥真题<br>
        • 记录学习日志，每周复盘一次，调整计划
      </div>
    `;

    // 今日任务
    const tasks = this.getDailyTasks();
    document.getElementById('engDailyTasks').innerHTML = tasks.map((t, i) => `
      <div class="daily-task-item ${t.done ? 'completed' : ''}">
        <div class="daily-task-checkbox ${t.done ? 'checked' : ''}" onclick="English.toggleDailyTask(${i})"></div>
        <div class="daily-task-info">
          <div class="daily-task-title">${t.title}</div>
          <div class="daily-task-meta">⏱️ ${t.time}分钟 | ${t.meta}</div>
        </div>
      </div>
    `).join('');

    // 打卡按钮
    const btn = document.getElementById('engCheckinBtn');
    if (this.isCheckedInToday()) {
      btn.disabled = true;
      btn.textContent = '✅ 今日已打卡';
    } else {
      btn.disabled = false;
      btn.textContent = '✅ 今日打卡';
    }

    // 复习
    this.renderReview();
  },

  renderReview() {
    const reviews = Storage.get('eng_reviews', []);
    const container = document.getElementById('engReviewContent');

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="review-empty">
          还没有复习记录。<br>
          每日打卡后，系统会自动提取一个雅思核心知识点供你复习。
        </div>
      `;
      return;
    }

    const recent = reviews.slice(-3).reverse();
    container.innerHTML = recent.map(r => `
      <div class="review-item">
        <h5>📌 ${r.title} <span style="font-size:11px;color:var(--text-light);">(${r.date})</span></h5>
        <p>${r.points}</p>
      </div>
    `).join('');
  }
};

// ==================== 韩语学习板块 ====================
const Korean = {
  // 三年计划（TOPIK 4级）
  phases: [
    {
      name: '第一阶段：入门打基础',
      period: '第1-6个月',
      badge: '入门',
      current: true,
      details: [
        { label: '每日单词', value: '20个新词 + 复习（15分钟）' },
        { label: '教材', value: '《延世韩国语1-2》每天1课（10分钟）' },
        { label: '听力', value: '教材音频跟读模仿（5分钟）' },
        { label: '阶段目标', value: '掌握四十音、基础语法、日常对话，达TOPIK 1-2级水平' }
      ]
    },
    {
      name: '第二阶段：初级进中级',
      period: '第7-12个月',
      badge: '初级→中级',
      current: false,
      details: [
        { label: '每日单词', value: '30个新词 + 复习（15分钟）' },
        { label: '教材', value: '《延世韩国语3》每天1课（10分钟）' },
        { label: '听力', value: '韩剧/综艺片段精听（5分钟）' },
        { label: '阶段目标', value: '学完中级语法，能看懂短文，达TOPIK 3级水平' }
      ]
    },
    {
      name: '第三阶段：中级完整学习',
      period: '第二年',
      badge: '中级',
      current: false,
      details: [
        { label: '每日单词', value: '30个新词 + 高频词复习（15分钟）' },
        { label: '教材', value: '《延世韩国语4》每天1课（10分钟）' },
        { label: '练习', value: 'TOPIK真题阅读1篇 + 听力1段（5分钟）' },
        { label: '阶段目标', value: '系统学完中级全部内容，接近TOPIK 4级水平' }
      ]
    },
    {
      name: '第四阶段：真题冲刺',
      period: '第三年',
      badge: '冲刺',
      current: false,
      details: [
        { label: '每日单词', value: 'TOPIK中级核心词复习（10分钟）' },
        { label: '真题', value: '每周2套真题，每天分项练习（15分钟）' },
        { label: '写作', value: '背模板+练小作文/大作文（5分钟）' },
        { label: '阶段目标', value: 'TOPIK 4级稳过（220-250分），日常沟通流畅' }
      ]
    }
  ],

  dailyTemplate: [
    { title: '背韩语单词', meta: '20个新词+复习旧词（用APP或单词本）', time: 15 },
    { title: '教材学习', meta: '《延世韩国语》当天课程：单词+课文+语法', time: 10 },
    { title: '听力跟读', meta: '教材音频/韩剧片段跟读模仿', time: 5 }
  ],

  reviewBank: [
    { title: '韩语四十音', points: '元音21个（ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ等）+ 辅音19个（ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ等）+ 双辅音（ㄲㄸㅃㅆㅉ）。收音7个基本音：ㄱㄴㄷㄹㅁㅂㅇ。' },
    { title: '敬语体系', points: '비니다/습니다（格式体尊敬）、아/어요（非格式体尊敬）、반말（半语/平语）。对长辈/上级用敬语，朋友间用半语。이에요/예요表示"是"。' },
    { title: '时态表达', points: '现在时：-아/어요。过去时：-았/었어요（았用于ㅏㅑㅗ，었用于其他）。将来时：-ㄹ/을 거예요。进行时：-고 있다。' },
    { title: '连接词尾', points: '-고（并列）、-아/어서（原因/顺序）、-지만（转折）、-거나（或者）、-(으)면（条件）、-기 때문에（因为）。这些是TOPIK必考语法点。' },
    { title: '助词系统', points: '은/는（主题）、이/가（主语）、을/를（宾语）、에（时间/地点）、에서（从...出发/在...做）、의（的）、에게/한테（给...）。' },
    { title: '使动与被动', points: '使动：-게 하다/-도록 하다（让...做...）。被动：-아/어지다（被...）。이/히/리/기 被动后缀。如 보다→보이다（被看到）。' },
    { title: 'TOPIK写作模板', points: '小作文（图表描述）：开头引入数据→描述趋势→对比分析→总结。大作文：开头表明观点→分2点论述（各1段）→结尾总结。用连接词먼저/또한/결론적으로。' },
    { title: '高频语法', points: '-고 싶다（想做）、-기 위해서（为了）、-아/어야 한다（必须）、-ㄹ 수 있다（能）、-는 것（名词化）、-아/어 보다（尝试做）。' },
    { title: '听力技巧', points: 'TOPIK听力重点抓关键词和语气。对话题注意人物关系和场所。注意敬语级别判断正式/非正式场合。提前读题预判内容。' },
    { title: '阅读策略', points: '先看题目再读文章。注意段落首句是主旨。关键词定位法：找数字、人名、专有名词。时间紧张时先做有把握的题。' }
  ],

  init() {
    document.getElementById('korCheckinBtn').onclick = () => this.checkin();
  },

  getCheckinData() { return Storage.get('kor_checkin', {}); },
  isCheckedInToday() { return !!this.getCheckinData()[todayStr()]; },

  checkin() {
    if (this.isCheckedInToday()) {
      showToast('今天已经打卡了！', 'warning');
      return;
    }
    const data = this.getCheckinData();
    const tasks = this.getDailyTasks();
    const completedCount = tasks.filter(t => t.done).length;

    data[todayStr()] = {
      date: todayStr(),
      completed: completedCount,
      total: tasks.length,
      words: tasks.filter(t => t.done && t.title.includes('单词')).length * 20
    };
    Storage.set('kor_checkin', data);

    // 记录复习
    const reviews = Storage.get('kor_reviews', []);
    const idx = reviews.length % this.reviewBank.length;
    reviews.push({ ...this.reviewBank[idx], date: todayStr() });
    Storage.set('kor_reviews', reviews);

    showToast('韩语学习打卡成功！🎉', 'success');
    this.render();
  },

  getDailyTasks() {
    const all = Storage.get('kor_daily_tasks', {});
    if (!all[todayStr()]) {
      all[todayStr()] = this.dailyTemplate.map(t => ({ ...t, done: false }));
      Storage.set('kor_daily_tasks', all);
    }
    return all[todayStr()];
  },

  toggleDailyTask(index) {
    const tasks = this.getDailyTasks();
    if (tasks[index]) {
      tasks[index].done = !tasks[index].done;
      const all = Storage.get('kor_daily_tasks', {});
      all[todayStr()] = tasks;
      Storage.set('kor_daily_tasks', all);
      this.render();
    }
  },

  getCurrentPhaseName() {
    const data = this.getCheckinData();
    const totalDays = Object.keys(data).length;
    if (totalDays < 180) return '入门期';
    if (totalDays < 365) return '初级→中级';
    if (totalDays < 730) return '中级期';
    return '冲刺期';
  },

  render() {
    const data = this.getCheckinData();
    const dates = Object.keys(data);
    const totalDays = dates.length;
    const totalWords = dates.reduce((s, d) => s + (data[d].words || 0), 0);

    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const ds = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
      if (data[ds]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    document.getElementById('korTotalDays').textContent = totalDays;
    document.getElementById('korTotalWords').textContent = totalWords;
    document.getElementById('korStreakDays').textContent = streak;
    document.getElementById('korPhase').textContent = this.getCurrentPhaseName();

    // 阶段计划
    const plan = document.getElementById('korPhasePlan');
    plan.innerHTML = '<h2>📅 TOPIK 4级三年学习计划</h2>';
    this.phases.forEach(phase => {
      const detailsHTML = phase.details.map(d => `
        <div><strong>${d.label}：</strong>${d.value}</div>
      `).join('');
      plan.innerHTML += `
        <div class="phase-item ${phase.current ? 'current' : ''}">
          <h4>${phase.name} <span class="phase-badge">${phase.badge}</span></h4>
          <div class="phase-detail">
            <div style="margin-bottom:6px;color:var(--text-light);">${phase.period}</div>
            ${detailsHTML}
          </div>
        </div>
      `;
    });

    plan.innerHTML += `
      <div style="margin-top:16px;padding:16px;background:var(--accent-light);border-radius:8px;font-size:13px;color:#F57F17;line-height:1.8;">
        <strong>💡 习惯养成核心原则（来自经验贴总结）：</strong><br>
        • 单词是基石：每天固定时间背词，用SRS间隔复习法（1/2/4/7/15天循环）<br>
        • 课文跟读最重要：每课课文跟读到能脱口而出，培养语感<br>
        • 利用碎片时间听韩语：通勤时听韩剧/综艺/播客，磨耳朵<br>
        • 不要急于刷真题：先把延世1-4册学完，再开始真题训练<br>
        • 写作背模板：TOPIK小作文（图表描述）和大作文（观点论述）都有固定框架
      </div>
    `;

    // 今日任务
    const tasks = this.getDailyTasks();
    document.getElementById('korDailyTasks').innerHTML = tasks.map((t, i) => `
      <div class="daily-task-item ${t.done ? 'completed' : ''}">
        <div class="daily-task-checkbox ${t.done ? 'checked' : ''}" onclick="Korean.toggleDailyTask(${i})"></div>
        <div class="daily-task-info">
          <div class="daily-task-title">${t.title}</div>
          <div class="daily-task-meta">⏱️ ${t.time}分钟 | ${t.meta}</div>
        </div>
      </div>
    `).join('');

    // 打卡按钮
    const btn = document.getElementById('korCheckinBtn');
    if (this.isCheckedInToday()) {
      btn.disabled = true;
      btn.textContent = '✅ 今日已打卡';
    } else {
      btn.disabled = false;
      btn.textContent = '✅ 今日打卡';
    }

    // 复习
    this.renderReview();
  },

  renderReview() {
    const reviews = Storage.get('kor_reviews', []);
    const container = document.getElementById('korReviewContent');

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="review-empty">
          还没有复习记录。<br>
          每日打卡后，系统会自动提取一个韩语核心知识点供你复习。
        </div>
      `;
      return;
    }

    const recent = reviews.slice(-3).reverse();
    container.innerHTML = recent.map(r => `
      <div class="review-item">
        <h5>📌 ${r.title} <span style="font-size:11px;color:var(--text-light);">(${r.date})</span></h5>
        <p>${r.points}</p>
      </div>
    `).join('');
  }
};

// ==================== PWA / 移动端支持 ====================
const PWA = {
  init() {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then(() => {
        console.log('[YUHE] Service Worker 已注册');
      }).catch(err => {
        console.warn('[YUHE] Service Worker 注册失败:', err);
      });
    }

    // 移动端底部导航绑定
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        navigateTo(item.dataset.section);
      });
    });

    // iOS 安装引导
    this.handleIOSInstall();
  },

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  handleIOSInstall() {
    const modal = document.getElementById('pwaInstallModal');
    const closeBtn = document.getElementById('pwaInstallClose');
    if (!modal || !closeBtn) return;

    // 仅在 iOS Safari 未安装为 PWA 时显示
    if (!this.isIOS() || this.isStandalone()) {
      modal.style.display = 'none';
      return;
    }

    // 3 秒后显示引导
    setTimeout(() => {
      const dismissed = localStorage.getItem('yuhe_install_dismissed');
      if (!dismissed) modal.classList.add('show');
    }, 3000);

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      localStorage.setItem('yuhe_install_dismissed', Date.now());
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 导航绑定
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.section);
    });
  });

  // 初始化各模块
  Calendar.init();
  CPA.init();
  English.init();
  Korean.init();
  PWA.init();

  // 更新连续天数
  updateStreak();

  // 默认显示日历
  Calendar.render();
});
