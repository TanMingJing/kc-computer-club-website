#!/usr/bin/env node
/* eslint-disable prettier/prettier */

/**
 * 创建 attendance (点名) Collection 并设置权限
 * 
 * 使用方法：
 *   npx ts-node scripts/create-attendance-collection.ts
 * 
 * 或在 npm 脚本中：
 *   npm run setup:attendance
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import axios from 'axios';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'kccompt';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccompt_db';

// 验证环境变量
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error('❌ 缺少必要的环境变量：');
  console.error('  • NEXT_PUBLIC_APPWRITE_ENDPOINT');
  console.error('  • NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  console.error('  • APPWRITE_API_KEY');
  process.exit(1);
}

// 创建 axios 实例
const api = axios.create({
  baseURL: APPWRITE_ENDPOINT,
  headers: {
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY,
  },
});

async function createAttendanceCollection() {
  try {
    console.log('🚀 开始创建 attendance collection...\n');

    const collectionId = 'attendance';
    const collectionName = '点名记录';

    // 定义权限列表 - 使用正确的 Appwrite 权限格式
    // 仅在创建后通过单独的 API 调用设置
    const permissions: string[] = [];

    // 步骤1：创建 Collection
    console.log(`📦 创建 Collection: ${collectionName} (ID: ${collectionId})...`);
    
    try {
      const createResponse = await api.post(`/databases/${DATABASE_ID}/collections`, {
        collectionId: collectionId,
        name: collectionName,
      });

      console.log(`✅ Collection 创建成功\n`);
    } catch (error: unknown) {
      const err = error as Error & { message?: string; response?: { data?: { message?: string } } };
      if (err.response?.data?.message?.includes('already exists')) {
        console.log(`⏭️ Collection 已存在\n`);
      } else {
        throw error;
      }
    }

    // 步骤1.5：设置权限
    console.log('🔐 设置权限...');
    try {
      await api.put(`/databases/${DATABASE_ID}/collections/${collectionId}/permissions`, {
        permissions: ['any:read', 'users:create', 'users:read', 'role:admin:read', 'role:admin:update', 'role:admin:delete'],
      });
      console.log(`  ✓ 权限设置成功\n`);
    } catch (error: unknown) {
      const err = error as Error & { message?: string; response?: { data?: { message?: string } } };
      console.warn(`  ⚠ 权限设置可能失败: ${err.message}`);
      console.warn(`  请手动在 Appwrite 控制台中设置权限\n`);
    }

    // 步骤2：添加属性
    const attributes = [
      { key: 'studentId', type: 'string', size: 256, required: true },
      { key: 'studentName', type: 'string', size: 256, required: true },
      { key: 'studentEmail', type: 'email', required: true },
      { key: 'checkInTime', type: 'datetime', required: true },
      { key: 'sessionTime', type: 'string', size: 256, required: true },
      { key: 'weekNumber', type: 'integer', required: true },
      { key: 'status', type: 'string', size: 256, required: true },
      { key: 'notes', type: 'string', size: 512, required: false },
      { key: 'createdAt', type: 'datetime', required: true },
    ];

    console.log('📝 添加属性...');
    for (const attr of attributes) {
      try {
        // 延迟以避免速率限制
        await new Promise((resolve) => setTimeout(resolve, 200));

        const attrPath = `/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attr.type}`;
        
        const attrData: Record<string, unknown> = {
          key: attr.key,
          required: attr.required || false,
        };

        if (attr.type === 'string' || attr.type === 'email') {
          attrData.size = attr.size || 255;
        }

        const response = await api.post(attrPath, attrData);
        console.log(`  ✓ 已添加属性: ${attr.key}`);
      } catch (error: unknown) {
        const err = error as Error & { response?: { data?: { message?: string } } };
        if (err.response?.data?.message?.includes('already exists')) {
          console.log(`  ℹ 属性已存在: ${attr.key}`);
        } else {
          console.warn(`  ⚠ 添加属性失败: ${attr.key}`);
        }
      }
    }

    // 步骤3：添加索引
    const indexes = [
      { key: 'studentId', attributes: ['studentId'], type: 'key' },
      { key: 'weekNumber', attributes: ['weekNumber'], type: 'key' },
      { key: 'checkInTime', attributes: ['checkInTime'], type: 'key' },
      { key: 'sessionTime', attributes: ['sessionTime'], type: 'key' },
    ];

    console.log('\n📊 添加索引...');
    for (const index of indexes) {
      try {
        // 延迟以避免速率限制
        await new Promise((resolve) => setTimeout(resolve, 200));

        const response = await api.post(
          `/databases/${DATABASE_ID}/collections/${collectionId}/indexes`,
          {
            key: index.key,
            type: index.type,
            attributes: index.attributes,
          }
        );
        console.log(`  ✓ 已添加索引: ${index.key}`);
      } catch (error: unknown) {
        const err = error as Error & { response?: { data?: { message?: string } } };
        if (err.response?.data?.message?.includes('already exists')) {
          console.log(`  ℹ 索引已存在: ${index.key}`);
        } else {
          console.warn(`  ⚠ 添加索引失败: ${index.key}`);
        }
      }
    }

    console.log('\n✅ Attendance collection 创建成功！');
    console.log('\n📋 权限配置：');
    console.log('  • 已登录学生（Role: users）：可以创建和读取点名记录');
    console.log('  • 任何人（Role: any）：可以读取点名记录');
    console.log('\n💡 如果学生仍然遇到权限问题，请手动在 Appwrite 控制台中进行如下设置：');
    console.log('  1. 打开 Appwrite 控制台');
    console.log('  2. 进入 Database → ${DATABASE_ID} → Collections → attendance');
    console.log('  3. 点击 Settings → Permissions');
    console.log('  4. 添加权限：');
    console.log('     • Role: "Any" → Create ✓, Read ✓');
    console.log('     • Role: "Users" → Create ✓, Read ✓');
    console.log('     • Role: "Team: admin" → Create ✓, Read ✓, Update ✓, Delete ✓');

  } catch (error: unknown) {
    const err = error as Error & { message?: string; response?: { data?: unknown } };
    console.error('\n❌ 创建失败:', err.message);
    if (err.response?.data) {
      console.error('详细错误:', err.response.data);
    }
    process.exit(1);
  }
}

// 运行脚本
createAttendanceCollection().catch((error) => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
