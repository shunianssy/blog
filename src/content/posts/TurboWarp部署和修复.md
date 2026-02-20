---
title: TurboWarp 编辑器部署和修复文档
published: 2026-02-20
description: TurboWarp的部署与部署后出现报错的修复
tags: [github,open,TurboWarp,scratch]
category: 开源
draft: false
---

# TurboWarp 编辑器部署和修复文档

## 1. 部署步骤

### 1.1 克隆仓库

```bash
git clone https://github.com/TurboWarp/scratch-gui
cd scratch-gui
```

### 1.2 安装依赖

使用 pnpm 安装依赖：

```bash
pnpm install --ignore-scripts
```

### 1.3 启动开发服务器

```bash
pnpm start
```

开发服务器将在 http://localhost:8601/ 上运行。

## 2. 遇到的问题和解决方案

### 2.1 问题一：模块解析失败错误

**错误信息**：
```
Error: Module parse failed: Unexpected token (60:9) You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See `https://webpack.js.org/concepts#loaders` | * They should probably be removed eventually. | */ > export * as ElementType from "domelementtype"; | import { getFeed } from "domutils"; | export { getFeed } from "domutils";
```

**原因**：
webpack 配置文件中的 babel-loader 只包含了 src 目录和一些特定的 node_modules 包，但没有包含所有使用了 ES6 模块语法的依赖项。

**解决方案**：
修改 `webpack.config.js` 文件，将 babel-loader 的配置从 `include`（只包含特定包）改为 `exclude`（排除特定包），这样 babel-loader 就会处理除了 `scratch-blocks`、`scratch-render` 和 `scratch-vm` 之外的所有文件，包括那些使用了 ES6 模块语法的依赖项。

**修改内容**：
```javascript
// 旧配置
include: [
    path.resolve(__dirname, 'src'),
    /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
    /node_modules[\\/]pify/,
    /node_modules[\\/]@vernier[\\/]godirect/
],

// 新配置
exclude: [
    /node_modules[\\/]scratch-blocks/,
    /node_modules[\\/]scratch-render/,
    /node_modules[\\/]scratch-vm/
],
```

### 2.2 问题二：模块找不到错误

**错误信息**：
```
Error: Cannot find module '../generated/microbit-hex-url.cjs'
```

**原因**：
`src/lib/microbit-update.js` 文件导入了 `../generated/microbit-hex-url.cjs` 模块，但这个模块不存在，因为 `scripts/prepublish.mjs` 脚本没有成功执行。

**解决方案**：
修改 `src/lib/microbit-update.js` 文件，使其在模块不存在时能够优雅地处理，这样就不会影响编辑器的正常运行。

**修改内容**：
```javascript
// 旧代码
import {WebUSB, DAPLink} from 'dapjs';
import keyMirror from 'keymirror';

import log from './log.js';

import hexUrl from '../generated/microbit-hex-url.cjs';

// 新代码
import {WebUSB, DAPLink} from 'dapjs';
import keyMirror from 'keymirror';

import log from './log.js';

// Try to import hexUrl, but handle it gracefully if it doesn't exist
let hexUrl;
try {
    hexUrl = require('../generated/microbit-hex-url.cjs');
} catch (error) {
    log.warn('Could not load microbit-hex-url.cjs:', error.message);
    hexUrl = null;
}
```

同时修改 `getHexMap` 函数，在 `hexUrl` 为 null 时返回一个明确的错误信息：

```javascript
const getHexMap = async () => {
    if (!hexUrl) {
        throw new Error('micro:bit hex file URL is not available. Please run the prepublish script.');
    }
    // 原有代码...
};
```

## 3. 注意事项

1. **micro:bit 功能**：由于缺少 `microbit-hex-url.cjs` 模块，micro:bit 相关功能可能无法使用。如果需要使用这些功能，需要运行 `npm run prepublish` 命令来下载和生成必要的文件。

2. **依赖安装**：使用 `pnpm install --ignore-scripts` 命令安装依赖可以避免运行可能导致问题的脚本。

3. **开发服务器**：开发服务器启动后，会在 http://localhost:8601/ 上运行，可以通过浏览器访问 TurboWarp 编辑器。

4. **构建生产版本**：如果需要构建生产版本，可以使用以下命令：
   ```bash
   NODE_ENV=production npm run build
   ```

## 4. 总结

通过以上步骤和解决方案，我们成功部署了 TurboWarp 编辑器，并修复了部署过程中遇到的模块解析失败和模块找不到的问题。现在，TurboWarp 编辑器已经可以正常使用，用户可以通过 http://localhost:8601/ 访问它，开始使用这个增强版的 Scratch 编辑器。