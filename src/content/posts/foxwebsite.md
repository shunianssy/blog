---
title: foxwebsite
published: 2026-02-18
description: 我的第一个pytohn库
tags: [github,open,pypi,foxwebsite,python]
category: python
draft: false
---

::github{repo="shunianssy/foxwebsite"}

# 📘 foxwebsite Web 框架官方文档  
> 一个轻量级、异步、Flask 风格的 Python Web 框架 —— 由中学生独立开发并持续维护
> 你可以赞助我：[ifdian.net/a/shunian](https://www.ifdian.net/a/shunian)  
> 项目邮箱：sbox520@163.com  

---

## 1. 安装与快速启动  

### 安装依赖  

```bash
pip install uvicorn
```

（可选）如需使用 Jinja2 模板引擎（虽然是可选，但我还是推荐您使用）：

```bash
pip install jinja2
```

> foxwebsite 自带 `string.Template` 引擎，不装 Jinja2 也能用基础模板功能。

---

### 创建第一个应用  

新建 `app.py`：

```python
from foxwebsite import create_app

app = create_app(secret_key="your-secret-here")

@app.route("/")
def home(request):
    return "<h1>Hello, foxwebsite!</h1>"

@app.route("/user/{name}")
def user_profile(request):
    name = request.params["name"]
    return f"<h2>Welcome, {name}!</h2>"

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
```

运行：

```bash
python app.py
```

访问 http://127.0.0.1:8000 查看效果！

---

## 2. 路由系统  

### 基础路由  

```python
@app.route("/about")
def about(request):
    return "About Page"
```

支持多个 HTTP 方法：

```python
@app.route("/submit", methods=["GET", "POST"])
def submit(request):
    if request.method == "POST":
        return "Submitted!"
    return "<form method='post'><button>Submit</button></form>"
```

快捷装饰器（`@app.get`, `@app.post` 等）：

```python
@app.get("/info")
def get_info(request):
    return "This is GET only"

@app.post("/login")
async def login(request):  # 支持异步函数  
    data = await request.json()  # 异步读取 JSON 数据  
    return {"message": "Login received", "data": data}
```

路径参数支持类型转换（如 `{id:int}`）：

```python
@app.route("/post/{post_id:int}")
def view_post(request):
    post_id = request.params["post_id"]
    return f"<h3>Viewing post #{post_id}</h3>"
```

---

## 3. 请求与响应  

### 请求对象（Request）  

每个处理函数接收一个 `request` 对象，包含以下属性：

- `request.method` — 请求方法（GET、POST 等）  
- `request.path` — 请求路径  
- `request.query` — 查询参数字典（如 `?name=Bob` → `{"name": "Bob"}`）  
- `request.params` — 路径参数（如 `/user/{name}` → `{"name": "Alice"}`）  
- `request.headers` — 请求头字典  
- `request.body` — 原始请求体（bytes）  
- `await request.json()` — 异步解析 JSON 数据  
- `await request.form()` — 异步解析表单数据  

示例：

```python
@app.post("/api/data")
async def handle_data(request):
    json_data = await request.json()
    name = json_data.get("name")
    return {"hello": name}
```

### 响应（Response）  

支持多种返回类型：

- 字符串 → 返回 HTML 文本  
- 字典 → 自动序列化为 JSON，设置 `Content-Type: application/json`  
- `Response` 对象 → 自定义状态码、头、内容类型等  

```python
from foxwebsite import Response

@app.get("/custom")
def custom_response(request):
    return Response(
        body="<h1>Custom!</h1>",
        status=201,
        headers={"X-Frame-Options": "DENY"},
        content_type="text/html"
    )
```

---

## 4. Session 会话  

启用 Session 需在创建应用时传入 `secret_key`：

```python
app = create_app(secret_key="your-super-secret-key-here")
```

在路由中使用 session：

```python
@app.get("/set")
def set_session(request):
    request.session["user"] = "Alice"
    return "Session set!"

@app.get("/get")
def get_session(request):
    user = request.session.get("user", "Guest")
    return f"Hello, {user}"
```

Session 基于签名 Cookie 实现，数据存储在客户端。

---

## 5. 模板渲染  

支持两种模板引擎：

1. 内置：`string.Template`（无需额外依赖）  
2. 可选：Jinja2（功能更强大）  

### 使用内置模板（string.Template）  

```python
@app.get("/hello/{name}")
def hello(request):
    name = request.params["name"]
    return app.render_string("Hello, $name!", name=name)
```

### 使用 Jinja2 模板  

确保已安装 Jinja2，并将模板文件放在 `templates/` 目录下。

```python
@app.get("/profile/{name}")
def profile(request):
    name = request.params["name"]
    return app.render_template("profile.html", name=name, age=16)
```

`templates/profile.html` 示例：

```html
<h1>Hello, {{ name }}!</h1>
<p>You are {{ age }} years old.</p>
```

---

## 6. 静态文件  

自动提供 `static/` 目录下的文件（如 CSS、JS、图片）。

例如：

- 文件路径：`static/style.css`  
- 可通过 URL 访问：`http://localhost:8000/static/style.css`  

可通过 `static_dir` 参数自定义目录：

```python
app = create_app(secret_key="...", static_dir="public")
```

---

## 7. 错误处理  

使用 `@app.errorhandler` 注册错误处理器：

```python
@app.errorhandler(404)
def not_found(request):
    return "<h1>Page Not Found</h1>", 404

@app.errorhandler(500)
def server_error(request):
    return "<h1>Server Error</h1>", 500
```

也可处理自定义异常：

```python
class UnauthorizedError(Exception):
    pass

@app.errorhandler(UnauthorizedError)
def handle_unauthorized(request, exception):
    return "Access denied!", 401
```

---

## 8. 部署运行  

开发期间使用内置 `app.run()`：

```python
app.run(host="127.0.0.1", port=8000)
```

生产环境推荐使用 Uvicorn 托管 ASGI 应用：

```bash
uvicorn app:app
```

支持 Gunicorn + Uvicorn 多进程部署：

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

---

## 9. 常见问题  

**Q: foxwebsite 是同步还是异步框架？**  
A: 完全异步（基于 `async/await`），支持同步和异步混合编写路由。

**Q: 是否兼容 WSGI？**  
A: 不兼容。foxwebsite 是 ASGI 框架，需使用 Uvicorn、Hypercorn 等 ASGI 服务器。

**Q: 能否连接数据库？**  
A: 可以！推荐搭配 `aiomysql`、`asyncpg` 或 `Tortoise ORM` 使用异步数据库。

**Q: 模板必须用 Jinja2 吗？**  
A: 不是必须的。内置 `string.Template` 可满足简单需求，Jinja2 用于复杂逻辑。

**Q: 如何测试？**  
A: 可使用 `requests` 或 `httpx` 发起测试请求，未来将提供测试客户端。

---

> 正在成长中的框架，欢迎提交 Issue 或 PR！  
> GitHub：[https://github.com/shunianssy/foxwebsite](https://github.com/shunianssy/foxwebsite)
> foxwebsite 自带 `string.Template` 引擎，不装 Jinja2 也能用基础模板功能。  
> *(Foxwebsite comes with built-in `string.Template` engine; basic templating works even without Jinja2.)*