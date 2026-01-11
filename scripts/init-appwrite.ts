/* eslint-disable prettier/prettier */
/**
 * Appwrite 数据库初始化脚本
 * 运行命令: npx ts-node scripts/init-appwrite.ts
 * 或在浏览器中访问: http://localhost:3000/api/init
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client();

// 设置端点和项目
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, or APPWRITE_API_KEY');
}

client.setEndpoint(endpoint);
client.setProject(projectId);
client.setKey(apiKey);

const databases = new Databases(client);

async function initializeDatabase() {
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  if (!databaseId) {
    throw new Error('NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set');
  }

  console.log('初始化Appwrite数据库...');

  try {
    // 创建 clubSettings 集合
    console.log('创建 clubSettings 集合...');
    
    const collectionId = 'clubSettings';
    
    try {
      await (databases as unknown as {
        createCollection: (dbId: string, collId: string, name: string, permissions: unknown[]) => Promise<unknown>;
      }).createCollection(
        databaseId,
        collectionId,
        '社团设置',
        []
      );
      console.log('✓ clubSettings 集合创建成功');
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 409) {
        console.log('✓ clubSettings 集合已存在');
      } else {
        throw error;
      }
    }

    // 创建字符串属性
    const stringAttributes = [
      { key: 'aboutTitle', size: 255 },
      { key: 'aboutDescription', size: 2000 },
      { key: 'aboutEmail', size: 255 },
      { key: 'aboutLocation', size: 255 },
      { key: 'aboutMeetingTime', size: 255 },
      { key: 'githubUrl', size: 255 },
      { key: 'discordUrl', size: 255 },
      { key: 'instagramUrl', size: 255 },
      { key: 'youtubeUrl', size: 255 },
    ];

    const integerAttributes = [
      { key: 'activeMembers' },
      { key: 'yearlyActivities' },
      { key: 'awardProjects' },
      { key: 'partners' },
    ];

    console.log('创建字符串属性...');
    for (const attr of stringAttributes) {
      try {
        const dbTyped = databases as unknown as {
          createStringAttribute: (
            dbId: string,
            collId: string,
            key: string,
            size: number,
            required: boolean
          ) => Promise<unknown>;
        };
        await dbTyped.createStringAttribute(
          databaseId,
          collectionId,
          attr.key,
          attr.size,
          false
        );
        console.log(`  ✓ ${attr.key}`);
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err.code === 409) {
          console.log(`  ✓ ${attr.key} (已存在)`);
        } else {
          console.warn(`  ✗ ${attr.key}: ${err.message || '未知错误'}`);
        }
      }
    }

    console.log('创建整数属性...');
    for (const attr of integerAttributes) {
      try {
        const dbTyped = databases as unknown as {
          createIntegerAttribute: (
            dbId: string,
            collId: string,
            key: string,
            required: boolean
          ) => Promise<unknown>;
        };
        await dbTyped.createIntegerAttribute(
          databaseId,
          collectionId,
          attr.key,
          false
        );
        console.log(`  ✓ ${attr.key}`);
      } catch (error: unknown) {
        const err = error as { code?: number; message?: string };
        if (err.code === 409) {
          console.log(`  ✓ ${attr.key} (已存在)`);
        } else {
          console.warn(`  ✗ ${attr.key}: ${err.message || '未知错误'}`);
        }
      }
    }

    console.log('✓ 数据库初始化完成！');
    return { success: true, message: '数据库初始化完成' };
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error);
    throw error;
  }
}

export default initializeDatabase;
