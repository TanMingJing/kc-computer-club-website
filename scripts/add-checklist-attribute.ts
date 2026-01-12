/* eslint-disable prettier/prettier */
import { Client, Databases } from 'node-appwrite';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION || 'projects';

// 初始化 Appwrite 客户端
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function addChecklistAttribute(): Promise<void> {
  console.log('🚀 开始添加 checklist 属性...\n');

  try {
    // 尝试创建 checklist 属性
    console.log('📝 添加 checklist 属性...');
    const result = await (databases as any).createStringAttribute(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      'checklist',
      8192, // 足够大的字符串来存储 JSON
      false // 可选
    );
    console.log('✅ checklist 属性添加成功');

  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('⏭️ checklist 属性已存在，跳过创建');
    } else {
      console.error('❌ 添加属性失败:', err.message);
      throw err;
    }
  }
}

addChecklistAttribute()
  .then(() => {
    console.log('\n🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 脚本执行失败:', err);
    process.exit(1);
  });
