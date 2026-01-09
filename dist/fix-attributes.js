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
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';
// 需要修复的属性列表
const missingAttributes = [
    { collectionId: 'users', key: 'role', type: 'string', size: 50, required: true },
    { collectionId: 'users', key: 'avatar', type: 'string', size: 2048, required: false },
    { collectionId: 'admins', key: 'userId', type: 'string', size: 255, required: true },
    { collectionId: 'notices', key: 'authorId', type: 'string', size: 255, required: true },
    { collectionId: 'notices', key: 'status', type: 'string', size: 50, required: true },
    { collectionId: 'notices', key: 'coverImage', type: 'string', size: 2048, required: false },
    { collectionId: 'activities', key: 'category', type: 'string', size: 100, required: true },
    { collectionId: 'activities', key: 'organizerId', type: 'string', size: 255, required: true },
    { collectionId: 'activities', key: 'status', type: 'string', size: 50, required: true },
    { collectionId: 'activities', key: 'coverImage', type: 'string', size: 2048, required: false },
    { collectionId: 'signups', key: 'activityId', type: 'string', size: 255, required: true },
    { collectionId: 'signups', key: 'status', type: 'string', size: 50, required: true },
    { collectionId: 'comments', key: 'contentType', type: 'string', size: 50, required: true },
    { collectionId: 'comments', key: 'contentId', type: 'string', size: 255, required: true },
    { collectionId: 'comments', key: 'status', type: 'string', size: 50, required: true },
    { collectionId: 'ai_chats', key: 'sessionId', type: 'string', size: 255, required: true },
    { collectionId: 'ai_chats', key: 'userType', type: 'string', size: 50, required: true },
    { collectionId: 'club_info', key: 'logo', type: 'string', size: 2048, required: false },
    { collectionId: 'club_info', key: 'bannerImage', type: 'string', size: 2048, required: false },
];
// 创建属性
async function createAttribute(collectionId, attribute) {
    try {
        const attributeData = {
            key: attribute.key,
            type: attribute.type,
            required: attribute.required,
            array: false,
            size: attribute.size,
        };
        await api.post(`/v1/databases/${DB_ID}/collections/${collectionId}/attributes/string`, attributeData);
        console.log(`✅ 创建属性: ${collectionId}.${attribute.key}`);
    }
    catch (error) {
        if (error.response?.status === 409) {
            console.log(`⏭️ 属性已存在: ${collectionId}.${attribute.key}`);
        }
        else {
            console.error(`❌ 创建属性失败: ${collectionId}.${attribute.key}`, error.response?.data?.message || error.message);
        }
    }
}
// 主函数
async function main() {
    try {
        console.log('🔧 修复遗漏的属性...\n');
        // 验证环境变量
        if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
            throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT 未配置');
        }
        if (!process.env.APPWRITE_API_KEY) {
            throw new Error('APPWRITE_API_KEY 未配置');
        }
        console.log('✅ 环境变量验证通过\n');
        // 创建属性
        for (const attr of missingAttributes) {
            await createAttribute(attr.collectionId, attr);
            await new Promise((resolve) => setTimeout(resolve, 300));
        }
        console.log('\n✨ 属性修复完成！');
        console.log(`\n📊 修复了 ${missingAttributes.length} 个属性`);
        console.log('\n💡 下一步:');
        console.log('   1. 在 Appwrite 控制台验证所有属性');
        console.log('   2. 运行: npm run seed:appwrite （初始化数据）');
        console.log('   3. 开始开发前端应用');
    }
    catch (error) {
        console.error('\n❌ 修复失败:', error);
        process.exit(1);
    }
}
// 运行
main().catch((error) => {
    console.error('未捕获的错误:', error);
    process.exit(1);
});
