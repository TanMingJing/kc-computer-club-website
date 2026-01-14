/* eslint-disable prettier/prettier */
/**
 * 添加学生相关属性到 users collection
 * 运行: npx ts-node --project tsconfig.scripts.json scripts/add-student-attributes.ts
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION || '';

// 需要添加的学生属性
const studentAttributes = [
  { key: 'studentId', type: 'string', size: 64, required: false },
  { key: 'chineseName', type: 'string', size: 256, required: false },
  { key: 'englishName', type: 'string', size: 256, required: false },
  { key: 'classNameCn', type: 'string', size: 256, required: false },
  { key: 'classNameEn', type: 'string', size: 256, required: false },
  { key: 'classCode', type: 'string', size: 64, required: false },
  { key: 'groupLevel', type: 'string', size: 128, required: false },
  { key: 'level', type: 'string', size: 128, required: false },
  { key: 'phone', type: 'string', size: 32, required: false },
  { key: 'instagram', type: 'string', size: 128, required: false },
  { key: 'group', type: 'string', size: 128, required: false },
  { key: 'position', type: 'string', size: 128, required: false },
  { key: 'notes', type: 'string', size: 1024, required: false },
  { key: 'passwordHash', type: 'string', size: 512, required: false },
  { key: 'requirePasswordChange', type: 'boolean', required: false },
  { key: 'emailVerified', type: 'boolean', required: false },
  { key: 'lastLogin', type: 'datetime', required: false },
];

async function addAttributes() {
  console.log('🚀 开始添加学生属性到 users collection...');
  console.log(`📦 数据库: ${DATABASE_ID}`);
  console.log(`📋 Collection: ${USERS_COLLECTION_ID}`);
  console.log('');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const attr of studentAttributes) {
    try {
      console.log(`➡️  添加属性: ${attr.key} (${attr.type})`);

      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          attr.key,
          attr.size || 256,
          attr.required || false
        );
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          attr.key,
          attr.required || false
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          attr.key,
          attr.required || false
        );
      }

      console.log(`   ✅ 成功添加: ${attr.key}`);
      successCount++;

      // 等待一下，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: unknown) {
      const err = error as Error & { code?: number; message?: string };
      if (err.code === 409 || err.message?.includes('already exists')) {
        console.log(`   ⏭️  已存在，跳过: ${attr.key}`);
        skipCount++;
      } else {
        console.error(`   ❌ 失败: ${attr.key} - ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log('');
  console.log('========================================');
  console.log(`✅ 成功添加: ${successCount} 个属性`);
  console.log(`⏭️  已存在跳过: ${skipCount} 个属性`);
  console.log(`❌ 失败: ${errorCount} 个属性`);
  console.log('========================================');

  if (successCount > 0) {
    console.log('');
    console.log('⚠️  注意：新属性需要几秒钟才能在 Appwrite 中生效。');
    console.log('⚠️  请等待 10-30 秒后再尝试导入学生。');
  }
}

addAttributes()
  .then(() => {
    console.log('');
    console.log('🎉 脚本执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
