# 一次性 Admin 登录凭证设置

## 快速开始

### 步骤 1: 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

---

### 步骤 2: 创建默认管理员账户

在另一个终端窗口执行以下命令：

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"password":"Admin@123456"}'
```

**响应示例：**
```json
{
  "success": true,
  "message": "管理员账户创建成功",
  "credentials": {
    "username": "admin",
    "password": "Admin@123456"
  }
}
```

---

### 步骤 3: 管理员登录

1. 访问: `http://localhost:3000/admin/login`
2. **用户名**: `admin`
3. **密码**: `Admin@123456`
4. 点击"登录"按钮

---

### 步骤 4: 进入管理后台

登录成功后，系统会自动重定向到管理后台首页：
`http://localhost:3000/admin`

---

## 推荐的初始密码

为了安全起见，建议使用强密码。示例：

```
Admin@2025SecurePassword!
MyClub_Admin_Secure123
```

---

## 常见问题

### Q: 如果密码忘记了怎么办？

**A:** 在 Appwrite 控制台中编辑管理员记录的 `passwordHash` 字段。

步骤：
1. 打开 Appwrite 控制台
2. 进入 `admins` Collection
3. 找到 `admin` 记录并编辑
4. 使用 bcrypt 工具生成新密码哈希 (https://bcrypt.online)
5. 更新 `passwordHash` 字段

### Q: 已经创建过 admin 了，怎样再创建第二个？

**A:** 访问 `/admin/manage` 页面，点击"添加管理员"按钮创建新管理员。

### Q: 如何验证 admin 账户是否创建成功？

**A:** 访问以下 API 检查：

```bash
curl http://localhost:3000/api/admin/seed
```

响应：
```json
{
  "adminExists": true,
  "adminCount": 1,
  "admins": [
    {
      "id": "xxx",
      "username": "admin",
      "isActive": true,
      "createdAt": "2025-01-09T...",
      "lastLogin": null
    }
  ]
}
```

---

## 安全建议

✅ 生产环境中使用强密码  
✅ 定期更改管理员密码  
✅ 限制管理员账户数量  
✅ 禁用不再使用的管理员账户  
✅ 监控 `lastLogin` 字段检查异常登录  

---

**初始设置完成后，建议删除或保护本文档中的密码信息。**
