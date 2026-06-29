# 面试学习

后端开发技术面试知识库，基于 [Fumadocs](https://fumadocs.dev) + Next.js 构建的文档站点。

## 快速开始

```bash
cd docs
npm install
npm run dev        # 开发模式，访问 http://localhost:3000
npm run build      # 生产构建
```

## 内容概览

### Java 基础
- **并发编程** — 线程池、AQS、synchronized vs ReentrantLock、虚拟线程（Java 21）
- **集合框架** — HashMap、ConcurrentHashMap、红黑树
- **排序算法** — 快速排序、直接插入排序、希尔排序
- **JVM** — 类加载、内存布局、垃圾回收（含 ZGC/Shenandoah）
- **NIO** — BIO vs NIO、零拷贝

### 中间件
- Dubbo 3.x（RPC 全链路、集群容错、SPI、Triple 协议）
- Spring Cloud（Gateway、Nacos、Sentinel、Spring Boot 3）
- Redis（持久化、集群、淘汰策略、Redis 7 特性）
- MQ（可靠性、幂等、顺序消息、分布式事务）
- Kafka（分区、消费者组、KRaft 去 ZooKeeper）
- ZooKeeper（数据模型、顺序保证）
- Netty（零拷贝）

### 架构设计
- OAuth 2.0 / 2.1 / PKCE
- 设计模式（六大原则 + 23 种模式）
- 数据库（事务隔离、InnoDB 锁、MVCC、MySQL 8.0）
- 缓存架构（Cache-Aside、多级缓存、雪崩/穿透/击穿）
- DDD（实体、值对象、聚合、限界上下文、六边形架构）
- 事件驱动（CQRS、Event Sourcing、Outbox 模式）
- 高并发设计（短链系统、分布式 ID、计数系统、限流）
- 分布式一致性

### AI
- LLM 基础（Transformer、Tokenization、Prompt 工程、模型选型）
- Agent 开发（ReAct、工具调用、记忆系统、安全防护）
- 上下文管理（Claude Code 设计深度解析、Memory 系统、压缩策略）
- RAG（分块、向量检索、重排序、Graph RAG）
- MCP（Model Context Protocol）
- Agent 评测（Evals 方法论、LLM-as-Judge、质量门禁）
- AI Coding（Prompt 工程、Agentic Coding、CLAUDE.md）

### Leetcode 刷题
- **动态规划** — 最长连续子序列、最小路径和、背包问题、最大子序和、最长回文子串
- **双指针** — 接雨水问题
- **哈希表 + 双指针** — 2Sum、3Sum、4Sum

### 工具与运维
- SSH 免密登录
- Git Submodule
- Java 进程 CPU 排查

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | React 框架（Turbopack） |
| React | 19 | UI |
| Fumadocs | 16 | 文档框架（MDX、搜索、OG） |
| Tailwind CSS | 4 | 样式 |
| TypeScript | 6 | 类型检查 |

## 项目结构

```
interview-learning/
├── README.md
├── pdf/                          # 原始学习笔记（PDF）
└── docs/                         # 文档站点
    ├── package.json
    ├── source.config.ts           # Fumadocs 内容源配置
    ├── next.config.mjs
    ├── src/
    │   ├── app/
    │   │   ├── (home)/            # 首页
    │   │   ├── docs/              # 文档布局
    │   │   └── api/search/        # 搜索 API
    │   └── lib/
    │       ├── shared.ts          # 站点名称配置
    │       ├── source.ts          # 内容源适配器
    │       └── layout.shared.tsx  # 布局选项
    └── content/docs/              # 📝 文档内容（MDX）
        ├── java/                  # Java 基础（6 篇）
        ├── middleware/            # 中间件（7 篇）
        ├── architecture/          # 架构设计（8 篇）
        ├── ai/                    # AI（8 篇）
        ├── tools/                 # 工具（3 篇）
        └── leetcode/              # Leetcode 刷题（7 篇）
```
