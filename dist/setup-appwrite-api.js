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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });
// 创建 Appwrite API 客户端
const api = axios_1.default.create({
    baseURL: (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace('/v1', ''),
    headers: {
        'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
        'Content-Type': 'application/json',
    },
});
// 从 JSON 文件加载配置
function loadConfig() {
    const configPath = path.join(__dirname, '../config/collections.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    // 使用环境变量中的数据库 ID
    config.database.id = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';
    return config;
}
// 创建 Collection
async function createCollection(databaseId, collection) {
    try {
        console.log(`\n📦 创建 Collection: ${collection.name} (${collection.id})`);
        // 创建 Collection
        const collectionData = {
            collectionId: collection.id,
            name: collection.name,
            permissions: [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")',
            ],
        };
        const response = await api.post(`/v1/databases/${databaseId}/collections`, collectionData);
        console.log(`✅ Collection 创建成功: ${collection.name}`);
        // 创建属性
        console.log('  📝 创建属性...');
        for (const attribute of collection.attributes) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            await createAttribute(databaseId, collection.id, attribute);
        }
        // 创建索引
        if (collection.indexes && collection.indexes.length > 0) {
            console.log('  📊 创建索引...');
            for (const index of collection.indexes) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                await createIndex(databaseId, collection.id, index);
            }
        }
    }
    catch (error) {
        if (error.response?.status === 409 || error.message?.includes('already exists')) {
            console.log(`⏭️ Collection 已存在: ${collection.name}`);
        }
        else {
            console.error(`❌ 创建 Collection 失败: ${collection.name}`, error.response?.data?.message || error.message);
            throw error;
        }
    }
}
// 创建属性
async function createAttribute(databaseId, collectionId, attribute) {
    try {
        const attributeData = {
            key: attribute.key,
            type: attribute.type,
            required: attribute.required,
            array: false,
        };
        if (attribute.size) {
            attributeData.size = attribute.size;
        }
        if (attribute.unique) {
            attributeData.unique = true;
        }
        const endpoint = attribute.type === 'email'
            ? `/v1/databases/${databaseId}/collections/${collectionId}/attributes/email`
            : `/v1/databases/${databaseId}/collections/${collectionId}/attributes/${attribute.type}`;
        await api.post(endpoint, attributeData);
        console.log(`✅ 创建属性: ${attribute.key} (${attribute.type})`);
    }
    catch (error) {
        if (error.response?.status === 409) {
            console.log(`⏭️ 属性已存在: ${attribute.key}`);
        }
        else {
            console.error(`❌ 创建属性失败: ${attribute.key}`, error.response?.data?.message || error.message);
        }
    }
}
// 创建索引
async function createIndex(databaseId, collectionId, index) {
    try {
        const indexData = {
            key: `idx_${index.key}_${index.type}`,
            type: index.type === 'unique' ? 'unique' : 'key',
            attributes: [index.key],
        };
        await api.post(`/v1/databases/${databaseId}/collections/${collectionId}/indexes`, indexData);
        console.log(`✅ 创建索引: ${index.key} (${index.type})`);
    }
    catch (error) {
        if (error.response?.status === 409) {
            console.log(`⏭️ 索引已存在: ${index.key}`);
        }
        else {
            console.error(`❌ 创建索引失败: ${index.key}`, error.response?.data?.message || error.message);
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
        // 创建 Collections
        for (const collection of config.collections) {
            await createCollection(config.database.id, collection);
            // 等待以避免速率限制
            await new Promise((resolve) => setTimeout(resolve, 800));
        }
        console.log('\n✨ 初始化完成！');
        console.log('\n📊 创建的 Collections:');
        config.collections.forEach((col) => {
            console.log(`   ✓ ${col.name} (${col.id})`);
        });
        console.log('\n💡 下一步:');
        console.log('   1. 检查 Appwrite 控制台确认所有 Collections 已创建');
        console.log('   2. 配置权限规则（如需要）');
        console.log('   3. 初始化初始数据（运行: npm run seed:appwrite）');
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
