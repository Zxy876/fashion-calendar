Fashion Calendar 是一款基于 React 的现代化日程管理应用，专为优雅的时间管理和事件跟踪而设计。该应用注重用户体验和移动端响应能力，提供了直观的日常规划界面，具备事件分类、内容管理和持久化数据存储等丰富功能。
项目在线体验https://fashion-calendar.netlify.app/
# Fashion Calendar

一个时尚、美观的日历应用，帮助您管理日程、记录日记。基于 React 构建，提供月/周/日视图切换，支持事件分类管理、本地存储等功能。

## 截图

<div align="center">
  <img src="screenshot-calendar.png" alt="日历视图" width="800"/>
  <img src="screenshot-detail.png" alt="日期详情" width="800"/>
</div>

## 功能特性

### 📅 日历视图
- **多视图支持**：月视图、周视图、日视图自由切换
- **悬停预览**：鼠标悬停在日期上可快速查看当日事件
- **事件分类**：支持工作、会议、个人、紧急四种事件类型，不同颜色区分
- **快速导航**：便捷的日期导航和"回到今天"功能

### ✏️ 日期详情页
- **日记记录**：为每一天添加文字日记
- **图片上传**：支持上传多张图片记录生活瞬间
- **自定义背景**：可为每日页面设置不同的背景颜色
- **事件清单**：添加待办事件并标记完成状态

### 💾 数据持久化
- 所有事件和日记内容自动保存到浏览器 LocalStorage
- 刷新页面后数据依然保留

### 🎨 时尚 UI
- 精心设计的现代化界面
- 响应式布局，适配不同屏幕尺寸
- 流畅的交互动画

## 技术栈

- **React 18** - 用户界面框架
- **React Router** - 路由管理
- **react-big-calendar** - 日历组件
- **Moment.js** - 日期处理
- **CSS3** - 样式设计

## 安装运行

### 环境要求
- Node.js >= 14
- npm >= 6

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 [http://localhost:3000](http://localhost:3000) 打开。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `build/` 目录。

## 使用说明

### 查看日历
1. 启动应用后默认显示月视图
2. 点击上方工具栏的"月/周/日"按钮切换视图
3. 使用左右箭头或"今天"按钮快速导航

### 添加事件
1. 点击日历空白区域或点击"+ 添加事件"按钮
2. 输入事件名称和类型（work/meeting/personal/urgent）
3. 新事件将立即显示在日历上

### 查看日期详情
1. 点击日历中的任意日期
2. 进入详情页后可编辑日记、上传图片、管理事件清单
3. 点击"保存"按钮存储更改

## 项目结构

```
fashion-calendar/
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── components/
│   │   ├── CalendarPage.jsx   # 日历主页面
│   │   ├── CalendarPage.css   # 日历样式
│   │   ├── DateDetailPage.jsx # 日期详情页
│   │   └── DateDetailPage.css # 详情页样式
│   ├── App.jsx              # 应用入口
│   ├── App.css              # 全局样式
│   ├── index.js             # React 入口
│   └── main.jsx             # 主入口
├── package.json
└── README.md
```

## 事件类型说明

| 类型 | 颜色 | 说明 |
|------|------|------|
| work | 蓝色 | 工作相关事务 |
| meeting | 紫色 | 各类会议 |
| personal | 绿色 | 个人安排 |
| urgent | 红色 | 紧急事务 |

## 开发计划

- [ ] 数据导出/导入功能
- [ ] 事件提醒通知
- [ ] 云端同步支持
- [ ] 深色模式
- [ ] 更多自定义主题

## License

MIT

## Author

[Zxy876](https://github.com/Zxy876)
