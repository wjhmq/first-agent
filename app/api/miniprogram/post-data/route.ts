import { NextRequest, NextResponse } from 'next/server';

// POST 接口 - 提交订单或表单数据
export async function POST(req: NextRequest) {
  try {
    // 从请求体中获取数据
    const body = await req.json();
    const { id, ...otherData } = body;

    if (!id) {
      return NextResponse.json(
        {
          code: 400,
          message: 'id 参数是必需的',
          data: null,
        },
        { status: 400 }
      );
    }

    // 根据 id 返回不同的 mock 响应数据
    const mockResponse = getMockResponseById(id, otherData);

    return NextResponse.json(
      {
        code: 200,
        message: '提交成功',
        data: mockResponse,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST API Error:', error);
    return NextResponse.json(
      {
        code: 500,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 定义响应数据类型
interface ResponseData {
  [key: string]: unknown;
  userId: string;
  createTime: string;
  message: string;
  submittedData: Record<string, unknown>;
}

// Mock 响应数据生成函数
function getMockResponseById(id: string, otherData: Record<string, unknown>): ResponseData {
  // 根据不同的 id 返回不同的处理结果
  const mockResponses: Record<string, ResponseData> = {
    '1': {
      orderId: `ORD${Date.now()}`,
      userId: id,
      type: '商品订单',
      status: 'processing',
      amount: 199.99,
      items: [
        {
          productId: 'P001',
          name: '智能手表',
          quantity: 1,
          price: 199.99,
        },
      ],
      paymentMethod: '微信支付',
      createTime: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trackingNumber: null,
      message: '订单已创建，等待支付',
      submittedData: otherData,
    },
    '2': {
      orderId: `ORD${Date.now()}`,
      userId: id,
      type: '服务订单',
      status: 'confirmed',
      amount: 299.00,
      items: [
        {
          serviceId: 'S001',
          name: '上门维修服务',
          quantity: 1,
          price: 299.00,
        },
      ],
      paymentMethod: '支付宝',
      createTime: new Date().toISOString(),
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      technician: {
        name: '王师傅',
        phone: '138****5678',
        rating: 4.9,
      },
      message: '服务已确认，技师将按约定时间上门',
      submittedData: otherData,
    },
    '3': {
      formId: `FORM${Date.now()}`,
      userId: id,
      type: '反馈表单',
      status: 'submitted',
      category: '功能建议',
      priority: 'medium',
      content: otherData.content || '用户反馈内容',
      attachments: otherData.attachments || [],
      createTime: new Date().toISOString(),
      responseTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      assignee: {
        name: '客服小李',
        department: '客服部',
      },
      message: '您的反馈已收到，我们将在24小时内回复',
      submittedData: otherData,
    },
  };

  // 如果找到对应的 id，返回数据，否则返回默认数据
  if (mockResponses[id]) {
    return mockResponses[id];
  }

  // 动态生成响应数据（用于未定义的 id）
  return {
    requestId: `REQ${Date.now()}`,
    userId: id,
    type: '通用请求',
    status: 'received',
    createTime: new Date().toISOString(),
    message: '请求已接收并处理',
    submittedData: otherData,
    result: {
      success: true,
      processedBy: 'system',
      description: `用户 ${id} 的请求已成功处理`,
    },
  };
}
