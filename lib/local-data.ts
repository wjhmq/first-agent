// 本地存储数据源 - 无需数据库即可使用

export interface Question {
  id: number;
  given_line: string;
  direction: '上句' | '下句';
  correct_option: 'A' | 'B' | 'C' | 'D';
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation: string;
  difficulty: number;
  source_poem: string;
  source_author: string;
}

export interface User {
  id: number;
  openid: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  max_streak: number;
  hearts: number;
}

export interface Answer {
  id: number;
  user_id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  answer_time: number;
  created_at: string;
}

// 50道经典古诗词题目
export const localQuestions: Question[] = [
  // 《静夜思》李白
  { id: 1, given_line: '床前明月光', direction: '下句', correct_option: 'B', option_a: '低头思故乡', option_b: '疑是地上霜', option_c: '举头望明月', option_d: '春风不度玉门关', explanation: '《静夜思》唐·李白：床前明月光，疑是地上霜。举头望明月，低头思故乡。', difficulty: 1, source_poem: '静夜思', source_author: '李白' },
  { id: 2, given_line: '疑是地上霜', direction: '上句', correct_option: 'A', option_a: '床前明月光', option_b: '举头望明月', option_c: '低头思故乡', option_d: '明月几时有', explanation: '《静夜思》唐·李白：床前明月光，疑是地上霜。举头望明月，低头思故乡。', difficulty: 1, source_poem: '静夜思', source_author: '李白' },
  { id: 3, given_line: '举头望明月', direction: '下句', correct_option: 'D', option_a: '疑是地上霜', option_b: '床前明月光', option_c: '春风不度玉门关', option_d: '低头思故乡', explanation: '《静夜思》唐·李白：床前明月光，疑是地上霜。举头望明月，低头思故乡。', difficulty: 1, source_poem: '静夜思', source_author: '李白' },

  // 《春晓》孟浩然
  { id: 4, given_line: '春眠不觉晓', direction: '下句', correct_option: 'A', option_a: '处处闻啼鸟', option_b: '夜来风雨声', option_c: '花落知多少', option_d: '月落乌啼霜满天', explanation: '《春晓》唐·孟浩然：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', difficulty: 1, source_poem: '春晓', source_author: '孟浩然' },
  { id: 5, given_line: '处处闻啼鸟', direction: '上句', correct_option: 'B', option_a: '夜来风雨声', option_b: '春眠不觉晓', option_c: '花落知多少', option_d: '天街小雨润如酥', explanation: '《春晓》唐·孟浩然：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', difficulty: 1, source_poem: '春晓', source_author: '孟浩然' },
  { id: 6, given_line: '夜来风雨声', direction: '下句', correct_option: 'C', option_a: '春眠不觉晓', option_b: '处处闻啼鸟', option_c: '花落知多少', option_d: '黄河入海流', explanation: '《春晓》唐·孟浩然：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', difficulty: 2, source_poem: '春晓', source_author: '孟浩然' },

  // 《登鹳雀楼》王之涣
  { id: 7, given_line: '白日依山尽', direction: '下句', correct_option: 'B', option_a: '欲穷千里目', option_b: '黄河入海流', option_c: '更上一层楼', option_d: '春风不度玉门关', explanation: '《登鹳雀楼》唐·王之涣：白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', difficulty: 1, source_poem: '登鹳雀楼', source_author: '王之涣' },
  { id: 8, given_line: '黄河入海流', direction: '上句', correct_option: 'A', option_a: '白日依山尽', option_b: '欲穷千里目', option_c: '更上一层楼', option_d: '大漠孤烟直', explanation: '《登鹳雀楼》唐·王之涣：白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', difficulty: 1, source_poem: '登鹳雀楼', source_author: '王之涣' },
  { id: 9, given_line: '欲穷千里目', direction: '下句', correct_option: 'D', option_a: '黄河入海流', option_b: '白日依山尽', option_c: '春风不度玉门关', option_d: '更上一层楼', explanation: '《登鹳雀楼》唐·王之涣：白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', difficulty: 2, source_poem: '登鹳雀楼', source_author: '王之涣' },

  // 《凉州词》王之涣
  { id: 10, given_line: '黄河远上白云间', direction: '下句', correct_option: 'C', option_a: '春风不度玉门关', option_b: '万里长征人未还', option_c: '一片孤城万仞山', option_d: '羌笛何须怨杨柳', explanation: '《凉州词》唐·王之涣：黄河远上白云间，一片孤城万仞山。羌笛何须怨杨柳，春风不度玉门关。', difficulty: 2, source_poem: '凉州词', source_author: '王之涣' },
  { id: 11, given_line: '羌笛何须怨杨柳', direction: '下句', correct_option: 'A', option_a: '春风不度玉门关', option_b: '万里长征人未还', option_c: '一片孤城万仞山', option_d: '黄河入海流', explanation: '《凉州词》唐·王之涣：黄河远上白云间，一片孤城万仞山。羌笛何须怨杨柳，春风不度玉门关。', difficulty: 2, source_poem: '凉州词', source_author: '王之涣' },

  // 《出塞》王昌龄
  { id: 12, given_line: '秦时明月汉时关', direction: '下句', correct_option: 'B', option_a: '但使龙城飞将在', option_b: '万里长征人未还', option_c: '不教胡马度阴山', option_d: '春风不度玉门关', explanation: '《出塞》唐·王昌龄：秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。', difficulty: 2, source_poem: '出塞', source_author: '王昌龄' },
  { id: 13, given_line: '但使龙城飞将在', direction: '下句', correct_option: 'C', option_a: '秦时明月汉时关', option_b: '万里长征人未还', option_c: '不教胡马度阴山', option_d: '春风不度玉门关', explanation: '《出塞》唐·王昌龄：秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。', difficulty: 2, source_poem: '出塞', source_author: '王昌龄' },

  // 《芙蓉楼送辛渐》王昌龄
  { id: 14, given_line: '洛阳亲友如相问', direction: '下句', correct_option: 'D', option_a: '一片孤城万仞山', option_b: '春风不度玉门关', option_c: '万里长征人未还', option_d: '一片冰心在玉壶', explanation: '《芙蓉楼送辛渐》唐·王昌龄：寒雨连江夜入吴，平明送客楚山孤。洛阳亲友如相问，一片冰心在玉壶。', difficulty: 2, source_poem: '芙蓉楼送辛渐', source_author: '王昌龄' },

  // 《黄鹤楼送孟浩然之广陵》李白
  { id: 15, given_line: '故人西辞黄鹤楼', direction: '下句', correct_option: 'A', option_a: '烟花三月下扬州', option_b: '孤帆远影碧空尽', option_c: '唯见长江天际流', option_d: '千里江陵一日还', explanation: '《黄鹤楼送孟浩然之广陵》唐·李白：故人西辞黄鹤楼，烟花三月下扬州。孤帆远影碧空尽，唯见长江天际流。', difficulty: 2, source_poem: '黄鹤楼送孟浩然之广陵', source_author: '李白' },
  { id: 16, given_line: '孤帆远影碧空尽', direction: '下句', correct_option: 'C', option_a: '故人西辞黄鹤楼', option_b: '烟花三月下扬州', option_c: '唯见长江天际流', option_d: '朝辞白帝彩云间', explanation: '《黄鹤楼送孟浩然之广陵》唐·李白：故人西辞黄鹤楼，烟花三月下扬州。孤帆远影碧空尽，唯见长江天际流。', difficulty: 3, source_poem: '黄鹤楼送孟浩然之广陵', source_author: '李白' },

  // 《早发白帝城》李白
  { id: 17, given_line: '朝辞白帝彩云间', direction: '下句', correct_option: 'B', option_a: '两岸猿声啼不住', option_b: '千里江陵一日还', option_c: '轻舟已过万重山', option_d: '烟花三月下扬州', explanation: '《早发白帝城》唐·李白：朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', difficulty: 2, source_poem: '早发白帝城', source_author: '李白' },
  { id: 18, given_line: '两岸猿声啼不住', direction: '下句', correct_option: 'D', option_a: '朝辞白帝彩云间', option_b: '千里江陵一日还', option_c: '烟花三月下扬州', option_d: '轻舟已过万重山', explanation: '《早发白帝城》唐·李白：朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', difficulty: 2, source_poem: '早发白帝城', source_author: '李白' },

  // 《望庐山瀑布》李白
  { id: 19, given_line: '日照香炉生紫烟', direction: '下句', correct_option: 'A', option_a: '遥看瀑布挂前川', option_b: '飞流直下三千尺', option_c: '疑是银河落九天', option_d: '黄河入海流', explanation: '《望庐山瀑布》唐·李白：日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', difficulty: 2, source_poem: '望庐山瀑布', source_author: '李白' },
  { id: 20, given_line: '飞流直下三千尺', direction: '下句', correct_option: 'C', option_a: '遥看瀑布挂前川', option_b: '日照香炉生紫烟', option_c: '疑是银河落九天', option_d: '黄河入海流', explanation: '《望庐山瀑布》唐·李白：日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', difficulty: 1, source_poem: '望庐山瀑布', source_author: '李白' },

  // 《赠汪伦》李白
  { id: 21, given_line: '李白乘舟将欲行', direction: '下句', correct_option: 'B', option_a: '桃花潭水深千尺', option_b: '忽闻岸上踏歌声', option_c: '不及汪伦送我情', option_d: '烟花三月下扬州', explanation: '《赠汪伦》唐·李白：李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', difficulty: 2, source_poem: '赠汪伦', source_author: '李白' },
  { id: 22, given_line: '桃花潭水深千尺', direction: '下句', correct_option: 'D', option_a: '李白乘舟将欲行', option_b: '忽闻岸上踏歌声', option_c: '春风不度玉门关', option_d: '不及汪伦送我情', explanation: '《赠汪伦》唐·李白：李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', difficulty: 2, source_poem: '赠汪伦', source_author: '李白' },

  // 《绝句》杜甫
  { id: 23, given_line: '两个黄鹂鸣翠柳', direction: '下句', correct_option: 'A', option_a: '一行白鹭上青天', option_b: '窗含西岭千秋雪', option_c: '门泊东吴万里船', option_d: '春风不度玉门关', explanation: '《绝句》唐·杜甫：两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', difficulty: 2, source_poem: '绝句', source_author: '杜甫' },
  { id: 24, given_line: '窗含西岭千秋雪', direction: '下句', correct_option: 'C', option_a: '两个黄鹂鸣翠柳', option_b: '一行白鹭上青天', option_c: '门泊东吴万里船', option_d: '孤帆远影碧空尽', explanation: '《绝句》唐·杜甫：两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', difficulty: 3, source_poem: '绝句', source_author: '杜甫' },

  // 《江南逢李龟年》杜甫
  { id: 25, given_line: '岐王宅里寻常见', direction: '下句', correct_option: 'B', option_a: '正是江南好风景', option_b: '崔九堂前几度闻', option_c: '落花时节又逢君', option_d: '春风不度玉门关', explanation: '《江南逢李龟年》唐·杜甫：岐王宅里寻常见，崔九堂前几度闻。正是江南好风景，落花时节又逢君。', difficulty: 3, source_poem: '江南逢李龟年', source_author: '杜甫' },
  { id: 26, given_line: '正是江南好风景', direction: '下句', correct_option: 'C', option_a: '岐王宅里寻常见', option_b: '崔九堂前几度闻', option_c: '落花时节又逢君', option_d: '烟花三月下扬州', explanation: '《江南逢李龟年》唐·杜甫：岐王宅里寻常见，崔九堂前几度闻。正是江南好风景，落花时节又逢君。', difficulty: 3, source_poem: '江南逢李龟年', source_author: '杜甫' },

  // 《枫桥夜泊》张继
  { id: 27, given_line: '月落乌啼霜满天', direction: '下句', correct_option: 'D', option_a: '姑苏城外寒山寺', option_b: '夜半钟声到客船', option_c: '春风不度玉门关', option_d: '江枫渔火对愁眠', explanation: '《枫桥夜泊》唐·张继：月落乌啼霜满天，江枫渔火对愁眠。姑苏城外寒山寺，夜半钟声到客船。', difficulty: 2, source_poem: '枫桥夜泊', source_author: '张继' },
  { id: 28, given_line: '姑苏城外寒山寺', direction: '下句', correct_option: 'B', option_a: '月落乌啼霜满天', option_b: '夜半钟声到客船', option_c: '江枫渔火对愁眠', option_d: '春风不度玉门关', explanation: '《枫桥夜泊》唐·张继：月落乌啼霜满天，江枫渔火对愁眠。姑苏城外寒山寺，夜半钟声到客船。', difficulty: 3, source_poem: '枫桥夜泊', source_author: '张继' },

  // 《游子吟》孟郊
  { id: 29, given_line: '慈母手中线', direction: '下句', correct_option: 'A', option_a: '游子身上衣', option_b: '临行密密缝', option_c: '意恐迟迟归', option_d: '春风不度玉门关', explanation: '《游子吟》唐·孟郊：慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。', difficulty: 1, source_poem: '游子吟', source_author: '孟郊' },
  { id: 30, given_line: '临行密密缝', direction: '下句', correct_option: 'C', option_a: '慈母手中线', option_b: '游子身上衣', option_c: '意恐迟迟归', option_d: '春风不度玉门关', explanation: '《游子吟》唐·孟郊：慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。', difficulty: 2, source_poem: '游子吟', source_author: '孟郊' },
  { id: 31, given_line: '谁言寸草心', direction: '下句', correct_option: 'B', option_a: '慈母手中线', option_b: '报得三春晖', option_c: '游子身上衣', option_d: '春风不度玉门关', explanation: '《游子吟》唐·孟郊：慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。谁言寸草心，报得三春晖。', difficulty: 2, source_poem: '游子吟', source_author: '孟郊' },

  // 《竹里馆》王维
  { id: 32, given_line: '独坐幽篁里', direction: '下句', correct_option: 'D', option_a: '深林人不知', option_b: '明月来相照', option_c: '春风不度玉门关', option_d: '弹琴复长啸', explanation: '《竹里馆》唐·王维：独坐幽篁里，弹琴复长啸。深林人不知，明月来相照。', difficulty: 3, source_poem: '竹里馆', source_author: '王维' },

  // 《鹿柴》王维
  { id: 33, given_line: '空山不见人', direction: '下句', correct_option: 'A', option_a: '但闻人语响', option_b: '返景入深林', option_c: '复照青苔上', option_d: '春风不度玉门关', explanation: '《鹿柴》唐·王维：空山不见人，但闻人语响。返景入深林，复照青苔上。', difficulty: 2, source_poem: '鹿柴', source_author: '王维' },
  { id: 34, given_line: '返景入深林', direction: '下句', correct_option: 'C', option_a: '空山不见人', option_b: '但闻人语响', option_c: '复照青苔上', option_d: '春风不度玉门关', explanation: '《鹿柴》唐·王维：空山不见人，但闻人语响。返景入深林，复照青苔上。', difficulty: 3, source_poem: '鹿柴', source_author: '王维' },

  // 《相思》王维
  { id: 35, given_line: '红豆生南国', direction: '下句', correct_option: 'B', option_a: '愿君多采撷', option_b: '春来发几枝', option_c: '此物最相思', option_d: '春风不度玉门关', explanation: '《相思》唐·王维：红豆生南国，春来发几枝。愿君多采撷，此物最相思。', difficulty: 2, source_poem: '相思', source_author: '王维' },
  { id: 36, given_line: '愿君多采撷', direction: '下句', correct_option: 'C', option_a: '红豆生南国', option_b: '春来发几枝', option_c: '此物最相思', option_d: '春风不度玉门关', explanation: '《相思》唐·王维：红豆生南国，春来发几枝。愿君多采撷，此物最相思。', difficulty: 2, source_poem: '相思', source_author: '王维' },

  // 《九月九日忆山东兄弟》王维
  { id: 37, given_line: '独在异乡为异客', direction: '下句', correct_option: 'D', option_a: '遥知兄弟登高处', option_b: '遍插茱萸少一人', option_c: '春风不度玉门关', option_d: '每逢佳节倍思亲', explanation: '《九月九日忆山东兄弟》唐·王维：独在异乡为异客，每逢佳节倍思亲。遥知兄弟登高处，遍插茱萸少一人。', difficulty: 1, source_poem: '九月九日忆山东兄弟', source_author: '王维' },
  { id: 38, given_line: '遥知兄弟登高处', direction: '下句', correct_option: 'A', option_a: '遍插茱萸少一人', option_b: '独在异乡为异客', option_c: '每逢佳节倍思亲', option_d: '春风不度玉门关', explanation: '《九月九日忆山东兄弟》唐·王维：独在异乡为异客，每逢佳节倍思亲。遥知兄弟登高处，遍插茱萸少一人。', difficulty: 2, source_poem: '九月九日忆山东兄弟', source_author: '王维' },

  // 《送元二使安西》王维
  { id: 39, given_line: '渭城朝雨浥轻尘', direction: '下句', correct_option: 'B', option_a: '劝君更尽一杯酒', option_b: '客舍青青柳色新', option_c: '西出阳关无故人', option_d: '春风不度玉门关', explanation: '《送元二使安西》唐·王维：渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。', difficulty: 3, source_poem: '送元二使安西', source_author: '王维' },
  { id: 40, given_line: '劝君更尽一杯酒', direction: '下句', correct_option: 'C', option_a: '渭城朝雨浥轻尘', option_b: '客舍青青柳色新', option_c: '西出阳关无故人', option_d: '春风不度玉门关', explanation: '《送元二使安西》唐·王维：渭城朝雨浥轻尘，客舍青青柳色新。劝君更尽一杯酒，西出阳关无故人。', difficulty: 2, source_poem: '送元二使安西', source_author: '王维' },

  // 《滁州西涧》韦应物
  { id: 41, given_line: '独怜幽草涧边生', direction: '下句', correct_option: 'D', option_a: '春潮带雨晚来急', option_b: '野渡无人舟自横', option_c: '春风不度玉门关', option_d: '上有黄鹂深树鸣', explanation: '《滁州西涧》唐·韦应物：独怜幽草涧边生，上有黄鹂深树鸣。春潮带雨晚来急，野渡无人舟自横。', difficulty: 3, source_poem: '滁州西涧', source_author: '韦应物' },
  { id: 42, given_line: '春潮带雨晚来急', direction: '下句', correct_option: 'B', option_a: '独怜幽草涧边生', option_b: '野渡无人舟自横', option_c: '上有黄鹂深树鸣', option_d: '春风不度玉门关', explanation: '《滁州西涧》唐·韦应物：独怜幽草涧边生，上有黄鹂深树鸣。春潮带雨晚来急，野渡无人舟自横。', difficulty: 3, source_poem: '滁州西涧', source_author: '韦应物' },

  // 《寻隐者不遇》贾岛
  { id: 43, given_line: '松下问童子', direction: '下句', correct_option: 'A', option_a: '言师采药去', option_b: '只在此山中', option_c: '云深不知处', option_d: '春风不度玉门关', explanation: '《寻隐者不遇》唐·贾岛：松下问童子，言师采药去。只在此山中，云深不知处。', difficulty: 2, source_poem: '寻隐者不遇', source_author: '贾岛' },
  { id: 44, given_line: '只在此山中', direction: '下句', correct_option: 'C', option_a: '松下问童子', option_b: '言师采药去', option_c: '云深不知处', option_d: '春风不度玉门关', explanation: '《寻隐者不遇》唐·贾岛：松下问童子，言师采药去。只在此山中，云深不知处。', difficulty: 2, source_poem: '寻隐者不遇', source_author: '贾岛' },

  // 《悯农》李绅
  { id: 45, given_line: '锄禾日当午', direction: '下句', correct_option: 'B', option_a: '谁知盘中餐', option_b: '汗滴禾下土', option_c: '粒粒皆辛苦', option_d: '春风不度玉门关', explanation: '《悯农》唐·李绅：锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。', difficulty: 1, source_poem: '悯农', source_author: '李绅' },
  { id: 46, given_line: '谁知盘中餐', direction: '下句', correct_option: 'C', option_a: '锄禾日当午', option_b: '汗滴禾下土', option_c: '粒粒皆辛苦', option_d: '春风不度玉门关', explanation: '《悯农》唐·李绅：锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。', difficulty: 1, source_poem: '悯农', source_author: '李绅' },

  // 《山行》杜牧
  { id: 47, given_line: '远上寒山石径斜', direction: '下句', correct_option: 'D', option_a: '停车坐爱枫林晚', option_b: '霜叶红于二月花', option_c: '春风不度玉门关', option_d: '白云生处有人家', explanation: '《山行》唐·杜牧：远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。', difficulty: 2, source_poem: '山行', source_author: '杜牧' },
  { id: 48, given_line: '停车坐爱枫林晚', direction: '下句', correct_option: 'B', option_a: '远上寒山石径斜', option_b: '霜叶红于二月花', option_c: '白云生处有人家', option_d: '春风不度玉门关', explanation: '《山行》唐·杜牧：远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。', difficulty: 2, source_poem: '山行', source_author: '杜牧' },

  // 《清明》杜牧
  { id: 49, given_line: '清明时节雨纷纷', direction: '下句', correct_option: 'A', option_a: '路上行人欲断魂', option_b: '借问酒家何处有', option_c: '牧童遥指杏花村', option_d: '春风不度玉门关', explanation: '《清明》唐·杜牧：清明时节雨纷纷，路上行人欲断魂。借问酒家何处有，牧童遥指杏花村。', difficulty: 1, source_poem: '清明', source_author: '杜牧' },
  { id: 50, given_line: '借问酒家何处有', direction: '下句', correct_option: 'C', option_a: '清明时节雨纷纷', option_b: '路上行人欲断魂', option_c: '牧童遥指杏花村', option_d: '春风不度玉门关', explanation: '《清明》唐·杜牧：清明时节雨纷纷，路上行人欲断魂。借问酒家何处有，牧童遥指杏花村。', difficulty: 2, source_poem: '清明', source_author: '杜牧' },
];

// 默认测试用户
export const defaultUser: User = {
  id: 1,
  openid: 'test_user_001',
  nickname: '诗词小白',
  avatar: 'https://via.placeholder.com/100',
  score: 0,
  streak: 0,
  max_streak: 0,
  hearts: 5,
};
