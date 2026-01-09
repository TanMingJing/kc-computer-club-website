"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const appwrite_1 = require("appwrite");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });
// 初始化 Appwrite 客户端
const client = new appwrite_1.Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
// 需要使用 API Key 作为管理员权限
if (process.env.APPWRITE_API_KEY) {
    client.setDevKey(process.env.APPWRITE_API_KEY);
}
const databases = new appwrite_1.Databases(client);
// 从 JSON 文件加载配置
function loadConfig() {
    const configPath = path.join(__dirname, '../config/collections.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    // 使用环境变量中的数据库 ID
    config.database.id = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';
    return config;
}
// 创建属性
async function createAttribute(databaseId, collectionId, attribute) {
    try {
        let response;
        switch (attribute.type) {
            case 'email':
                response = await databases.createEmailAttribute(databaseId, collectionId, attribute.key, attribute.required);
                break;
            case 'string':
                response = await databases.createStringAttribute(databaseId, collectionId, attribute.key, attribute.size || 255, attribute.required);
                break;
            case 'integer':
                response = await databases.createIntegerAttribute(databaseId, collectionId, attribute.key, attribute.required);
                break;
            case 'float':
                response = await databases.createFloatAttribute(databaseId, collectionId, attribute.key, attribute.required);
                break;
            case 'boolean':
                response = await databases.createBooleanAttribute(databaseId, collectionId, attribute.key, attribute.required);
                break;
            case 'datetime':
                response = await databases.createDatetimeAttribute(databaseId, collectionId, attribute.key, attribute.required);
                break;
            default:
                console.warn(`未知的属性类型: ${attribute.type}`);
                return;
        }
        console.log(`✅ 创建属性: ${attribute.key} (${attribute.type})`);
    }
    catch (error) {
        if (error.message &&
            error.message.includes('already exists')) {
            console.log(`⏭️ 属性已存在: ${attribute.key}`);
        }
        else {
            console.error(`❌ 创建属性失败: ${attribute.key}`, error.message);
        }
    }
}
// 创建索引
async function createIndex(databaseId, collectionId, index) {
    try {
        let response;
        if (index.type === 'unique') {
            response = await databases.createIndex(databaseId, collectionId, `idx_${index.key}_unique`, 'unique', [index.key]);
        }
        else if (index.type === 'key') {
            response = await databases.createIndex(databaseId, collectionId, `idx_${index.key}`, 'key', [index.key]);
        }
        console.log(`✅ 创建索引: ${index.key} (${index.type})`);
    }
    catch (error) {
        if (error.message &&
            error.message.includes('already exists')) {
            console.log(`⏭️ 索引已存在: ${index.key}`);
        }
        else {
            console.error(`❌ 创建索引失败: ${index.key}`, error.message);
        }
    }
}
// 创建 Collection
async function createCollection(databaseId, collection) {
    try {
        console.log(`\n📦 创建 Collection: ${collection.name} (${collection.id})`);
        const response = await databases.createCollection(databaseId, collection.id, collection.name, [
            appwrite_1.Permission.read(appwrite_1.Role.any()),
            appwrite_1.Permission.create(appwrite_1.Role.any()),
            appwrite_1.Permission.update(appwrite_1.Role.any()),
            appwrite_1.Permission.delete(appwrite_1.Role.any()),
        ], true);
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
    }
    catch (error) {
        if (error.message &&
            error.message.includes('already exists')) {
            console.log(`⏭️ Collection 已存在: ${collection.name}`);
        }
        else {
            console.error(`❌ 创建 Collection 失败: ${collection.name}`, error.message);
            throw error;
        }
    }
}
// 创建数据库
async function createDatabase(dbConfig) {
    try {
        console.log(`\n🗄️ 创建数据库: ${dbConfig.name} (${dbConfig.id})`);
        const response = await databases.create(dbConfig.id, dbConfig.name);
        console.log(`✅ 数据库创建成功: ${dbConfig.name}`);
    }
    catch (error) {
        if (error.message &&
            error.message.includes('already exists')) {
            console.log(`⏭️ 数据库已存在: ${dbConfig.name}`);
        }
        else {
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
        // 创建数据库
        await createDatabase(config.database);
        // 等待数据库创建
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
    }
    catch (error) {
        console.error('\n❌ 初始化失败:', error);
        process.exit(1);
    }
}
// 运行
main().catch((error) => {
    console.error('未捕获的错误:', error);
    process.exit(1);
});
