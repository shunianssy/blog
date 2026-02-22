---
title: foxHippoRAG向量数据库集成
published: 2026-02-22
description: 该实现支持多种向量数据库后端，可以根据需求灵活切换。
tags: [github,open,python,foxHippoRAG,rag]
category: python
draft: false
---

# 向量数据库集成

## 概述

本文档记录了 HippoRAG-sn 项目中向量数据库集成的完整实现。该实现支持多种向量数据库后端，可以根据需求灵活切换。

## 实现日期

2026-02-22

## 功能特性

支持多种向量数据库后端（Parquet、FAISS、Milvus、Chroma）
统一的抽象接口设计
向后兼容原有 Parquet 实现
线程安全
完整的测试覆盖
灵活的配置选项

## 架构设计

### 模块结构

```
src/foxhipporag/vector_db/
├── __init__.py          # 模块入口，工厂函数
├── base.py             # 抽象基类
├── parquet_db.py       # Parquet 后端（默认）
├── faiss_db.py         # FAISS 后端
├── milvus_db.py        # Milvus 后端
└── chroma_db.py        # Chroma 后端
```

### 抽象基类 (BaseVectorDB)

定义了所有向量数据库后端必须实现的统一接口：

```python
class BaseVectorDB(ABC):
    # 核心操作
    insert()           # 插入向量
    upsert()           # 插入或更新
    delete()           # 删除向量
    
    # 查询操作
    get_vectors()       # 获取向量
    get_metadatas()    # 获取元数据
    search()           # 向量相似度搜索
    batch_search()      # 批量搜索
    
    # 管理操作
    get_all_ids()      # 获取所有ID
    count()            # 获取数量
    clear()            # 清空数据
    save()             # 保存到磁盘
    load()             # 从磁盘加载
```

## 支持的后端

### 1. Parquet (默认)

**特点：**
- 基于文件存储，无需额外依赖
- 使用 Parquet 格式，高效的列式存储
- 支持类级别缓存
- 线程安全
- 向后兼容原有实现

**适用场景：**
- 开发测试环境
- 小规模数据集（< 10万条）
- 不需要额外部署

**配置选项：**
```python
vector_db_backend = 'parquet'
vector_db_path = './vector_db'  # 可选，默认使用 save_dir/vdb
```

### 2. FAISS

**特点：**
- Facebook AI Similarity Search
- 高效的向量索引和检索
- 支持 CPU 和 GPU
- 支持多种索引类型（Flat、IVF、IVFPQ、HNSW）
- 本地文件持久化

**适用场景：**
- 大规模向量检索（> 10万条）
- 需要高性能检索
- 本地部署

**配置选项：**
```python
vector_db_backend = 'faiss'
faiss_index_type = 'Flat'      # Flat, IVF, IVFFlat, IVFPQ, HNSW
faiss_nlist = 100               # IVF 索引的聚类数
faiss_nprobe = 10               # 搜索时探测的聚类数
faiss_use_gpu = False            # 是否使用 GPU
```

**安装依赖：**
```bash
# CPU 版本
pip install faiss-cpu

# GPU 版本
pip install faiss-gpu
```

### 3. Milvus

**特点：**
- 开源分布式向量数据库
- 支持大规模部署（亿级向量）
- 高可用和可扩展
- 支持元数据过滤
- 支持多种索引类型

**适用场景：**
- 生产环境
- 超大规模数据集（> 100万条）
- 需要高可用性
- 分布式部署

**配置选项：**
```python
vector_db_backend = 'milvus'
milvus_host = 'localhost'
milvus_port = 19530
milvus_user = ''                # 认证用户名
milvus_password = ''            # 认证密码
milvus_db_name = 'default'
milvus_collection_name = None     # 默认使用 foxhipporag_{namespace}
milvus_index_type = 'IVF_FLAT'  # FLAT, IVF_FLAT, IVF_PQ, HNSW, ANNOY
milvus_metric_type = 'COSINE'      # L2, IP, COSINE
milvus_nlist = 1024
milvus_nprobe = 16
```

**安装依赖：**
```bash
pip install pymilvus>=2.3.0
```

**部署 Milvus：**
```bash
# 使用 Docker
docker run -d --name milvus-standalone \
  -p 19530:19530 \
  -p 9091:9091 \
  milvusdb/milvus:latest

# 或使用 Milvus Cloud
# 访问 https://zilliz.com/cloud
```

### 4. Chroma

**特点：**
- 轻量级嵌入式向量数据库
- 无需额外服务
- 支持持久化和内存模式
- 简单易用
- 支持元数据过滤

**适用场景：**
- 中小规模应用（< 50万条）
- 快速原型开发
- 不需要额外基础设施

**配置选项：**
```python
vector_db_backend = 'chroma'
chroma_persistent = True            # 是否持久化
chroma_distance_metric = 'cosine'    # cosine, l2, ip
```

**安装依赖：**
```bash
pip install chromadb>=0.4.0
```

## 使用方法

### 基本用法

```python
from foxhipporag.utils.config_utils import BaseConfig
from foxhipporag.foxHippoRAG import foxHippoRAG

# 1. 配置向量数据库后端
config = BaseConfig(
    vector_db_backend='faiss',  # 或 'parquet', 'milvus', 'chroma'
    faiss_index_type='Flat'
)

# 2. 初始化 foxHippoRAG
rag = foxHippoRAG(global_config=config)

# 3. 使用（自动使用配置的向量数据库）
rag.index(docs)
results = rag.rag_qa(queries)
```

### 环境变量配置

可以通过环境变量设置向量数据库配置：

```bash
# Milvus
export MILVUS_HOST=localhost
export MILVUS_PORT=19530
export MILVUS_USER=user
export MILVUS_PASSWORD=pass

# Chroma
export CHROMA_PERSISTENT=true
export CHROMA_DISTANCE_METRIC=cosine
```

## 性能对比

| 后端 | 数据规模 | 检索速度 | 内存占用 | 部署复杂度 |
|------|----------|----------|----------|------------|
| Parquet | < 10万 | 慢 | 低 | 最简单 |
| FAISS | 10万 - 1000万 | 快 | 中 | 简单 |
| Milvus | > 100万 | 很快 | 高 | 中等 |
| Chroma | < 50万 | 中等 | 低 | 简单 |

## 迁移指南

### 从 Parquet 迁移到其他后端

```python
# 1. 备份现有数据
import shutil
shutil.copytree('./outputs/vdb', './vdb_backup')

# 2. 修改配置
config = BaseConfig(
    vector_db_backend='faiss',
    vector_db_path='./vdb_faiss'
)

# 3. 重新索引（会自动使用新后端）
rag = foxHippoRAG(global_config=config)
rag.index(docs)  # 数据会保存到新后端
```

### 后端之间数据迁移

```python
from foxhipporag.vector_db import get_vector_db

# 源数据库
source_db = get_vector_db(
    backend='parquet',
    embedding_dim=1024,
    namespace='chunk',
    db_path='./outputs/vdb'
)

# 目标数据库
target_db = get_vector_db(
    backend='faiss',
    embedding_dim=1024,
    namespace='chunk',
    db_path='./vdb_faiss'
)

# 迁移数据
all_ids = source_db.get_all_ids()
vectors = source_db.get_vectors(all_ids)
metadatas = source_db.get_metadatas(all_ids)

target_db.insert(
    ids=list(all_ids),
    vectors=list(vectors.values()),
    metadatas=list(metadatas.values())
)
```

## 测试

### 运行测试

```bash
# 运行所有测试
python tests/test_vector_db.py

# 运行特定后端测试
python tests/test_vector_db.py TestParquetVectorDB
python tests/test_vector_db.py TestFAISSVectorDB
python tests/test_vector_db.py TestChromaVectorDB
```

### 测试覆盖

插入操作
更新插入（upsert）
向量获取
元数据获取
相似度搜索
批量搜索
删除操作
持久化
清空操作
工厂函数

## 最佳实践

### 1. 选择合适的后端

| 场景 | 推荐后端 |
|------|----------|
| 开发测试 | Parquet |
| 小规模生产（< 10万） | FAISS |
| 中等规模（10万 - 100万） | FAISS 或 Chroma |
| 大规模（> 100万） | Milvus |
| 需要高可用 | Milvus |
| 快速原型 | Chroma |

### 2. 性能优化

**FAISS 优化：**
```python
# 对于大规模数据，使用 IVF 索引
config = BaseConfig(
    vector_db_backend='faiss',
    faiss_index_type='IVFFlat',
    faiss_nlist=1000,      # 根据数据量调整
    faiss_nprobe=100        # 增加搜索精度
)
```

**Milvus 优化：**
```python
# 使用 GPU 加速
config = BaseConfig(
    vector_db_backend='milvus',
    milvus_index_type='IVF_PQ',  # 压缩索引
    milvus_nlist=4096,
    milvus_nprobe=64
)
```

### 3. 内存管理

```python
# 定期清理缓存
rag.chunk_embedding_store.clear_cache()
rag.entity_embedding_store.clear_cache()
rag.fact_embedding_store.clear_cache()
```

## 故障排除

### 问题：导入错误

```
ModuleNotFoundError: No module named 'faiss'
```

**解决方案：**
```bash
pip install faiss-cpu
# 或
pip install faiss-gpu
```

### 问题：Milvus 连接失败

```
ConnectionError: Failed to connect to Milvus
```

**解决方案：**
1. 检查 Milvus 服务是否运行
2. 检查防火墙设置
3. 验证 host 和 port 配置

### 问题：性能不佳

**可能原因：**
1. 索引类型不合适
2. nlist/nprobe 参数设置不当
3. 数据量超出后端能力

**解决方案：**
- 调整索引参数
- 升级到更强大的后端
- 使用 GPU 加速

## 未来改进

- [ ] 添加更多向量数据库支持（Pinecone、Weaviate、Qdrant）
- [ ] 实现自动索引优化
- [ ] 添加性能监控和指标
- [ ] 支持分布式部署
- [ ] 添加数据压缩功能

## 参考资料

- [FAISS 文档](https://github.com/facebookresearch/faiss)
- [Milvus 文档](https://milvus.io/docs)
- [Chroma 文档](https://docs.trychroma.com)
- [向量数据库对比](https://zilliz.com/learn/what-is-vector-database)

## 贡献

欢迎提交 Issue 和 Pull Request 来改进向量数据库集成功能。

## 许可证

遵循 foxHippoRAG 项目的 AGPLv3 许可证。
