/* eslint-disable prettier/prettier */
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECTS_COLLECTION_ID = 'projects';

// 初始化 Appwrite 客户端
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function addAdminFeedback(): Promise<void> {
  console.log('🚀 添加 adminFeedback 属性...\n');

  try {
    await databases.createStringAttribute(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      'adminFeedback',
      2048,
      false
    );
    console.log('✅ adminFeedback 属性添加成功！');
  } catch (err: unknown) {
    const error = err as Error & { message?: string };
    if (error.message?.includes('already exists')) {
      console.log('⏭️ adminFeedback 属性已存在');
    } else {
      console.error('❌ 添加失败:', error.message);
    }
  }
}

addAdminFeedback()
  .then(() => {
    console.log('\n🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 脚本执行失败:', err);
    process.exit(1);
  });
