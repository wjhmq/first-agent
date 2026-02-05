import { NextRequest, NextResponse } from 'next/server';

// GET 接口 - 获取用户信息
export async function GET(req: NextRequest) {
  try {
    // 从 URL 查询参数中获取 id
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

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

    // 根据 id 返回不同的 mock 数据
    const mockData = getMockDataById(id);

    return NextResponse.json(
      {
        code: 200,
        message: '获取成功',
        data: mockData,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET API Error:', error);
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

// Mock 数据生成函数
function getMockDataById(id: string) {
  // 根据不同的 id 返回不同的数据
  const mockDatabase: Record<string, any> = {
    '1': {
      id: '1',
      name: '张三',
      avatar: 'https://picsum.photos/200/200?random=1',
      role: '开发工程师',
      department: '技术部',
      email: 'zhangsan@example.com',
      phone: '138****1234',
      joinDate: '2023-01-15',
      status: 'active',
      level: 'P6',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      projects: [
        { name: '项目A', role: '前端负责人', status: '进行中' },
        { name: '项目B', role: '全栈开发', status: '已完成' },
      ],
    },
    '2': {
      id: '2',
      name: '李四',
      avatar: 'https://picsum.photos/200/200?random=2',
      role: '产品经理',
      department: '产品部',
      email: 'lisi@example.com',
      phone: '139****5678',
      joinDate: '2022-06-20',
      status: 'active',
      level: 'P7',
      skills: ['产品设计', '需求分析', 'Axure', 'Figma'],
      projects: [
        { name: '项目C', role: '产品负责人', status: '进行中' },
        { name: '项目D', role: '产品经理', status: '已完成' },
      ],
    },
    '3': {
      id: '3',
      name: '王五',
      avatar: 'https://picsum.photos/200/200?random=3',
      role: 'UI 设计师',
      department: '设计部',
      email: 'wangwu@example.com',
      phone: '137****9012',
      joinDate: '2023-03-10',
      status: 'active',
      level: 'P5',
      skills: ['UI设计', 'Sketch', 'Figma', '交互设计'],
      projects: [
        { name: '项目E', role: 'UI设计师', status: '进行中' },
        { name: '项目F', role: 'UI设计师', status: '已完成' },
      ],
    },
  };

  // 如果找到对应的 id，返回数据，否则返回默认数据
  if (mockDatabase[id]) {
    return mockDatabase[id];
  }

  // 动态生成数据（用于未定义的 id）
  return {
    id: id,
    name: `用户${id}`,
    avatar: `https://picsum.photos/200/200?random=${id}`,
    role: '员工',
    department: '其他部门',
    email: `user${id}@example.com`,
    phone: '138****0000',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    level: 'P4',
    skills: ['通用技能'],
    projects: [
      { name: '默认项目', role: '成员', status: '进行中' },
    ],
  };
}
