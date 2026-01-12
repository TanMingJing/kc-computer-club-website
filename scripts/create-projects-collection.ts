/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Databases, Permission, Role } from 'node-appwrite';
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

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createProjectsCollection(): Promise<void> {
  console.log('🚀 开始创建 projects Collection...\n');

  try {
    // 1. 创建 Collection
    console.log('📁 创建 Collection...');
    await databases.createCollection(
      APPWRITE_DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      '项目表',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✅ Collection 创建成功\n');

    // 等待一下确保 Collection 创建完成
    await sleep(1000);

    // 2. 创建属性
    console.log('📝 创建属性...');
    
    const attributes = [
      { key: 'teamName', type: 'string', size: 256, required: true },
      { key: 'title', type: 'string', size: 512, required: true },
      { key: 'description', type: 'string', size: 8192, required: true },
      { key: 'category', type: 'string', size: 64, required: true },
      { key: 'objectives', type: 'string', size: 4096, required: false },
      { key: 'timeline', type: 'string', size: 256, required: false },
      { key: 'resources', type: 'string', size: 1024, required: false },
      { key: 'projectLink', type: 'string', size: 512, required: false },
      { key: 'members', type: 'string', size: 16384, required: true },
      { key: 'leaderId', type: 'string', size: 256, required: true },
      { key: 'leaderEmail', type: 'string', size: 256, required: true },
      { key: 'status', type: 'string', size: 64, required: true },
      { key: 'adminFeedback', type: 'string', size: 2048, required: false },
      { key: 'createdAt', type: 'string', size: 64, required: true },
      { key: 'updatedAt', type: 'string', size: 64, required: true },
    ];

    for (const attr of attributes) {
      try {
        await (databases as any).createStringAttribute(
          APPWRITE_DATABASE_ID,
          PROJECTS_COLLECTION_ID,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`  ✅ ${attr.key}`);
        await sleep(500); // 等待属性创建完成
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`  ⏭️ ${attr.key} (已存在)`);
        } else {
          console.error(`  ❌ ${attr.key}: ${err.message}`);
        }
      }
    }

    console.log('\n✅ projects Collection 创建完成！');
    console.log('\n📌 请在 .env.local 中添加:');
    console.log('   NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION=projects');

  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('⏭️ projects Collection 已存在，跳过创建');
    } else {
      console.error('❌ 创建失败:', err.message);
      throw err;
    }
  }
}

createProjectsCollection()
  .then(() => {
    console.log('\n🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 脚本执行失败:', err);
    process.exit(1);
  });
