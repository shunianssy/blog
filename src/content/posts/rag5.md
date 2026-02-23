---
title: foxHippoRAG 研究
published: 2026-02-22
description: 进一步优化性能，适配常用场景
tags: [github,open,python,foxHippoRAG,rag]
category: python
draft: false
---

# foxHippoRAG

### ​我要给丫丫完整的一生———出自电影流浪地球

我在想，ai完整的一生很难，它（她、他）很难有真正的持久化记忆，像550A一样，一会就忘了，所以就有了这次研究​

### foxHippoRAG 是一个强大的记忆框架，用于增强大型语言模型识别和利用新知识中连接的能力——这反映了人类长期记忆的关键功能 

开源地址
::github{repo="shunianssy/foxHippoRAG"}

原仓库地址
::github{repo="OSU-NLP-Group/HippoRAG"}

### 我做了什么？
本仓库旨在优化 HippoRAG 的内存框架，以提高其在复杂任务上的性能，添加了大量异步处理和并行计算，以提高效率，组成独立发行版，命名为 foxHippoRAG 

本项目添加了高速处理选项以适配日常需求，并添加了更多功能以支持更多场景
(原项目在低配置下很慢，100+知识搜索超过5分钟，我添加了高速模式，可压缩到10s内，实现一个日用场景）
（才没有在想AI猫娘的想法） 

### 论文参考与鸣谢
arxiv.2405.14831 
arxiv.2502.14802 
arxiv.2406.13629
arxiv.2510.22733
arxiv.2511.18808
arxiv.2510.11541
arxiv.2512.10422
arxiv.2507.21892

优化思路参见
[blog](i.shunx.top)