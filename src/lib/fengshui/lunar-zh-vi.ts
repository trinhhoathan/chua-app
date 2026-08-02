/**
 * Việt hóa chuỗi tiếng Trung từ lunar-typescript (6tail).
 * Không có sẵn locale `vi` — map thủ công + EXTRA_VI; tuyệt đối không trả về chữ Hán.
 */

import { CHAR_SV, EXTRA_VI } from './lunar-zh-vi-extra';

const HAN_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;

const GAN: Record<string, string> = {
  甲: 'Giáp',
  乙: 'Ất',
  丙: 'Bính',
  丁: 'Đinh',
  戊: 'Mậu',
  己: 'Kỷ',
  庚: 'Canh',
  辛: 'Tân',
  壬: 'Nhâm',
  癸: 'Quý',
};

const ZHI: Record<string, string> = {
  子: 'Tý',
  丑: 'Sửu',
  寅: 'Dần',
  卯: 'Mão',
  辰: 'Thìn',
  巳: 'Tỵ',
  午: 'Ngọ',
  未: 'Mùi',
  申: 'Thân',
  酉: 'Dậu',
  戌: 'Tuất',
  亥: 'Hợi',
};

const ANIMALS: Record<string, string> = {
  鼠: 'Chuột',
  牛: 'Trâu',
  虎: 'Hổ',
  兔: 'Mèo',
  龙: 'Rồng',
  蛇: 'Rắn',
  马: 'Ngựa',
  羊: 'Dê',
  猴: 'Khỉ',
  鸡: 'Gà',
  狗: 'Chó',
  猪: 'Heo',
};

const DIRECTIONS: Record<string, string> = {
  东: 'Đông',
  南: 'Nam',
  西: 'Tây',
  北: 'Bắc',
  东南: 'Đông Nam',
  东北: 'Đông Bắc',
  西南: 'Tây Nam',
  西北: 'Tây Bắc',
  正东: 'Chính Đông',
  正南: 'Chính Nam',
  正西: 'Chính Tây',
  正北: 'Chính Bắc',
};

const JIE_QI: Record<string, string> = {
  立春: 'Lập Xuân',
  雨水: 'Vũ Thủy',
  惊蛰: 'Kinh Trập',
  春分: 'Xuân Phân',
  清明: 'Thanh Minh',
  谷雨: 'Cốc Vũ',
  立夏: 'Lập Hạ',
  小满: 'Tiểu Mãn',
  芒种: 'Mang Chủng',
  夏至: 'Hạ Chí',
  小暑: 'Tiểu Thử',
  大暑: 'Đại Thử',
  立秋: 'Lập Thu',
  处暑: 'Xử Thử',
  白露: 'Bạch Lộ',
  秋分: 'Thu Phân',
  寒露: 'Hàn Lộ',
  霜降: 'Sương Giáng',
  立冬: 'Lập Đông',
  小雪: 'Tiểu Tuyết',
  大雪: 'Đại Tuyết',
  冬至: 'Đông Chí',
  小寒: 'Tiểu Hàn',
  大寒: 'Đại Hàn',
};

const ZHI_XING: Record<string, string> = {
  建: 'Kiến',
  除: 'Trừ',
  满: 'Mãn',
  平: 'Bình',
  定: 'Định',
  执: 'Chấp',
  破: 'Phá',
  危: 'Nguy',
  成: 'Thành',
  收: 'Thu',
  开: 'Khai',
  闭: 'Bế',
};

const TIAN_SHEN: Record<string, string> = {
  青龙: 'Thanh Long',
  明堂: 'Minh Đường',
  天刑: 'Thiên Hình',
  朱雀: 'Chu Tước',
  金匮: 'Kim Quỹ',
  天德: 'Thiên Đức',
  白虎: 'Bạch Hổ',
  玉堂: 'Ngọc Đường',
  天牢: 'Thiên Lao',
  玄武: 'Huyền Vũ',
  元武: 'Huyền Vũ',
  司命: 'Tư Mệnh',
  勾陈: 'Câu Trần',
};

const LUCK: Record<string, string> = {
  吉: 'Tốt',
  凶: 'Xấu',
  黄道: 'Hoàng đạo',
  黑道: 'Hắc đạo',
};

/** Việc nên / kiêng trong ngày */
const ACTIVITIES: Record<string, string> = {
  纳采: 'Nạp thái',
  订盟: 'Đính ước',
  嫁娶: 'Cưới hỏi',
  移徙: 'Di chuyển nhà',
  入宅: 'Nhập trạch',
  出行: 'Xuất hành',
  祭祀: 'Tế tự',
  祈福: 'Cầu phúc',
  斋醮: 'Trai giáo',
  塑绘: 'Tạc tượng / vẽ',
  开光: 'Khai quang',
  安香: 'An hương',
  出火: 'Xuất hỏa',
  会亲友: 'Họp mặt thân hữu',
  解除: 'Giải trừ',
  入学: 'Nhập học',
  竖柱: 'Dựng cột',
  上梁: 'Thượng lương',
  拆卸: 'Tháo dỡ',
  盖屋: 'Lợp nhà',
  起基: 'Khởi nền',
  栽种: 'Trồng cây',
  牧养: 'Chăn nuôi',
  纳畜: 'Nhận vật nuôi',
  安葬: 'An táng',
  破土: 'Phá thổ',
  开市: 'Khai trương',
  开仓: 'Mở kho',
  出货财: 'Xuất hàng / tiền',
  启钻: 'Khởi khoan',
  动土: 'Động thổ',
  修造: 'Tu tạo',
  安床: 'An giường',
  安门: 'An cửa',
  作灶: 'Làm bếp',
  掘井: 'Đào giếng',
  开渠: 'Mở mương',
  开池: 'Đào ao',
  伐木: 'Đốn gỗ',
  架马: 'Giá ngựa (khung)',
  作梁: 'Làm xà',
  修坟: 'Sửa mộ',
  立碑: 'Dựng bia',
  成服: 'Thành phục',
  除服: 'Trừ phục',
  移柩: 'Di quan',
  入殓: 'Nhập liệm',
  开生坟: 'Mở huyệt sống',
  合寿木: 'Làm quan tài',
  冠笄: 'Quan kê',
  纳婿: 'Nạp rể',
  问名: 'Vấn danh',
  归宁: 'Quy ninh',
  交易: 'Giao dịch',
  立券: 'Lập khế',
  纳财: 'Nạp tài',
  开厕: 'Làm nhà vệ sinh',
  补垣: 'Sửa tường',
  塞穴: 'Lấp hang',
  断蚁: 'Diệt kiến',
  猎: 'Săn bắn',
  畋猎: 'Săn bắn',
  取渔: 'Đánh cá',
  结网: 'Đan lưới',
  割蜜: 'Lấy mật',
  教牛马: 'Dạy trâu ngựa',
  习艺: 'Học nghề',
  求医: 'Cầu y',
  治病: 'Chữa bệnh',
  针灸: 'Châm cứu',
  理发: 'Cắt tóc',
  整手足甲: 'Sửa móng',
  沐浴: 'Tắm gội',
  扫舍: 'Quét nhà',
  修饰垣墙: 'Trang trí tường',
  平治道涂: 'Sửa đường',
  坏垣: 'Phá tường',
  破屋: 'Phá nhà',
  造仓: 'Làm kho',
  造庙: 'Làm miếu',
  造桥: 'Làm cầu',
  造船: 'Làm thuyền',
  造车器: 'Làm xe / khí cụ',
  造畜稠: 'Làm chuồng',
  筑堤: 'Đắp đê',
  安机械: 'Lắp máy',
  安碓磑: 'Lắp cối xay',
  定磉: 'Định tảng',
  开柱眼: 'Mở lỗ cột',
  合脊: 'Hợp nóc',
  合帐: 'May màn',
  裁衣: 'May áo',
  经络: 'Kinh lạc',
  雕刻: 'Điêu khắc',
  挂匾: 'Treo biển',
  雇佣: 'Thuê người',
  进人口: 'Thêm nhân khẩu',
  置产: 'Mua tài sản',
  求嗣: 'Cầu tự',
  捕捉: 'Bắt thú',
  放水: 'Xả nước',
  谢土: 'Tạ thổ',
  赴任: 'Nhậm chức',
  分居: 'Ly cư',
  探病: 'Thăm bệnh',
  行丧: 'Làm tang',
  词讼: 'Kiện tụng',
  乘船: 'Đi thuyền',
  归岫: 'Quy tụ',
  普渡: 'Phổ độ',
  诸事不宜: 'Mọi việc đều kiêng',
  馀事勿取: 'Việc khác không nên',
  无: 'Không',
};

const JI_SHEN: Record<string, string> = {
  天德: 'Thiên Đức',
  月德: 'Nguyệt Đức',
  天德合: 'Thiên Đức Hợp',
  月德合: 'Nguyệt Đức Hợp',
  天恩: 'Thiên Ân',
  月恩: 'Nguyệt Ân',
  天赦: 'Thiên Xá',
  天愿: 'Thiên Nguyện',
  天马: 'Thiên Mã',
  驿马: 'Dịch Mã',
  天喜: 'Thiên Hỷ',
  天医: 'Thiên Y',
  天后: 'Thiên Hậu',
  天巫: 'Thiên Vu',
  天仓: 'Thiên Thương',
  天符: 'Thiên Phù',
  时德: 'Thời Đức',
  普护: 'Phổ Hộ',
  三合: 'Tam Hợp',
  六合: 'Lục Hợp',
  五合: 'Ngũ Hợp',
  五富: 'Ngũ Phú',
  六仪: 'Lục Nghi',
  四相: 'Tứ Tướng',
  圣心: 'Thánh Tâm',
  守日: 'Thủ Nhật',
  官日: 'Quan Nhật',
  民日: 'Dân Nhật',
  王日: 'Vương Nhật',
  相日: 'Tướng Nhật',
  临日: 'Lâm Nhật',
  吉期: 'Cát Kỳ',
  不将: 'Bất Tướng',
  生气: 'Sinh Khí',
  益后: 'Ích Hậu',
  续世: 'Tục Thế',
  母仓: 'Mẫu Thương',
  月空: 'Nguyệt Không',
  宝光: 'Bảo Quang',
  敬安: 'Kính An',
  要安: 'Yếu An',
  玉堂: 'Ngọc Đường',
  玉宇: 'Ngọc Vũ',
  金匮: 'Kim Quỹ',
  金堂: 'Kim Đường',
  明堂: 'Minh Đường',
  青龙: 'Thanh Long',
  司命: 'Tư Mệnh',
  福德: 'Phúc Đức',
  福生: 'Phúc Sinh',
  阳德: 'Dương Đức',
  阴德: 'Âm Đức',
  时阳: 'Thời Dương',
  时阴: 'Thời Âm',
  解神: 'Giải Thần',
  除神: 'Trừ Thần',
  鸣吠: 'Minh Phệ',
  鸣吠对: 'Minh Phệ Đối',
  无: 'Không',
};

const XIONG_SHA: Record<string, string> = {
  天罡: 'Thiên Cương',
  五虚: 'Ngũ Hư',
  八风: 'Bát Phong',
  白虎: 'Bạch Hổ',
  天刑: 'Thiên Hình',
  天吏: 'Thiên Lại',
  天火: 'Thiên Hỏa',
  天牢: 'Thiên Lao',
  天狗: 'Thiên Cẩu',
  天贼: 'Thiên Tặc',
  月建: 'Nguyệt Kiến',
  月破: 'Nguyệt Phá',
  月刑: 'Nguyệt Hình',
  月害: 'Nguyệt Hại',
  月厌: 'Nguyệt Yếm',
  月煞: 'Nguyệt Sát',
  月虚: 'Nguyệt Hư',
  大煞: 'Đại Sát',
  大耗: 'Đại Hao',
  大败: 'Đại Bại',
  大时: 'Đại Thời',
  小时: 'Tiểu Thời',
  小耗: 'Tiểu Hao',
  劫煞: 'Kiếp Sát',
  灾煞: 'Tai Sát',
  岁薄: 'Tuế Bạc',
  往亡: 'Vãng Vong',
  归忌: 'Quy Kỵ',
  血忌: 'Huyết Kỵ',
  血支: 'Huyết Chi',
  死气: 'Tử Khí',
  死神: 'Tử Thần',
  致死: 'Trí Tử',
  重日: 'Trùng Nhật',
  复日: 'Phục Nhật',
  四废: 'Tứ Phế',
  四忌: 'Tứ Kỵ',
  四穷: 'Tứ Cùng',
  四耗: 'Tứ Hao',
  四击: 'Tứ Kích',
  五墓: 'Ngũ Mộ',
  五离: 'Ngũ Ly',
  九空: 'Cửu Không',
  九坎: 'Cửu Khảm',
  九焦: 'Cửu Tiêu',
  九虎: 'Cửu Hổ',
  七符: 'Thất Phù',
  七鸟: 'Thất Điểu',
  八专: 'Bát Chuyên',
  八龙: 'Bát Long',
  六蛇: 'Lục Xà',
  三阴: 'Tam Âm',
  土府: 'Thổ Phủ',
  土符: 'Thổ Phù',
  地囊: 'Địa Nang',
  地火: 'Địa Hỏa',
  河魁: 'Hà Khôi',
  勾陈: 'Câu Trần',
  朱雀: 'Chu Tước',
  元武: 'Huyền Vũ',
  孤辰: 'Cô Thần',
  咸池: 'Hàm Trì',
  厌对: 'Yếm Đối',
  招摇: 'Chiêu Dao',
  游祸: 'Du Họa',
  大会: 'Đại Hội',
  小会: 'Tiểu Hội',
  触水龙: 'Xúc Thủy Long',
  逐阵: 'Trục Trận',
  行狠: 'Hành Hận',
  阳错: 'Dương Thác',
  阴错: 'Âm Thác',
  阴位: 'Âm Vị',
  绝阳: 'Tuyệt Dương',
  纯阴: 'Thuần Âm',
  阴阳俱错: 'Âm Dương câu thác',
  阴阳击冲: 'Âm Dương kích xung',
  阴道冲阳: 'Âm đạo xung dương',
  'sn.guiKu': 'Quỷ Khốc',
  'sn.sanSang': 'Tam Tang',
};

const NA_YIN: Record<string, string> = {
  海中金: 'Hải Trung Kim',
  炉中火: 'Lô Trung Hỏa',
  大林木: 'Đại Lâm Mộc',
  路旁土: 'Lộ Bàng Thổ',
  剑锋金: 'Kiếm Phong Kim',
  山头火: 'Sơn Đầu Hỏa',
  涧下水: 'Giản Hạ Thủy',
  城头土: 'Thành Đầu Thổ',
  白蜡金: 'Bạch Lạp Kim',
  杨柳木: 'Dương Liễu Mộc',
  泉中水: 'Tuyền Trung Thủy',
  屋上土: 'Ốc Thượng Thổ',
  霹雳火: 'Tích Lịch Hỏa',
  松柏木: 'Tùng Bách Mộc',
  长流水: 'Trường Lưu Thủy',
  沙中金: 'Sa Trung Kim',
  山下火: 'Sơn Hạ Hỏa',
  平地木: 'Bình Địa Mộc',
  壁上土: 'Bích Thượng Thổ',
  金箔金: 'Kim Bạc Kim',
  覆灯火: 'Phúc Đăng Hỏa',
  天河水: 'Thiên Hà Thủy',
  大驿土: 'Đại Dịch Thổ',
  钗钏金: 'Thoa Xuyến Kim',
  桑柘木: 'Tang Chá Mộc',
  大溪水: 'Đại Khê Thủy',
  沙中土: 'Sa Trung Thổ',
  天上火: 'Thiên Thượng Hỏa',
  石榴木: 'Thạch Lựu Mộc',
  大海水: 'Đại Hải Thủy',
};

const BAGUA: Record<string, string> = {
  坎: 'Khảm',
  坤: 'Khôn',
  震: 'Chấn',
  巽: 'Tốn',
  中: 'Trung',
  乾: 'Càn',
  兑: 'Đoài',
  艮: 'Cấn',
  离: 'Ly',
  中宫: 'Trung cung',
};

const XING_ZUO: Record<string, string> = {
  白羊: 'Bạch Dương',
  金牛: 'Kim Ngưu',
  双子: 'Song Tử',
  巨蟹: 'Cự Giải',
  狮子: 'Sư Tử',
  处女: 'Xử Nữ',
  天秤: 'Thiên Bình',
  天蝎: 'Thiên Yết',
  射手: 'Nhân Mã',
  摩羯: 'Ma Kết',
  水瓶: 'Bảo Bình',
  双鱼: 'Song Ngư',
};

const XIU: Record<string, string> = {
  角: 'Giác',
  亢: 'Cang',
  氐: 'Đê',
  房: 'Phòng',
  心: 'Tâm',
  尾: 'Vĩ',
  箕: 'Cơ',
  斗: 'Đẩu',
  牛: 'Ngưu',
  女: 'Nữ',
  虚: 'Hư',
  危: 'Nguy',
  室: 'Thất',
  壁: 'Bích',
  奎: 'Khuê',
  娄: 'Lâu',
  胃: 'Vị',
  昴: 'Mão',
  毕: 'Tất',
  觜: 'Tuy',
  参: 'Sâm',
  井: 'Tỉnh',
  鬼: 'Quỷ',
  柳: 'Liễu',
  星: 'Tinh',
  张: 'Trương',
  翼: 'Dực',
  轸: 'Chẩn',
};

const YUE_XIANG: Record<string, string> = {
  朔: 'Sóc',
  既朔: 'Ký Sóc',
  蛾眉月: 'Nga Mi',
  夕: 'Tịch',
  上弦: 'Thượng huyền',
  宵: 'Tiêu',
  夜半: 'Dạ bán',
  既望: 'Ký Vọng',
  望: 'Vọng',
  下弦: 'Hạ huyền',
  晦: 'Hối',
};

const SHI_SHEN: Record<string, string> = {
  比肩: 'Tỷ Kiên',
  劫财: 'Kiếp Tài',
  食神: 'Thực Thần',
  伤官: 'Thương Quan',
  偏财: 'Thiên Tài',
  正财: 'Chính Tài',
  偏官: 'Thất Sát',
  七杀: 'Thất Sát',
  正官: 'Chính Quan',
  偏印: 'Thiên Ấn',
  枭神: 'Thiên Ấn',
  正印: 'Chính Ấn',
  日主: 'Nhật Chủ',
};

const WU_XING: Record<string, string> = {
  金: 'Kim',
  木: 'Mộc',
  水: 'Thủy',
  火: 'Hỏa',
  土: 'Thổ',
};

const COLORS: Record<string, string> = {
  黑: 'Đen',
  白: 'Trắng',
  赤: 'Đỏ',
  绿: 'Xanh lục',
  黄: 'Vàng',
  紫: 'Tím',
  碧: 'Xanh biếc',
};

const SEASON: Record<string, string> = {
  孟春: 'Mạnh Xuân',
  仲春: 'Trọng Xuân',
  季春: 'Quý Xuân',
  孟夏: 'Mạnh Hạ',
  仲夏: 'Trọng Hạ',
  季夏: 'Quý Hạ',
  孟秋: 'Mạnh Thu',
  仲秋: 'Trọng Thu',
  季秋: 'Quý Thu',
  孟冬: 'Mạnh Đông',
  仲冬: 'Trọng Đông',
  季冬: 'Quý Đông',
};

const LIU_YAO: Record<string, string> = {
  大安: 'Đại An',
  留连: 'Lưu Liên',
  速喜: 'Tốc Hỷ',
  赤口: 'Xích Khẩu',
  小吉: 'Tiểu Cát',
  空亡: 'Không Vong',
  先胜: 'Tiên thắng',
  友引: 'Hữu dẫn',
  先负: 'Tiên bại',
  佛灭: 'Phật diệt',
  大吉: 'Đại Cát',
  友: 'Hữu',
  弟: 'Đệ',
  戚: 'Thích',
  兄: 'Huynh',
};

const PENG_ZU: Record<string, string> = {
  甲不开仓财物耗散: 'Giáp — không mở kho, của cải tiêu tán',
  乙不栽植千株不长: 'Ất — không trồng cây, khó lớn',
  丙不修灶必见灾殃: 'Bính — không sửa bếp, dễ gặp họa',
  丁不剃头头必生疮: 'Đinh — không cạo đầu, dễ sinh ghẻ',
  戊不受田田主不祥: 'Mậu — không nhận ruộng, chủ ruộng không lành',
  己不破券二比并亡: 'Kỷ — không phá khế, hai bên cùng hại',
  庚不经络织机虚张: 'Canh — không kinh lạc, khung cửi hư',
  辛不合酱主人不尝: 'Tân — không làm tương, chủ không nếm',
  壬不泱水更难提防: 'Nhâm — không khơi nước, khó đề phòng',
  癸不词讼理弱敌强: 'Quý — không kiện tụng, lý yếu địch mạnh',
  子不问卜自惹祸殃: 'Tý — không hỏi quẻ, tự chuốc họa',
  丑不冠带主不还乡: 'Sửu — không đội mũ đeo đai, khó về quê',
  寅不祭祀神鬼不尝: 'Dần — không tế tự, thần quỷ chẳng hưởng',
  寅不祭祀神鬼怒伤: 'Dần — không tế tự, thần quỷ giận hại',
  卯不穿井水泉不香: 'Mão — không đào giếng, nước không trong',
  辰不哭泣必主重丧: 'Thìn — không khóc lóc, dễ đại tang',
  巳不远行财物伏藏: 'Tỵ — không đi xa, của cải ẩn giấu',
  午不苫盖屋主更张: 'Ngọ — không lợp nhà, chủ nhà xáo động',
  未不服药毒气入肠: 'Mùi — không uống thuốc, độc vào ruột',
  申不安床鬼祟入房: 'Thân — không an giường, quỷ vào phòng',
  酉不会客醉坐颠狂: 'Dậu — không hội khách, say sưa loạn',
  酉不宴客醉坐颠狂: 'Dậu — không đãi khách, say sưa loạn',
  戌不吃犬作怪上床: 'Tuất — không ăn thịt chó, quái lên giường',
  亥不嫁娶不利新郎: 'Hợi — không cưới hỏi, bất lợi chú rể',
};

const EXTRA_ACT: Record<string, string> = {
  酬神: 'Tạ thần',
  求财: 'Cầu tài',
  见贵: 'Gặp quý nhân',
  订婚: 'Đính hôn',
  无: 'Không',
};

const FU_SHU: Record<string, string> = {
  初伏: 'Sơ phục',
  中伏: 'Trung phục',
  末伏: 'Mạt phục',
  数九: 'Số cửu',
};

const XIU_ANIMAL: Record<string, string> = {
  蛟: 'Giao',
  龙: 'Rồng',
  貉: 'Lạc',
  兔: 'Thỏ',
  狐: 'Hồ',
  虎: 'Hổ',
  豹: 'Báo',
  獬: 'Giải',
  牛: 'Trâu',
  蝠: 'Dơi',
  鼠: 'Chuột',
  燕: 'Yến',
  猪: 'Heo',
  貐: 'Du',
  狼: 'Sói',
  狗: 'Chó',
  雉: 'Trĩ',
  鸡: 'Gà',
  乌: 'Ô',
  猴: 'Khỉ',
  猿: 'Vượn',
  犴: 'Ngạn',
  羊: 'Dê',
  獐: 'Chương',
  马: 'Ngựa',
  鹿: 'Hươu',
  蛇: 'Rắn',
  蚓: 'Giun',
};

const DICT: Record<string, string> = {
  ...ACTIVITIES,
  ...EXTRA_ACT,
  ...JI_SHEN,
  ...XIONG_SHA,
  ...JIE_QI,
  ...ZHI_XING,
  ...TIAN_SHEN,
  ...LUCK,
  ...DIRECTIONS,
  ...ANIMALS,
  ...NA_YIN,
  ...GAN,
  ...ZHI,
  ...BAGUA,
  ...XING_ZUO,
  ...XIU,
  ...YUE_XIANG,
  ...SHI_SHEN,
  ...WU_XING,
  ...COLORS,
  ...SEASON,
  ...LIU_YAO,
  ...PENG_ZU,
  ...FU_SHU,
  ...XIU_ANIMAL,
  ...EXTRA_VI,
  一候: 'nhất hậu',
  二候: 'nhị hậu',
  三候: 'tam hậu',
  初候: 'sơ hậu',
  五行会: 'Ngũ hành hội',
  了戾: 'Liễu Lệ',
  单阴: 'Đơn Âm',
  纯阳: 'Thuần Dương',
  阳破阴冲: 'Dương phá âm xung',
  佛灭: 'Phật diệt',
  友引: 'Hữu dẫn',
  大安: 'Đại An',
  赤口: 'Xích Khẩu',
  彘: 'Heo',
  獝: 'Huýt',
};

const ORDERED_PHRASES = Object.entries(DICT).sort(
  (a, b) => b[0].length - a[0].length,
);

function normalizeViSpacing(input: string): string {
  return input
    .replace(/\s+/g, ' ')
    .replace(/\s+([)\].,;:!?\-—·/,])/g, '$1')
    .replace(/([(【\[])\s+/g, '$1')
    .replace(/([^\s(（])\(/g, '$1 (')
    .replace(/([^\s\[【])\[/g, '$1 [')
    .replace(/\)(?=[^\s)\].,;:!?\-—·/])/g, ') ')
    .replace(/\](?=[^\s)\].,;:!?\-—·/])/g, '] ')
    .replace(/\s+/g, ' ')
    .trim();
}

function purgeHan(input: string): string {
  let out = input;
  for (const [zh, vn] of Object.entries(CHAR_SV)) {
    out = out.split(zh).join(` ${vn} `);
  }
  out = out.replace(HAN_RE, ' ');
  return normalizeViSpacing(out);
}

/** Dịch một thuật ngữ — bảo đảm không còn chữ Hán, có khoảng cách đúng. */
export function viTerm(raw: string): string {
  if (!raw) return '';
  if (DICT[raw]) return normalizeViSpacing(purgeHan(DICT[raw]));

  // Nhật lộc: 寅命互禄 / 寅命互禄 丁,己命进禄
  const dayLu = raw.match(
    /^([子丑寅卯辰巳午未申酉戌亥])命互禄(?:\s*(.+))?$/,
  );
  if (dayLu) {
    const head = `${ZHI[dayLu[1]]} mệnh hỗ lộc`;
    if (!dayLu[2]) return head;
    const rest = dayLu[2]
      .split(/[,\s]+/)
      .filter(Boolean)
      .map((part) => {
        const m = part.match(/^([甲乙丙丁戊己庚辛壬癸])命进禄$/);
        if (m) return `${GAN[m[1]]} mệnh tiến lộc`;
        return viTerm(part);
      })
      .join(', ');
    return normalizeViSpacing(`${head}, ${rest}`);
  }

  // Can Chi ghép: 甲子
  if (/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/.test(raw)) {
    return `${GAN[raw[0]]} ${ZHI[raw[1]]}`;
  }

  // Tuần không: 寅卯
  if (/^[子丑寅卯辰巳午未申酉戌亥]{2}$/.test(raw)) {
    return `${ZHI[raw[0]]} ${ZHI[raw[1]]}`;
  }

  // Ngũ hành cặp: 火火 / 木土
  if (/^[金木水火土]{2}$/.test(raw)) {
    return `${WU_XING[raw[0]]} ${WU_XING[raw[1]]}`;
  }

  // Chuỗi phức: (戊戌)狗
  const chong = raw.match(
    /^\(([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])\)(.+)$/,
  );
  if (chong) {
    const gz = chong[1];
    const animal = ANIMALS[chong[2]] ?? viTerm(chong[2]);
    return `(${GAN[gz[0]]} ${ZHI[gz[1]]}) ${animal}`;
  }

  let out = raw;
  for (const [zh, vn] of ORDERED_PHRASES) {
    if (zh.length >= 1 && out.includes(zh)) {
      out = out.split(zh).join(` ${vn} `);
    }
  }
  return purgeHan(out);
}

/** Dịch một địa chi đơn (子 → Tý) — tránh rơi xuống âm Hán Việt chung (子 → Tử). */
export function viZhi(zhi: string): string {
  return ZHI[zhi] ?? viTerm(zhi);
}

export function viList(items: string[]): string[] {
  return items.map(viTerm).filter(Boolean);
}

export function viGanZhi(gz: string): string {
  if (!gz || gz.length < 2) return gz;
  const can = GAN[gz[0]] ?? gz[0];
  const chi = ZHI[gz[1]] ?? gz[1];
  return `${can} ${chi}`;
}
