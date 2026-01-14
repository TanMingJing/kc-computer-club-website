/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 添加点名验证码相关属性到 clubSettings collection
 * 
 * 运行方式:
 * npx ts-node --project tsconfig.scripts.json scripts/add-attendance-code-attrs.ts
 */

const nodeAppwrite = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const API_KEY = process.env.APPWRITE_API_KEY || '';
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccompt_db';

async function addAttendanceCodeAttributes() {
  console.log('=== 添加点名验证码属性 ===\n');

  const client = new nodeAppwrite.Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  const databases = new nodeAppwrite.Databases(client);
  const SETTINGS_COLLECTION_ID = 'clubSettings';

  try {
    // 添加 attendanceCode 属性
    console.log('添加 attendanceCode 属性...');
    try {
      await databases.createStringAttribute(
        DB_ID,
        SETTINGS_COLLECTION_ID,
        'attendanceCode',
        10,  // size
        false // required
      );
      console.log('✅ attendanceCode 属性添加成功');
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 409) {
        console.log('⚠️ attendanceCode 属性已存在');
      } else {
        console.error('❌ 添加 attendanceCode 失败:', err.message);
      }
    }

    // 添加 attendanceCodeEnabled 属性
    console.log('添加 attendanceCodeEnabled 属性...');
    try {
      await databases.createBooleanAttribute(
        DB_ID,
        SETTINGS_COLLECTION_ID,
        'attendanceCodeEnabled',
        false // required
      );
      console.log('✅ attendanceCodeEnabled 属性添加成功');
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 409) {
        console.log('⚠️ attendanceCodeEnabled 属性已存在');
      } else {
        console.error('❌ 添加 attendanceCodeEnabled 失败:', err.message);
      }
    }

    console.log('\n=== 完成 ===');
    console.log('请等待几秒钟让 Appwrite 处理属性创建');
    console.log('然后重新测试验证码功能');

  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

addAttendanceCodeAttributes();
