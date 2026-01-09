/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, Databases, Permission, Role, ID } from 'appwrite';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface AppwriteAttribute {
  key: string;
  type: string;
  required: boolean;
  unique?: boolean;
  enum?: string[];
  default?: any;
  size?: number;
}

interface AppwriteIndex {
  key: string;
  type: string;
}

interface CollectionConfig {
  id: string;
  name: string;
  description?: string;
  attributes: AppwriteAttribute[];
  indexes?: AppwriteIndex[];
}

interface DatabaseConfig {
  id: string;
  name: string;
}

interface RootConfig {
  database: DatabaseConfig;
  collections: CollectionConfig[];
}

// 初始化 Appwrite 客户端
const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// 需要使用 API Key 作为管理员权限
if (process.env.APPWRITE_API_KEY) {
  (client as any).setDevKey(process.env.APPWRITE_API_KEY);
}

const databases = new Databases(client);

// 从 JSON 文件加载配置
function loadConfig(): RootConfig {
  const configPath = path.join(__dirname, '../config/collections.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configContent);
  // 使用环境变量中的数据库 ID
  config.database.id = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';
  return config;
}

// 创建属性
async function createAttribute(
  databaseId: string,
  collectionId: string,
  attribute: AppwriteAttribute
): Promise<void> {
  try {
    let response: any;

    switch (attribute.type) {
      case 'email':
        response = await (databases as any).createEmailAttribute(
          databaseId,
          collectionId,
          attribute.key,
          attribute.required
        );
        break;

      case 'string':
        response = await (databases as any).createStringAttribute(
          databaseId,
          collectionId,
          attribute.key,
          attribute.size || 255,
          attribute.required
        );
        break;

      case 'integer':
        response = await (databases as any).createIntegerAttribute(
          databaseId,
          collectionId,
          attribute.key,
          attribute.required
        );
        break;

      case 'float':
        response = await (databases as any).createFloatAttribute(
          databaseId,
          collectionId,
          attribute.key,
          attribute.required
        );
        break;

      case 'boolean':
        response = await (databases as any).createBooleanAttribute(
          databaseId,
          collectionId,
          attribute.key,
          attribute.required
        );
        break;

      case 'datetime':
        response = await (databases as any).createDatetimeAttribute(
          databaseId,
          collectionId,
          attribute.key,
          attribute.required
        );
        break;

      default:
        console.warn(`未知的属性类型: ${attribute.type}`);
        return;
    }

    console.log(`✅ 创建属性: ${attribute.key} (${attribute.type})`);
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes('already exists')
    ) {
      console.log(`⏭️ 属性已存在: ${attribute.key}`);
    } else {
      console.error(`❌ 创建属性失败: ${attribute.key}`, error.message);
    }
  }
}

// 创建索引
async function createIndex(
  databaseId: string,
  collectionId: string,
  index: AppwriteIndex
): Promise<void> {
  try {
    let response: any;

    if (index.type === 'unique') {
      response = await (databases as any).createIndex(
        databaseId,
        collectionId,
        `idx_${index.key}_unique`,
        'unique',
        [index.key]
      );
    } else if (index.type === 'key') {
      response = await (databases as any).createIndex(
        databaseId,
        collectionId,
        `idx_${index.key}`,
        'key',
        [index.key]
      );
    }

    console.log(`✅ 创建索引: ${index.key} (${index.type})`);
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes('already exists')
    ) {
      console.log(`⏭️ 索引已存在: ${index.key}`);
    } else {
      console.error(`❌ 创建索引失败: ${index.key}`, error.message);
    }
  }
}

// 创建 Collection
async function createCollection(
  databaseId: string,
  collection: CollectionConfig
): Promise<void> {
  try {
    console.log(`\n📦 创建 Collection: ${collection.name} (${collection.id})`);

    const response = await (databases as any).createCollection(
      databaseId,
      collection.id,
      collection.name,
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
      true
    );

    console.log(`✅ Collection 创建成功: ${collection.name}`);

    // 创建属性
    console.log('  📝 创建属性...');
    for (const attribute of collection.attributes) {
      // 等待一下以避免速率限制
      await new Promise((resolve) => setTimeout(resolve, 200));
      await createAttribute(databaseId, collection.id, attribute);
    }

    // 创建索引
    if (collection.indexes && collection.indexes.length > 0) {
      console.log('  📊 创建索引...');
      for (const index of collection.indexes) {
        // 等待一下以避免速率限制
        await new Promise((resolve) => setTimeout(resolve, 200));
        await createIndex(databaseId, collection.id, index);
      }
    }
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes('already exists')
    ) {
      console.log(`⏭️ Collection 已存在: ${collection.name}`);
    } else {
      console.error(`❌ 创建 Collection 失败: ${collection.name}`, error.message);
      throw error;
    }
  }
}

// 创建数据库
async function createDatabase(dbConfig: DatabaseConfig): Promise<void> {
  try {
    console.log(`\n🗄️ 创建数据库: ${dbConfig.name} (${dbConfig.id})`);

    const response = await (databases as any).create(dbConfig.id, dbConfig.name);

    console.log(`✅ 数据库创建成功: ${dbConfig.name}`);
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes('already exists')
    ) {
      console.log(`⏭️ 数据库已存在: ${dbConfig.name}`);
    } else {
      console.error(`❌ 创建数据库失败: ${dbConfig.name}`, error.message);
      throw error;
    }
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始初始化 Appwrite Collections...\n');

    // 加载配置
    const config = loadConfig();
    console.log(`📋 加载配置完成`);
    console.log(`   数据库: ${config.database.name} (${config.database.id})`);
    console.log(`   Collections: ${config.collections.length} 个\n`);

    // 验证环境变量
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT 未配置');
    }

    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID 未配置');
    }

    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('APPWRITE_API_KEY 未配置（需要管理员 API Key）');
    }

    console.log('✅ 环境变量验证通过\n');

    // 数据库应该在 Appwrite 控制台预先创建
    console.log('✓ 使用现有数据库: ' + config.database.name + ' (' + config.database.id + ')\n');

    // 创建 Collections
    for (const collection of config.collections) {
      await createCollection(config.database.id, collection);
      // 等待以避免速率限制
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('\n✨ 初始化完成！');
    console.log('\n📊 创建的 Collections:');
    config.collections.forEach((col) => {
      console.log(`   ✓ ${col.name} (${col.id})`);
    });

    console.log('\n💡 下一步:');
    console.log('   1. 检查 Appwrite 控制台确认所有 Collections 已创建');
    console.log('   2. 配置权限规则（如需要）');
    console.log('   3. 初始化初始数据（如需要）');
  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  }
}

// 运行
main().catch((error) => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
