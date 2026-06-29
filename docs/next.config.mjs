import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  // 如果部署到 username.github.io/<repo>，取消注释下一行并替换 <repo-name>
  // basePath: '/<repo-name>',
};

export default withMDX(config);
