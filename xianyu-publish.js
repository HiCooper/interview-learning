const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS = {
  homepage: path.resolve(__dirname, 'screenshot-homepage.png'),
  concurrency: path.resolve(__dirname, 'screenshot-java-concurrency.png'),
  ai: path.resolve(__dirname, 'screenshot-ai.png'),
};

const LISTING = {
  title: '后端面试知识库｜6大模块41篇精华笔记 + 交互学习系统',
  content: `🔥 后端面试知识库｜41篇精华笔记 + 交互学习系统

💰 价格：9.9 元（电子版，拍下即发）

---

📦 这不是网上扒的 PDF，是一套结构化的面试知识体系：

**6 大模块 · 41 篇文章 · 持续更新**

☕ Java 基础：并发编程（AQS/线程池/synchronized）、集合框架、JVM、NIO、排序算法
🔧 中间件：Dubbo RPC 全链路、Spring Cloud 全家桶、Redis 持久化与集群、MQ/Kafka、ZooKeeper、Netty 零拷贝
🏗 架构设计：DDD 领域驱动、事件驱动+CQRS、缓存架构、高并发设计、数据库事务与索引、OAuth 2.0、设计模式、分布式一致性
🤖 AI 技术：LLM 基础、Agent 开发（ReAct/Multi-Agent）、RAG 全流程、MCP 协议、Agent 评测、AI Coding、上下文管理
🧩 Leetcode：动态规划 5 题、双指针 2 题（接雨水/N-Sum），含完整推导与代码
🛠 工具运维：Java CPU 排查、Git Submodule、SSH 免密

---

✨ 为什么值得买：

✅ 每篇文章含有速查卡 + 自测题，学完就能检验
✅ 附带交互学习系统（React 应用）：闪卡模式 + 间隔重复 + 五阶段科学学习法
✅ MDX 源文件交付，可用 Obsidian / Typora / VS Code 直接打开阅读
✅ 非培训机构的通用资料，真实面试准备笔记

---

📬 拍下后发网盘链接，含：
- 完整 Markdown/MDX 源文件（41 篇）
- 交互学习系统部署包
- GitHub Page 在线文档站地址

🎯 适合：1-5 年经验的 Java/后端开发，准备大厂面试 or 系统梳理知识体系

拍前请私聊确认，虚拟商品售出不退。`,
  price: '9.9',
};

(async () => {
  const executablePath = '/home/hicooper/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

  console.log('🚀 启动浏览器...');
  const browser = await chromium.launch({
    headless: false,
    executablePath,
    args: ['--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  console.log('📱 导航到闲鱼发布页...');
  console.log('💡 如需登录，请在浏览器中扫码后按 Enter 继续...\n');

  await page.goto('https://2.taobao.com/publish/sell.htm', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  }).catch(() => {
    console.log('⚠️ 自动跳转可能被拦截');
  });

  console.log('当前 URL:', page.url());
  console.log('页面标题:', await page.title());
  console.log('\n👉 登录后在终端按 Enter 继续自动填写...');

  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  // Click publish
  const publishBtn = await page.$('text=发布');
  if (publishBtn) {
    console.log('点击发布按钮...');
    await publishBtn.click();
    await page.waitForTimeout(2000);
  }

  // Fill title
  const titleInput = await page.$('[placeholder*="标题"]');
  if (titleInput) {
    console.log('填写标题...');
    await titleInput.fill(LISTING.title);
  } else {
    console.log('未找到标题输入框，尝试手动选择...');
  }

  // Fill description
  const descInput = await page.$('[placeholder*="描述"]');
  if (descInput) {
    console.log('填写描述...');
    await descInput.fill(LISTING.content);
  }

  // Fill price
  const priceInput = await page.$('[placeholder*="价格"]');
  if (priceInput) {
    console.log('填写价格...');
    await priceInput.fill(LISTING.price);
  }

  console.log('\n✅ 自动填写完成！请手动：');
  console.log('1. 上传截图（项目根目录：screenshot-homepage.png, screenshot-java-concurrency.png, screenshot-ai.png）');
  console.log('2. 选择分类');
  console.log('3. 确认发布');
  console.log('\n浏览器保持打开，完成后关闭即可。');

  await new Promise(() => {});
})();
