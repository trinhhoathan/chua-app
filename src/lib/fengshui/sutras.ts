/**
 * Kinh · chú · nghi thức tụng thường dùng tại chùa Việt (Bắc truyền).
 * Bản chữ phổ thông trong nghi lễ — nhà chùa có thể chỉnh theo hệ phái.
 */

export type SutraKind = 'kinh' | 'chu' | 'nghi_thuc';

export interface SutraSection {
  title?: string;
  lines: string[];
}

export interface Sutra {
  id: string;
  title: string;
  shortTitle: string;
  kind: SutraKind;
  occasion: string;
  summary: string;
  sections: SutraSection[];
}

export const SUTRA_KIND_LABELS: Record<SutraKind, string> = {
  kinh: 'Kinh',
  chu: 'Chú',
  nghi_thuc: 'Nghi thức',
};

export const COMMON_SUTRAS: Sutra[] = [
  {
    id: 'bat-nha-tam-kinh',
    title: 'Bát Nhã Ba La Mật Đa Tâm Kinh',
    shortTitle: 'Bát Nhã Tâm Kinh',
    kind: 'kinh',
    occasion: 'Công phu hằng ngày · khai kinh · kết thúc khóa tụng',
    summary:
      'Bản kinh ngắn tóm lược trí tuệ Bát Nhã — «chiếu kiến ngũ uẩn giai không», thường tụng mở đầu hoặc kết thúc thời khóa.',
    sections: [
      {
        lines: [
          'Quán Tự Tại Bồ-tát hành thâm Bát-nhã Ba-la-mật-đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
          'Xá-lợi-tử! Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc. Thọ, tưởng, hành, thức diệc phục như thị.',
          'Xá-lợi-tử! Thị chư pháp không tướng: bất sanh, bất diệt, bất cấu, bất tịnh, bất tăng, bất giảm.',
          'Thị cố không trung vô sắc, vô thọ, tưởng, hành, thức; vô nhãn, nhĩ, tỷ, thiệt, thân, ý; vô sắc, thanh, hương, vị, xúc, pháp; vô nhãn giới nãi chí vô ý thức giới.',
          'Vô vô-minh, diệc vô vô-minh tận; nãi chí vô lão tử, diệc vô lão tử tận. Vô khổ, tập, diệt, đạo. Vô trí, diệc vô đắc.',
          'Dĩ vô sở đắc cố, Bồ-đề-tát-đỏa y Bát-nhã Ba-la-mật-đa cố, tâm vô quái ngại; vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết-bàn.',
          'Tam thế chư Phật y Bát-nhã Ba-la-mật-đa cố, đắc A-nậu-đa-la Tam-miệu Tam-bồ-đề.',
          'Cố tri Bát-nhã Ba-la-mật-đa, thị đại thần chú, thị đại minh chú, thị vô thượng chú, thị vô đẳng đẳng chú, năng trừ nhất thiết khổ, chơn thiệt bất hư.',
          'Cố thuyết Bát-nhã Ba-la-mật-đa chú, tức thuyết chú viết:',
          'Yết-đế yết-đế, ba-la yết-đế, ba-la-tăng yết-đế, Bồ-đề tát-bà-ha.',
        ],
      },
    ],
  },
  {
    id: 'chu-dai-bi',
    title: 'Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni',
    shortTitle: 'Chú Đại Bi',
    kind: 'chu',
    occasion: 'Công phu sáng · cầu an · tiêu tai · trì chú hằng ngày',
    summary:
      'Thần chú gắn hạnh nguyện Quán Thế Âm — bản 84 câu phiên âm Hán–Việt phổ thông tại chùa Việt.',
    sections: [
      {
        title: 'Xưng danh',
        lines: [
          'Nam mô Đại Bi Hội Thượng Phật Bồ-tát. (3 lần)',
          'Thiên thủ thiên nhãn vô ngại Đại Bi Tâm Đà La Ni.',
        ],
      },
      {
        title: 'Chú (84 câu)',
        lines: [
          'Nam mô hắc ra đát na đa ra dạ da.',
          'Nam mô a rị da,',
          'Bà lô yết đế thước bát ra da,',
          'Bồ đề tát đỏa bà da,',
          'Ma ha tát đỏa bà da,',
          'Ma ha ca lô ni ca da.',
          'Án.',
          'Tát bàn ra phạt duệ,',
          'Số đát na đát tỏa.',
          'Nam mô tất kiết lật đỏa y mông a rị da,',
          'Bà lô yết đế thất Phật ra lăng đà bà.',
          'Nam mô na ra cẩn trì.',
          'Hê rị, ma ha bàn đa sa mế,',
          'Tát bà a tha đậu du bằng,',
          'A thệ dụng,',
          'Tát bà tát đa,',
          'Na ma bà già,',
          'Ma phạt đạt đậu,',
          'Đát điệt tha.',
          'Án. A bà lô hê,',
          'Lô ca đế,',
          'Ca ra đế,',
          'Di hê rị,',
          'Ma ha bồ đề tát đỏa,',
          'Tát bà tát bà,',
          'Ma ra ma ra,',
          'Ma hê ma hê rị đà dụng,',
          'Câu lô câu lô kiết mông,',
          'Độ lô độ lô phạt xà da đế,',
          'Ma ha phạt xà da đế,',
          'Đà ra đà ra,',
          'Địa rị ni,',
          'Thất Phật ra da,',
          'Giá ra giá ra.',
          'Mạ mạ phạt ma ra,',
          'Mục đế lệ,',
          'Y hê y hê,',
          'Thất na thất na,',
          'A ra sâm Phật ra xá lợi,',
          'Phạt sa phạt sâm,',
          'Phật ra xá da,',
          'Hô lô hô lô ma ra,',
          'Hô lô hô lô hê rị,',
          'Ta ra ta ra,',
          'Tất rị tất rị,',
          'Tô rô tô rô,',
          'Bồ đề dạ bồ đề dạ,',
          'Bồ đà dạ bồ đà dạ,',
          'Di đế rị dạ,',
          'Na ra cẩn trì,',
          'Địa rị sắc ni na,',
          'Ba dạ ma na,',
          'Ta bà ha.',
          'Tất đà dạ ta bà ha.',
          'Ma ha tất đà dạ ta bà ha.',
          'Tất đà du nghệ thất bàn ra dạ ta bà ha.',
          'Na ra cẩn trì ta bà ha.',
          'Ma ra na ra ta bà ha.',
          'Tất ra tăng a mục khê da ta bà ha.',
          'Ta bà ma ha a tất đà dạ ta bà ha.',
          'Giả kiết ra a tất đà dạ ta bà ha.',
          'Ba đà ma kiết tất đà dạ ta bà ha.',
          'Na ra cẩn trì bàn đà ra dạ ta bà ha.',
          'Ma bà rị thắng yết ra dạ ta bà ha.',
          'Nam mô hắc ra đát na đa ra dạ da.',
          'Nam mô a rị da,',
          'Bà lô yết đế,',
          'Thước bàn ra dạ,',
          'Ta bà ha.',
          'Án. Tất điện đô,',
          'Mạn đa ra,',
          'Bạt đà dạ,',
          'Ta bà ha.',
        ],
      },
      {
        title: 'Kết chú',
        lines: [
          'Án tất điện đô mạn đa ra bạt đà dạ ta bà ha. (3 lần)',
        ],
      },
    ],
  },
  {
    id: 'kinh-a-di-da',
    title: 'Phật Thuyết A Di Đà Kinh',
    shortTitle: 'Kinh A Di Đà',
    kind: 'kinh',
    occasion: 'Công phu chiều · cầu siêu · niệm Phật · rằm · mùng một',
    summary:
      'Kinh căn bản Tịnh Độ — tả cảnh Tây Phương Cực Lạc và pháp trì danh hiệu Phật A Di Đà cầu vãng sanh.',
    sections: [
      {
        title: 'Khai kinh',
        lines: [
          'Nam mô Bổn Sư Thích Ca Mâu Ni Phật. (3 lần)',
          'Phật thuyết A Di Đà Kinh.',
        ],
      },
      {
        lines: [
          'Như thị ngã văn: Nhất thời Phật tại Xá-vệ quốc, Kỳ-thụ Cấp Cô Độc viên, dữ đại Tỳ-kheo tăng thiên nhị bách ngũ thập nhân câu. Giai thị đại A-la-hán, chúng sở tri thức: Trưởng lão Xá-lợi-phất, Ma-ha Mục-kiền-liên, Ma-ha Ca-diếp, Ma-ha Ca-chiên-diên, Ma-ha Câu-hy-la, Ly-bà-đa, Tất-lăng-già-bà-tha, Càn-đà-na-tử, A-nâu-lâu-đà, Kiều-phạm-ba-đề, Bạc-câu-la, A-nan-đà, La-hầu-la, Kiều-phạm-di, Tân-đầu-lô Phả-la-đọa, Ca-lưu-đà-di, Ma-ha Kiếp-tân-na, Bạc-câu-la-đa, A-nậu-lâu-đà đẳng.',
          'Tịnh chư Bồ-tát Ma-ha-tát: Văn-thù-sư-lợi Pháp vương tử, A-dật-đa Bồ-tát, Càn-đà-ha-đề Bồ-tát, Thường Tinh Tấn Bồ-tát, dữ như thị đẳng chư đại Bồ-tát. Cập Thích Đề-hoàn Nhân đẳng vô lượng chư thiên đại chúng câu.',
        ],
      },
      {
        title: 'Tịnh độ trang nghiêm',
        lines: [
          'Nhĩ thời Phật cáo Trưởng lão Xá-lợi-phất: Tòng thị Tây phương quá thập vạn ức Phật độ, hữu thế giới danh viết Cực Lạc. Kỳ độ hữu Phật hiệu A Di Đà, kim hiện tại thuyết pháp.',
          'Xá-lợi-phất! Bỉ độ hà cố danh vi Cực Lạc? Kỳ quốc chúng sanh vô hữu chúng khổ, đản thọ chư lạc, cố danh Cực Lạc.',
          'Hựu Xá-lợi-phất! Cực Lạc quốc độ thất trùng lan thuẫn, thất trùng la võng, thất trùng hàng thụ, giai thị tứ bảo châu tráp vi nhiêu, thị cố bỉ quốc danh vi Cực Lạc.',
          'Hựu Xá-lợi-phất! Cực Lạc quốc độ hữu thất bảo trì: bát công đức thủy sung mãn kỳ trung. Trì để thuần dĩ kim sa bố địa. Tứ biên giai đạo, kim, ngân, lưu ly, pha lê hợp thành. Thượng hữu lâu các, diệc dĩ kim, ngân, lưu ly, pha lê, xa cừ, xích châu, mã não nhi nghiêm sức chi. Trì trung liên hoa đại như xa luân, thanh sắc thanh quang, hoàng sắc hoàng quang, xích sắc xích quang, bạch sắc bạch quang, vi diệu hương khiết.',
          'Xá-lợi-phất! Cực Lạc quốc độ thành tựu như thị công đức trang nghiêm.',
        ],
      },
      {
        title: 'Nhạc thọ · hóa điểu',
        lines: [
          'Hựu Xá-lợi-phất! Bỉ Phật quốc độ thường tác thiên nhạc. Hoàng kim vi địa. Trú dạ lục thời nhi vũ thiên hoa. Kỳ độ chúng sanh thường dĩ thanh đán, các dĩ y khâm thịnh chúng diệu hoa, cúng dường tha phương thập vạn ức Phật; tức dĩ thực thời hoàn đáo bổn quốc, phạn thực kinh hành.',
          'Xá-lợi-phất! Cực Lạc quốc độ thành tựu như thị công đức trang nghiêm.',
          'Phục thứ Xá-lợi-phất! Bỉ quốc thường hữu chủng chủng kỳ diệu tạp sắc chi điểu: bạch hạc, khổng tước, anh vũ, xá-lợi, ca-lăng-tần-già, cộng mạng chi điểu. Thị chư chúng điểu trú dạ lục thời xuất hòa nhã âm. Kỳ âm diễn xướng ngũ căn, ngũ lực, thất Bồ-đề phần, bát thánh đạo phần như thị đẳng pháp. Kỳ độ chúng sanh văn thị âm dĩ, giai tất niệm Phật, niệm Pháp, niệm Tăng.',
          'Xá-lợi-phất! Nhữ vật vị thử điểu thật thị tội báo sở sanh. Sở dĩ giả hà? Bỉ Phật quốc độ vô tam ác đạo. Xá-lợi-phất! Kỳ Phật quốc độ thượng vô ác đạo chi danh, hà huống hữu thật. Thị chư chúng điểu giai thị A Di Đà Phật dục linh pháp âm tuyên lưu, biến hóa sở tác.',
          'Xá-lợi-phất! Bỉ Phật quốc độ, vi phong xuy động, chư bảo hành thụ cập bảo la võng xuất vi diệu âm, thí như bách thiên chủng nhạc đồng thời câu tác. Văn thị âm giả, tự nhiên giai sanh niệm Phật, niệm Pháp, niệm Tăng chi tâm.',
          'Xá-lợi-phất! Kỳ Phật quốc độ thành tựu như thị công đức trang nghiêm.',
        ],
      },
      {
        title: 'Danh hiệu · nhân duyên vãng sanh',
        lines: [
          'Xá-lợi-phất! Ư nhữ ý vân hà? Bỉ Phật hà cố hiệu A Di Đà? Xá-lợi-phất! Bỉ Phật quang minh vô lượng, chiếu thập phương quốc vô sở chướng ngại, thị cố hiệu vi A Di Đà.',
          'Hựu Xá-lợi-phất! Bỉ Phật thọ mạng cập kỳ nhân dân, vô lượng vô biên a-tăng-kỳ kiếp, cố danh A Di Đà.',
          'Xá-lợi-phất! A Di Đà Phật thành Phật dĩ lai, ư kim thập kiếp.',
          'Hựu Xá-lợi-phất! Bỉ Phật hữu vô lượng vô biên thanh văn đệ tử, giai A-la-hán, phi thị toán số chi sở năng tri; chư Bồ-tát chúng diệc phục như thị.',
          'Xá-lợi-phất! Bỉ Phật quốc độ thành tựu như thị công đức trang nghiêm.',
          'Hựu Xá-lợi-phất! Cực Lạc quốc độ chúng sanh sanh giả, giai thị A-bệ-bạt-trí. Kỳ trung đa hữu nhất sanh bổ xứ, kỳ số thậm đa, phi thị toán số chi sở năng tri, đản khả dĩ vô lượng vô biên a-tăng-kỳ thuyết.',
          'Xá-lợi-phất! Chúng sanh văn giả, ưng đương phát nguyện, nguyện sanh bỉ quốc. Sở dĩ giả hà? Đắc dữ như thị chư thượng thiện nhân câu hội nhất xứ.',
          'Xá-lợi-phất! Bất khả dĩ thiểu thiện căn phước đức nhân duyên đắc sanh bỉ quốc.',
          'Xá-lợi-phất! Nhược hữu thiện nam tử, thiện nữ nhân, văn thuyết A Di Đà Phật, chấp trì danh hiệu: nhược nhất nhật, nhược nhị nhật, nhược tam nhật, nhược tứ nhật, nhược ngũ nhật, nhược lục nhật, nhược thất nhật, nhất tâm bất loạn. Kỳ nhân lâm mạng chung thời, A Di Đà Phật dữ chư thánh chúng hiện tại kỳ tiền. Thị nhân chung thời, tâm bất điên đảo, tức đắc vãng sanh A Di Đà Phật Cực Lạc quốc độ.',
          'Xá-lợi-phất! Ngã kiến thị lợi, cố thuyết thử ngôn. Nhược hữu chúng sanh văn thị thuyết giả, ưng đương phát nguyện, sanh bỉ quốc độ.',
        ],
      },
      {
        title: 'Chư Phật hộ niệm',
        lines: [
          'Xá-lợi-phất! Như ngã kim giả tán thán A Di Đà Phật bất khả tư nghị công đức chi lợi; Đông phương diệc hữu A Súc Bệ Phật, Tu Di Tướng Phật, Đại Tu Di Phật, Tu Di Quang Phật, Diệu Âm Phật — như thị đẳng Hằng hà sa số chư Phật, các ư kỳ quốc xuất quảng trường thiệt tướng, biến phủ tam thiên đại thiên thế giới, thuyết thành thật ngôn: Nhữ đẳng chúng sanh đương tín thị xưng tán bất khả tư nghị công đức, nhất thiết chư Phật sở hộ niệm kinh.',
          'Xá-lợi-phất! Nam phương thế giới hữu Nhật Nguyệt Đăng Phật, Danh Văn Quang Phật, Đại Diệm Kiên Phật, Tu Di Đăng Phật, Vô Lượng Tinh Tấn Phật — như thị đẳng Hằng hà sa số chư Phật, các ư kỳ quốc xuất quảng trường thiệt tướng, biến phủ tam thiên đại thiên thế giới, thuyết thành thật ngôn: Nhữ đẳng chúng sanh đương tín thị xưng tán bất khả tư nghị công đức, nhất thiết chư Phật sở hộ niệm kinh.',
          'Xá-lợi-phất! Tây phương thế giới hữu Vô Lượng Thọ Phật, Vô Lượng Tướng Phật, Vô Lượng Tràng Phật, Đại Quang Phật, Đại Minh Phật, Bảo Tướng Phật, Tịnh Quang Phật — như thị đẳng Hằng hà sa số chư Phật, các ư kỳ quốc xuất quảng trường thiệt tướng, biến phủ tam thiên đại thiên thế giới, thuyết thành thật ngôn: Nhữ đẳng chúng sanh đương tín thị xưng tán bất khả tư nghị công đức, nhất thiết chư Phật sở hộ niệm kinh.',
          'Xá-lợi-phất! Bắc phương thế giới hữu Diệm Kiên Phật, Tối Thắng Âm Phật, Nan Trở Phật, Nhật Sanh Phật, Võng Minh Phật — như thị đẳng Hằng hà sa số chư Phật, các ư kỳ quốc xuất quảng trường thiệt tướng, biến phủ tam thiên đại thiên thế giới, thuyết thành thật ngôn: Nhữ đẳng chúng sanh đương tín thị xưng tán bất khả tư nghị công đức, nhất thiết chư Phật sở hộ niệm kinh.',
          'Xá-lợi-phất! Hạ phương thế giới hữu Sư Tử Phật, Danh Văn Phật, Danh Quang Phật, Đạt Ma Phật, Pháp Tràng Phật, Trì Pháp Phật — như thị đẳng Hằng hà sa số chư Phật, các ư kỳ quốc xuất quảng trường thiệt tướng, biến phủ tam thiên đại thiên thế giới, thuyết thành thật ngôn: Nhữ đẳng chúng sanh đương tín thị xưng tán bất khả tư nghị công đức, nhất thiết chư Phật sở hộ niệm kinh.',
          'Xá-lợi-phất! Thượng phương thế giới hữu Phạm Âm Phật, Tú Vương Phật, Hương Thượng Phật, Hương Quang Phật, Đại Diệm Kiên Phật, Tạp Sắc Bảo Hoa Nghiêm Thân Phật, Ta La Thụ Vương Phật, Bảo Hoa Đức Phật, Kiến Nhất Thiết Nghĩa Phật, Như Tu Di Sơn Phật — như thị đẳng Hằng hà sa số chư Phật, các ư kỳ quốc xuất quảng trường thiệt tướng, biến phủ tam thiên đại thiên thế giới, thuyết thành thật ngôn: Nhữ đẳng chúng sanh đương tín thị xưng tán bất khả tư nghị công đức, nhất thiết chư Phật sở hộ niệm kinh.',
        ],
      },
      {
        title: 'Khuyến tín · khuyến nguyện',
        lines: [
          'Xá-lợi-phất! Ư nhữ ý vân hà? Hà cố danh vi Nhất thiết chư Phật sở hộ niệm kinh? Xá-lợi-phất! Nhược hữu thiện nam tử, thiện nữ nhân, văn thị chư Phật sở thuyết danh cập kinh danh giả, vi nhất thiết chư Phật cộng sở hộ niệm, giai đắc bất thối chuyển ư A-nậu-đa-la Tam-miệu Tam-bồ-đề. Thị cố Xá-lợi-phất! Nhữ đẳng giai đương tín thọ ngã ngữ cập chư Phật sở thuyết.',
          'Xá-lợi-phất! Nhược hữu nhân dĩ phát nguyện, kim phát nguyện, đương phát nguyện, dục sanh A Di Đà Phật quốc giả, thị chư nhân đẳng giai đắc bất thối chuyển ư A-nậu-đa-la Tam-miệu Tam-bồ-đề, ư bỉ quốc độ nhược dĩ sanh, nhược kim sanh, nhược đương sanh.',
          'Thị cố Xá-lợi-phất! Chư thiện nam tử, thiện nữ nhân, nhược hữu tín giả, ưng đương phát nguyện, sanh bỉ quốc độ.',
          'Xá-lợi-phất! Như ngã kim giả xưng tán chư Phật bất khả tư nghị công đức; bỉ chư Phật đẳng diệc xưng tán ngã bất khả tư nghị công đức, nhi tác thị ngôn: Thích Ca Mâu Ni Phật năng vi thậm nan hy hữu chi sự, năng ư Ta-bà quốc độ ngũ trược ác thế — kiếp trược, kiến trược, phiền não trược, chúng sanh trược, mạng trược trung — đắc A-nậu-đa-la Tam-miệu Tam-bồ-đề, vị chư chúng sanh thuyết thị nhất thiết thế gian nan tín chi pháp.',
          'Xá-lợi-phất! Đương tri ngã ư ngũ trược ác thế hành thử nan sự, đắc A-nậu-đa-la Tam-miệu Tam-bồ-đề, vị nhất thiết thế gian thuyết thử nan tín chi pháp, thị vi thậm nan.',
          'Phật thuyết thử kinh dĩ, Xá-lợi-phất cập chư Tỳ-kheo, nhất thiết thế gian thiên, nhân, A-tu-la đẳng, văn Phật sở thuyết, hoan hỷ tín thọ, tác lễ nhi khứ.',
        ],
      },
      {
        title: 'Kết kinh · niệm Phật',
        lines: [
          'Nam mô Tây Phương Cực Lạc thế giới Đại Từ Đại Bi A Di Đà Phật.',
          'Nam mô A Di Đà Phật. (niệm nhiều biến)',
          'Nam mô Đại Bi Quán Thế Âm Bồ-tát. (3 lần)',
          'Nam mô Đại Thế Chí Bồ-tát. (3 lần)',
          'Nam mô Thanh Tịnh Đại Hải Chúng Bồ-tát. (3 lần)',
        ],
      },
    ],
  },
  {
    id: 'pham-pho-mon',
    title: 'Diệu Pháp Liên Hoa Kinh — Phẩm Phổ Môn',
    shortTitle: 'Kinh Phổ Môn',
    kind: 'kinh',
    occasion: 'Cầu an · tiêu tai · vía Quán Âm · khánh hỷ',
    summary:
      'Phẩm thứ 25 Kinh Pháp Hoa — hạnh nguyện cứu khổ của Bồ-tát Quán Thế Âm: hữu cầu tất ứng, thị hiện ba mươi ba ứng thân.',
    sections: [
      {
        title: 'Nhân duyên',
        lines: [
          'Nhĩ thời Vô Tận Ý Bồ-tát tức tòng tòa khởi, thiên đản hữu kiên, hợp chưởng hướng Phật nhi tác thị ngôn: Thế Tôn! Quán Thế Âm Bồ-tát dĩ hà nhân duyên danh Quán Thế Âm?',
          'Phật cáo Vô Tận Ý Bồ-tát: Thiện nam tử! Nhược hữu vô lượng bách thiên vạn ức chúng sanh thọ chư khổ não, văn thị Quán Thế Âm Bồ-tát, nhất tâm xưng danh, Quán Thế Âm Bồ-tát tức thời quán kỳ âm thanh, giai đắc giải thoát.',
        ],
      },
      {
        title: 'Cứu bảy nạn',
        lines: [
          'Nhược hữu trì thị Quán Thế Âm Bồ-tát danh giả, thiết nhập đại hỏa, hỏa bất năng thiêu, do thị Bồ-tát uy thần lực cố.',
          'Nhược vi đại thủy sở phiêu, xưng kỳ danh hiệu, tức đắc thiển xứ.',
          'Nhược hữu bách thiên vạn ức chúng sanh, vi cầu kim, ngân, lưu ly, xa cừ, mã não, san hô, hổ phách, chân châu đẳng bảo, nhập ư đại hải; giả sử hắc phong xuy kỳ thuyền phàm, phiêu đọa La-sát quỷ quốc, kỳ trung nhược hữu nãi chí nhất nhân xưng Quán Thế Âm Bồ-tát danh giả, thị chư nhân đẳng giai đắc giải thoát La-sát chi nạn. Dĩ thị nhân duyên danh Quán Thế Âm.',
          'Nhược phục hữu nhân lâm đương bị hại, xưng Quán Thế Âm Bồ-tát danh giả, bỉ sở chấp đao trượng tầm đoạn đoạn hoại, nhi đắc giải thoát.',
          'Nhược tam thiên đại thiên quốc độ mãn trung Dạ-xoa, La-sát dục lai não nhân, văn kỳ xưng Quán Thế Âm Bồ-tát danh giả, thị chư ác quỷ thượng bất năng dĩ ác nhãn thị chi, huống phục gia hại.',
          'Thiết phục hữu nhân, nhược hữu tội, nhược vô tội, nữu tử, già tỏa kiểm hệ kỳ thân, xưng Quán Thế Âm Bồ-tát danh giả, giai tất đoạn hoại, tức đắc giải thoát.',
          'Nhược tam thiên đại thiên quốc độ mãn trung oán tặc, hữu nhất thương chủ tương chư thương nhân, quyến trọng bảo vật kinh quá hiểm lộ; kỳ trung nhất nhân tác thị xướng ngôn: Chư thiện nam tử! Vật đắc khủng bố. Nhữ đẳng ưng đương nhất tâm xưng Quán Thế Âm Bồ-tát danh hiệu. Thị Bồ-tát năng dĩ vô úy thí ư chúng sanh. Nhữ đẳng nhược xưng danh giả, ư thử oán tặc đương đắc giải thoát. Chúng thương nhân văn, câu phát thanh ngôn: Nam mô Quán Thế Âm Bồ-tát. Xưng kỳ danh cố, tức đắc giải thoát.',
          'Vô Tận Ý! Quán Thế Âm Bồ-tát Ma-ha-tát oai thần chi lực, nguy hiểm như thị.',
        ],
      },
      {
        title: 'Ba độc · hai cầu',
        lines: [
          'Nhược hữu chúng sanh đa ư dâm dục, thường niệm cung kính Quán Thế Âm Bồ-tát, tiện đắc ly dục.',
          'Nhược đa sân khuể, thường niệm cung kính Quán Thế Âm Bồ-tát, tiện đắc ly sân.',
          'Nhược đa ngu si, thường niệm cung kính Quán Thế Âm Bồ-tát, tiện đắc ly si.',
          'Vô Tận Ý! Quán Thế Âm Bồ-tát hữu như thị đẳng đại oai thần lực, đa sở nhiêu ích, thị cố chúng sanh thường ưng tâm niệm.',
          'Nhược hữu nữ nhân thiết dục cầu nam, lễ bái cúng dường Quán Thế Âm Bồ-tát, tiện sanh phước đức trí tuệ chi nam; thiết dục cầu nữ, tiện sanh đoan chánh hữu tướng chi nữ, túc thực đức bổn, chúng nhân ái kính.',
          'Vô Tận Ý! Quán Thế Âm Bồ-tát hữu như thị lực.',
          'Nhược hữu chúng sanh cung kính lễ bái Quán Thế Âm Bồ-tát, phước bất đường không. Thị cố chúng sanh giai ưng thọ trì Quán Thế Âm Bồ-tát danh hiệu.',
        ],
      },
      {
        title: 'Công đức trì danh',
        lines: [
          'Vô Tận Ý! Nhược hữu nhân thọ trì lục thập nhị ức Hằng hà sa Bồ-tát danh tự, phục tận hình cúng dường ẩm thực, y phục, ngọa cụ, y dược — ư nhữ ý vân hà? Thị thiện nam tử, thiện nữ nhân công đức đa phủ?',
          'Vô Tận Ý ngôn: Thậm đa, Thế Tôn!',
          'Phật ngôn: Nhược phục hữu nhân thọ trì Quán Thế Âm Bồ-tát danh hiệu, nãi chí nhất thời lễ bái cúng dường, thị nhị nhân phước chánh đẳng vô dị, ư bách thiên vạn ức kiếp bất khả cùng tận.',
          'Vô Tận Ý! Thọ trì Quán Thế Âm Bồ-tát danh hiệu, đắc như thị vô lượng vô biên phước đức chi lợi.',
        ],
      },
      {
        title: 'Ba mươi ba ứng thân (tóm yếu)',
        lines: [
          'Vô Tận Ý Bồ-tát bạch Phật ngôn: Thế Tôn! Quán Thế Âm Bồ-tát vân hà du thử Ta-bà thế giới? Vân hà nhi vị chúng sanh thuyết pháp? Phương tiện chi lực kỳ sự vân hà?',
          'Phật cáo Vô Tận Ý Bồ-tát: Thiện nam tử! Nhược hữu quốc độ chúng sanh ưng dĩ Phật thân đắc độ giả, Quán Thế Âm Bồ-tát tức hiện Phật thân nhi vị thuyết pháp.',
          'Ưng dĩ Bích-chi-phật thân đắc độ giả, tức hiện Bích-chi-phật thân nhi vị thuyết pháp.',
          'Ưng dĩ Thanh văn thân đắc độ giả, tức hiện Thanh văn thân nhi vị thuyết pháp.',
          'Ưng dĩ Phạm vương thân, Đế Thích thân, Tự tại thiên thân, Đại tự tại thiên thân, Thiên đại tướng quân thân, Tỳ-sa-môn thân, tiểu vương thân, trưởng giả thân, cư sĩ thân, tể quan thân, Bà-la-môn thân, Tỳ-kheo, Tỳ-kheo-ni, Ưu-bà-tắc, Ưu-bà-di thân, phụ nữ thân, đồng nam, đồng nữ thân, thiên, long, Dạ-xoa, Càn-thát-bà, A-tu-la, Ca-lâu-la, Khẩn-na-la, Ma-hầu-la-già, nhân phi nhân đẳng thân đắc độ giả — giai hiện chi nhi vị thuyết pháp.',
          'Ưng dĩ Chấp Kim Cương thần đắc độ giả, tức hiện Chấp Kim Cương thần nhi vị thuyết pháp.',
          'Vô Tận Ý! Thị Quán Thế Âm Bồ-tát thành tựu như thị công đức, dĩ chủng chủng hình du chư quốc độ, độ thoát chúng sanh. Thị cố nhữ đẳng ưng đương nhất tâm cúng dường Quán Thế Âm Bồ-tát.',
          'Thị Quán Thế Âm Bồ-tát Ma-ha-tát ư bố úy cấp nạn chi trung năng thí vô úy, thị cố thử Ta-bà thế giới giai hiệu chi vi Thí Vô Úy giả.',
        ],
      },
      {
        title: 'Kệ tán',
        lines: [
          'Thế Tôn diệu tướng cụ — Ngã kim trùng vấn bỉ:',
          'Phật tử hà nhân duyên — Danh vi Quán Thế Âm?',
          'Cụ túc diệu tướng tôn — Kệ đáp Vô Tận Ý:',
          'Nhữ thính Quán Âm hạnh — Thiện ứng chư phương sở.',
          'Hoằng thệ thâm như hải — Lịch kiếp bất tư nghị,',
          'Thị đa thiên ức Phật — Phát đại thanh tịnh nguyện.',
          'Ngã vị nhữ lược thuyết — Văn danh cập kiến thân,',
          'Tâm niệm bất không quá — Năng diệt chư hữu khổ.',
          'Giả sử hưng hại ý — Thôi lạc đại hỏa khanh,',
          'Niệm bỉ Quán Âm lực — Hỏa khanh biến thành trì.',
          'Hoặc phiêu lưu khổ hải — Long ngư chư quỷ nạn,',
          'Niệm bỉ Quán Âm lực — Ba lãng bất năng một.',
          'Hoặc tại Tu Di phong — Vi nhân sở thôi đọa,',
          'Niệm bỉ Quán Âm lực — Như nhật hư không trụ.',
          'Hoặc bị ác nhân trục — Đọa lạc Kim Cương sơn,',
          'Niệm bỉ Quán Âm lực — Bất năng tổn nhất mao.',
          'Hoặc giá oán tặc nhiễu — Các chấp đao gia hại,',
          'Niệm bỉ Quán Âm lực — Hàm tức khởi từ tâm.',
          'Hoặc tao vương nạn khổ — Lâm hình dục thọ chung,',
          'Niệm bỉ Quán Âm lực — Đao tầm đoạn đoạn hoại.',
          'Hoặc tù cấm già tỏa — Thủ túc bị nữu tịch,',
          'Niệm bỉ Quán Âm lực — Thích nhiên đắc giải thoát.',
          'Chú trở chư độc dược — Sở dục hại thân giả,',
          'Niệm bỉ Quán Âm lực — Hoàn trước ư bổn nhân.',
          'Hoặc ngộ ác La-sát — Độc long chư quỷ đẳng,',
          'Niệm bỉ Quán Âm lực — Thời tất bất cảm hại.',
          'Nhược ác thú vi nhiễu — Lợi nha trảo khả bố,',
          'Niệm bỉ Quán Âm lực — Trì tẩu vô biên phương.',
          'Ngành xà cập phúc yết — Khí độc yên hỏa nhiên,',
          'Niệm bỉ Quán Âm lực — Tầm thanh tự hồi khứ.',
          'Vân lôi cổ điện điện — Giáng bảo chú đại vũ,',
          'Niệm bỉ Quán Âm lực — Ưng thời đắc tiêu tán.',
          'Chúng sanh bị khốn ách — Vô lượng khổ bức thân,',
          'Quán Âm diệu trí lực — Năng cứu thế gian khổ.',
          'Cụ túc thần thông lực — Quảng tu trí phương tiện,',
          'Thập phương chư quốc độ — Vô sát bất hiện thân.',
          'Chủng chủng chư ác thú — Địa ngục quỷ súc sanh,',
          'Sanh lão bệnh tử khổ — Dĩ tiệm tất linh diệt.',
          'Chơn quán thanh tịnh quán — Quảng đại trí tuệ quán,',
          'Bi quán cập từ quán — Thường nguyện thường chiêm ngưỡng.',
          'Vô cấu thanh tịnh quang — Tuệ nhật phá chư ám,',
          'Năng phục tai phong hỏa — Phổ minh chiếu thế gian.',
          'Bi thể giới lôi chấn — Từ ý diệu đại vân,',
          'Thù cam lộ pháp vũ — Diệt trừ phiền não diệm.',
          'Tranh tụng kinh quan xứ — Bố úy quân trận trung,',
          'Niệm bỉ Quán Âm lực — Chúng oán tất thối tán.',
          'Diệu âm Quán Thế Âm — Phạm âm hải triều âm,',
          'Thắng bỉ thế gian âm — Thị cố tu thường niệm.',
          'Niệm niệm vật sanh nghi — Quán Âm Tịnh Thánh giả,',
          'Ư khổ não tử ách — Năng vi tác y hỗ.',
          'Cụ nhất thiết công đức — Từ nhãn thị chúng sanh,',
          'Phước tụ hải vô lượng — Thị cố ưng đảnh lễ.',
        ],
      },
      {
        title: 'Kết phẩm',
        lines: [
          'Nhĩ thời Trì Địa Bồ-tát tức tòng tòa khởi, tiền bạch Phật ngôn: Thế Tôn! Nhược hữu chúng sanh văn thị Quán Thế Âm Bồ-tát phẩm tự tại chi nghiệp, Phổ Môn thị hiện thần thông lực giả, đương tri thị nhân công đức bất thiểu.',
          'Phật thuyết thị Phổ Môn phẩm thời, chúng trung bát vạn tứ thiên chúng sanh giai phát vô đẳng đẳng A-nậu-đa-la Tam-miệu Tam-bồ-đề tâm.',
          'Nam mô Đại Bi Quán Thế Âm Bồ-tát. (3 lần)',
        ],
      },
    ],
  },
  {
    id: 'kinh-dia-tang',
    title: 'Địa Tạng Bồ-tát Bổn Nguyện Kinh (trích)',
    shortTitle: 'Kinh Địa Tạng (trích)',
    kind: 'kinh',
    occasion: 'Vu lan · cầu siêu · vía Địa Tạng (30/7 ÂL) · sám hối',
    summary:
      'Trích các đoạn thường tụng: xưng tán bổn nguyện Địa Tạng Vương Bồ-tát và lợi ích trì danh — bản đầy đủ do nhà chùa bổ sung theo khóa lễ.',
    sections: [
      {
        title: 'Xưng tán',
        lines: [
          'Nam mô U Minh Giáo Chủ Bản Tôn Địa Tạng Vương Bồ-tát. (3 lần)',
          'Địa Tạng Bồ-tát Ma-ha-tát, ư vô lượng kiếp phát đại từ bi nguyện: Địa ngục vị không thề bất thành Phật; chúng sanh độ tận phương chứng Bồ-đề.',
        ],
      },
      {
        title: 'Bổn nguyện (tóm)',
        lines: [
          'Nhược hữu thiện nam tử, thiện nữ nhân, ư Địa Tạng Bồ-tát danh hiệu nhất tâm quy y, chí tâm xưng niệm, tắc năng diệt trừ vô lượng tội nghiệp, tăng trưởng phước tuệ, linh chư ác đạo khổ báo tiêu trừ.',
          'Hoặc hữu chúng sanh tạo chư ác nghiệp, lâm chung chi thời văn Địa Tạng danh hiệu, nhất niệm xưng danh, tức đắc giải thoát địa ngục, ngạ quỷ, súc sanh chi khổ.',
          'Nhược vị quá khứ phụ mẫu, lục thân quyến thuộc, chí thành trì tụng Địa Tạng danh hiệu, hồi hướng công đức, tắc linh vong giả đắc siêu thăng thiện đạo, hiện tiền quyến thuộc tăng trưởng phước thọ.',
        ],
      },
      {
        title: 'Trì danh · hồi hướng',
        lines: [
          'Nam mô Địa Tạng Vương Bồ-tát. (niệm nhiều biến)',
          'Nguyện dĩ thử công đức — Trang nghiêm Phật tịnh độ,',
          'Thượng báo tứ trọng ân — Hạ tế tam đồ khổ.',
          'Nhược hữu kiến văn giả — Tất phát Bồ-đề tâm,',
          'Tận thử nhất báo thân — Đồng sanh Cực Lạc quốc.',
        ],
      },
    ],
  },
  {
    id: 'tam-quy-ngu-gioi',
    title: 'Tam Quy · Ngũ Giới',
    shortTitle: 'Tam Quy · Ngũ Giới',
    kind: 'nghi_thuc',
    occasion: 'Kết thúc khóa lễ · quy y · nhắc giới tại gia',
    summary:
      'Ba ngôi nương tựa và năm giới căn bản của Phật tử tại gia — thường đọc sau thời kinh hoặc khi phát nguyện.',
    sections: [
      {
        title: 'Tam quy',
        lines: [
          'Tự quy y Phật — đương nguyện chúng sanh — thể giải đại đạo — phát vô thượng tâm.',
          'Tự quy y Pháp — đương nguyện chúng sanh — thâm nhập kinh tạng — trí tuệ như hải.',
          'Tự quy y Tăng — đương nguyện chúng sanh — thống lý đại chúng — nhất thiết vô ngại.',
        ],
      },
      {
        title: 'Ngũ giới',
        lines: [
          'Đệ nhất: Không sát sanh.',
          'Đệ nhị: Không trộm cắp.',
          'Đệ tam: Không tà dâm.',
          'Đệ tứ: Không nói dối.',
          'Đệ ngũ: Không uống rượu (và chất say).',
        ],
      },
    ],
  },
  {
    id: 'sam-hoi-hoi-huong',
    title: 'Sám hối · Hồi hướng',
    shortTitle: 'Sám hối · Hồi hướng',
    kind: 'nghi_thuc',
    occasion: 'Cuối mỗi thời khóa · sau tụng kinh · cầu siêu / cầu an',
    summary:
      'Bài sám ngắn và kệ hồi hướng phổ thông — kết thúc thời tụng, nguyện công đức lan rộng.',
    sections: [
      {
        title: 'Sám hối',
        lines: [
          'Con xưa đã tạo bao ác nghiệp — Đều vì vô thỉ tham sân si,',
          'Từ thân miệng ý mà sanh ra — Tất cả con nay xin sám hối.',
        ],
      },
      {
        title: 'Hồi hướng',
        lines: [
          'Nguyện đem công đức này — Hướng về khắp tất cả,',
          'Đệ tử và chúng sanh — Đều trọn thành Phật đạo.',
          'Nguyện sanh Tây Phương Tịnh độ trung — Cửu phẩm liên hoa vi phụ mẫu,',
          'Hoa khai kiến Phật ngộ vô sanh — Bất thối Bồ-tát vi bạn lữ.',
        ],
      },
      {
        title: 'Tam tự quy',
        lines: [
          'Tự quy y Phật — đương nguyện chúng sanh — thể giải đại đạo — phát vô thượng tâm.',
          'Tự quy y Pháp — đương nguyện chúng sanh — thâm nhập kinh tạng — trí tuệ như hải.',
          'Tự quy y Tăng — đương nguyện chúng sanh — thống lý đại chúng — nhất thiết vô ngại.',
        ],
      },
    ],
  },
];

export function getSutra(id: string): Sutra | undefined {
  return COMMON_SUTRAS.find((s) => s.id === id);
}

export function sutrasByKind(kind: SutraKind | 'all'): Sutra[] {
  if (kind === 'all') return COMMON_SUTRAS;
  return COMMON_SUTRAS.filter((s) => s.kind === kind);
}
