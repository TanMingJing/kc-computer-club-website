/* eslint-disable prettier/prettier */
import { Client, Users } from 'node-appwrite';

export async function POST(request: Request) {
  console.log('=== VERIFY EMAIL API CALLED ===');
  
  try {
    const body = await request.json();
    const { userId, secret } = body;

    console.log('Request body:', { userId, secretLength: secret?.length });

    if (!userId || !secret) {
      console.log('Missing parameters');
      return Response.json(
        { error: '缺少验证参数' },
        { status: 400 }
      );
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    console.log('Config check:', { 
      hasEndpoint: !!endpoint, 
      hasProjectId: !!projectId, 
      hasApiKey: !!apiKey,
      endpoint,
      projectId
    });

    if (!endpoint || !projectId || !apiKey) {
      console.error('Missing Appwrite configuration');
      return Response.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    // 使用 node-appwrite 服务端 SDK（支持 API 密钥）
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const users = new Users(client);

    console.log('Calling users.updateEmailVerification for userId:', userId);

    // 使用 Admin API 将邮箱设置为已验证
    const result = await users.updateEmailVerification(userId, true);

    console.log('Verification result:', JSON.stringify(result, null, 2));
    console.log('Email verified successfully for user:', userId);

    return Response.json(
      { success: true, message: '邮箱验证成功' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error & { message?: string; code?: number; type?: string };
    console.error('=== VERIFICATION ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error type:', err.type);
    console.error('Full error:', err);
    
    return Response.json(
      { error: err.message || '邮箱验证失败，链接可能已过期' },
      { status: 400 }
    );
  }
}
