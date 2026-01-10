/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import * as path from 'path';
import axios from 'axios';

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// 创建 Appwrite API 客户端
const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace('/v1', ''),
  headers: {
    'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
    'Content-Type': 'application/json',
  },
});

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'kccomputer';
const COLLECTION_ID = 'comments';

// 添加字段
async function addField(key: string, type: string, size?: number): Promise<void> {
  try {
    const attributeData: any = {
      key,
      type,
      required: false,
      array: false,
    };

    if (size) {
      attributeData.size = size;
    }

    await api.post(
      `/v1/databases/${DB_ID}/collections/${COLLECTION_ID}/attributes/${type}`,
      attributeData
    );
    console.log(`✅ ${key} 字段添加成功！`);
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log(`⏭️ ${key} 字段已存在`);
    } else {
      console.error(
        `❌ 添加 ${key} 字段失败:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

// 主函数
async function main() {
  try {
    // 验证环境变量
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT 未配置');
    }

    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('APPWRITE_API_KEY 未配置');
    }

    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID 未配置');
    }

    console.log('✅ 环境变量验证通过\n');
    console.log('🔧 向 comments 表添加回复相关字段...\n');

    // 添加字段
    await addField('reply', 'string', 2048);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    await addField('replyAuthor', 'string', 256);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    await addField('replyAt', 'datetime');

    console.log('\n✨ 所有字段已添加！');
    console.log('现在可以支持老师回复评论了。');
  } catch (error) {
    console.error('\n❌ 添加字段失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
