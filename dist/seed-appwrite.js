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
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });
const client = new appwrite_1.Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
if (process.env.APPWRITE_API_KEY) {
    client.setDevKey(process.env.APPWRITE_API_KEY);
}
const databases = new appwrite_1.Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';
// 哈希密码
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
// 初始化数据
const initialData = {
    club_info: {
        clubName: '学校电脑社',
        mission: '推动学校信息技术教育，培养学生计算机应用和创新能力',
        vision: '成为学校最活跃的技术社团，传播编程文化和创新精神',
        categories: '编程, Web开发, AI人工智能, 网络安全, 竞赛',
        description: '我们是一个充满热情的技术社团，致力于分享知识、交流经验、共同成长。',
        contactEmail: 'kccompt@school.edu',
        contactPhone: '0571-12345678',
        logo: '',
        bannerImage: '',
        updatedAt: new Date().toISOString(),
    },
    admin: {
        username: 'admin',
        passwordHash: hashPassword('admin@123'),
        userId: (0, uuid_1.v4)(),
        permissions: '管理公告, 管理活动, 管理用户, 管理评论',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
};
async function seedDatabase() {
    try {
        console.log('🌱 开始初始化数据库...\n');
        // 1. 初始化 club_info
        console.log('📍 初始化 club_info...');
        try {
            const clubInfoResult = await databases.createDocument(DB_ID, 'club_info', appwrite_1.ID.unique(), initialData.club_info);
            console.log('✅ club_info 初始化成功');
        }
        catch (error) {
            console.error('❌ club_info 初始化失败:', error.message);
        }
        // 等待
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 2. 初始化管理员账户
        console.log('👤 初始化管理员账户...');
        try {
            const adminResult = await databases.createDocument(DB_ID, 'admins', appwrite_1.ID.unique(), initialData.admin);
            console.log('✅ 管理员账户初始化成功');
            console.log(`   用户名: admin`);
            console.log(`   初始密码: admin@123`);
            console.log(`   ⚠️ 首次登录后请修改密码！`);
        }
        catch (error) {
            console.error('❌ 管理员账户初始化失败:', error.message);
        }
        console.log('\n✨ 数据库初始化完成！');
        console.log('\n📊 已初始化的数据:');
        console.log('   ✓ Club Info (社团信息)');
        console.log('   ✓ Admin Account (管理员账户)');
        console.log('\n💡 下一步:');
        console.log('   1. 使用初始管理员账户登录');
        console.log('   2. 修改管理员密码');
        console.log('   3. 创建活动、发布公告等');
    }
    catch (error) {
        console.error('\n❌ 初始化失败:', error);
        process.exit(1);
    }
}
seedDatabase().catch((error) => {
    console.error('未捕获的错误:', error);
    process.exit(1);
});
