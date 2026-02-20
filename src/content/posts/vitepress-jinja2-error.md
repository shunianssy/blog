---
title: VitePress部署和修复文档
published: 2026-02-20
description: VitePress的部署与部署后出现报错的修复
tags: [github,open,VitePress]
category: 开源
draft: false
---

# VitePress 构建错误：无法读取未定义的属性 'field'

## 问题描述

在使用 VitePress 构建文档网站时，遇到了以下错误：

```
Cannot read properties of undefined (reading 'field')
in generated file flask_4.3.md.js
```

同时，构建过程中出现大量语法高亮警告：

```
The language 'jinja2' is not loaded, falling back to 'txt' for syntax highlighting.
The language 'env' is not loaded, falling back to 'txt' for syntax highlighting.
```

## 问题原因

经过分析，问题的根本原因是：

1. **Vue 模板语法冲突**：VitePress 使用 Vue 模板语法 (`{{ }}`)，而 Flask 文档中包含 Jinja2 模板语法 (`{{ }}` 和 `{% %}`)，VitePress 错误地将 Jinja2 语法解析为 Vue 模板语法。

2. **语法高亮支持缺失**：VitePress 默认使用的语法高亮引擎（Shiki 或 Prism.js）没有内置对 Jinja2 和 env 语言的支持。

## 解决方案

### 步骤 1：隔离问题文件

首先，我们需要确定哪个文件导致了构建错误。通过移动可能有问题的文件并重新构建，可以定位到具体的问题文件。

```bash
# 将可疑文件移动到备份位置
mv docs/flask/4.3.md docs/flask/4.3.md.bak

# 重新构建
npm run docs:build
```

### 步骤 2：修改 VitePress 配置

在 `docs/.vitepress/config.js` 文件中进行以下修改：

1. **使用 Prism.js 作为语法高亮引擎**：Prism.js 对各种语言的支持更好
2. **忽略死链接检查**：避免因移动文件产生的警告

```javascript
// 配置 markdown 选项，避免 Jinja2 模板语法与 Vue 冲突
markdown: {
  // 禁用默认的代码块行高亮，避免解析问题
  lineNumbers: false,
  // 使用 Prism.js 作为语法高亮引擎
  syntaxHighlight: 'prism'
},

// 忽略死链接检查
ignoreDeadLinks: true,
```

### 步骤 3：处理包含 Jinja2 语法的文件

对于需要恢复的包含 Jinja2 语法的文件，可以使用以下方法之一：

#### 方法 1：使用 v-pre 指令

在包含 Jinja2 语法的代码块周围添加 `::: v-pre` 指令，告诉 VitePress 不要解析其中的内容：

```markdown
::: v-pre
```html
<form method="POST">
  {{ form.hidden_tag() }}
  {% for field in form %}
    <div>
      {{ field.label }}
      {{ field }}
    </div>
  {% endfor %}
  <button type="submit">Submit</button>
</form>
```
:::
```

#### 方法 2：使用 plaintext 语言标识

将代码块的语言从 `html` 或 `jinja2` 改为 `plaintext`，这样 VitePress 就不会尝试解析其中的语法：

```markdown
```plaintext
<form method="POST">
  {{ form.hidden_tag() }}
  {% for field in form %}
    <div>
      {{ field.label }}
      {{ field }}
    </div>
  {% endfor %}
  <button type="submit">Submit</button>
</form>
```
```

#### 方法 3：转义 Jinja2 语法

使用反斜杠或 HTML 实体转义 Jinja2 语法：

```markdown
```html
<form method="POST">
  \{{ form.hidden_tag() }}
  \{% for field in form %}\n    <div>
      \{{ field.label }}
      \{{ field }}
    </div>
  \{% endfor %}\n  <button type="submit">Submit</button>
</form>
```
```

## 验证解决方案

修改配置后，重新运行构建命令验证问题是否解决：

```bash
npm run docs:build
```

如果构建成功完成，说明问题已经解决。

## 技术要点

1. **模板语法冲突**：当使用多个模板系统时，需要注意语法冲突问题
2. **语法高亮配置**：不同的语法高亮引擎对语言的支持不同，需要根据实际情况选择
3. **VitePress 指令**：了解并使用 VitePress 提供的指令可以解决很多解析问题
4. **问题定位**：通过隔离文件和逐步排查的方法可以快速定位问题源

## 相关资源

- [VitePress 官方文档](https://vitepress.dev/)
- [Prism.js 语言支持](https://prismjs.com/#supported-languages)
- [Flask 模板文档](https://flask.palletsprojects.com/en/2.0.x/templating/)
