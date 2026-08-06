import Link from 'next/link';
import { TEMPLE_EVENT_TYPE_LABELS } from '@/types/database';
import { ToolGuideCatalog } from './ToolGuideCatalog';
import { BulletList, FlowSteps, Section } from './Section';
import { phoneHref } from '@/lib/contact-links';

export type HuongDanBodyProps = {
  templeName: string;
  abbottName: string;
  phone: string | null;
  simEnabled: boolean;
};

export function HuongDanBody({
  templeName,
  abbottName,
  phone,
  simEnabled,
}: HuongDanBodyProps) {
  const eventLabels = Object.values(TEMPLE_EVENT_TYPE_LABELS);

  return (
    <div className="space-y-4">
      <Section
        id="tap-doan"
        title="Công ty CP Tập đoàn Quan Âm Trang Viện"
        lead="Đơn vị tiên phong Việt Nam trong phát triển hệ thống công cụ phục vụ tâm linh – Phật giáo – cổ học. Không phải agency dựng website thông thường."
      >
        <p>
          Tập đoàn Quan Âm Trang Viện kiến tạo{' '}
          <strong className="font-medium text-ink">
            hạ tầng tâm linh số chuẩn mực
          </strong>{' '}
          để trụ trì hành từ bi hỷ xả nhanh hơn, Phật tử tiếp cận yếu tố tâm linh
          linh hoạt nhất, và ban trị sự nhìn thấy minh bạch thiện nguyện.
        </p>
        <p className="text-muted">
          Với gần <strong className="text-ink font-medium">200 nhân sự</strong>{' '}
          — kỹ sư phần mềm, chuyên gia AI/NLP tiếng Việt, nghiên cứu viên Hán
          Nôm–sớ điệp, kỹ thuật viên hạ tầng, đội vận hành Phật sự số và chăm
          sóc trụ trì 24/7 — Tập đoàn vận hành như một nhà máy phần mềm tâm linh
          hoàn chỉnh.
        </p>
        <BulletList
          items={[
            'R&D liên tục hơn 2 năm trên ngữ liệu Kinh – sớ – đẩu số – Bát tự – Kinh Dịch tiếng Việt.',
            'Đa sản phẩm đồng bộ: website chùa white-label, viết sớ, AI luận giải, sim phong thủy, nước công đức, sổ Phật tử, livestream tụng kinh.',
            'Khách hàng của hệ thống là trụ trì — người trực tiếp hành thiện nguyện; chùa thuộc sở hữu giáo hội nên công cụ được thiết kế để hỗ trợ thầy, không thay thế ý kiến giáo hội khi PR chính thức.',
            'Tầm nhìn: càng nhiều trụ trì sử dụng, hệ sinh thái càng mạnh — luận giải càng sát đạo tình Việt.',
          ]}
        />
      </Section>

      <Section
        id="ha-tang"
        title="Hạ tầng công nghệ cầu kỳ & phức tạp"
        lead="Phức tạp có chủ đích — để trụ trì chỉ cần đăng nhập và hành Phật sự, mọi lớp kỹ thuật chạy phía sau."
      >
        <FlowSteps
          steps={[
            'Edge gateway nhận diện domain từng chùa (ví dụ website thầy đang xem).',
            'Lớp định danh tenant nạp branding, hotline, persona trụ trì.',
            'Cụm inference AI + kho tri thức Kinh–sớ–đẩu số xử lý luận giải.',
            'Ví lượt AI & thanh toán thời gian thực mở khóa công đức.',
            'Quan sát chất lượng đầu ra — giữ ngôn ngữ trang nghiêm, lọc nội dung thô.',
          ]}
        />
        <BulletList
          items={[
            'Persona Engine: mỗi phiên luận mang giọng và danh xưng trụ trì của đúng ngôi chùa.',
            'Hàng đợi ưu tiên giờ lễ / giờ cao điểm Phật sự.',
            'Chống lạm dụng đa lớp (thiết bị, chu kỳ, IP).',
            'Đồng bộ CMS – kho vận – đối soát – broadcast Zalo/SMS trên một nền tảng.',
            'Gần 200 người vận hành chuỗi này liên tục — thầy sở hữu hệ thống là đứng trên hạ tầng “nhà chùa số” do Tập đoàn vận hành.',
          ]}
        />
      </Section>

      <Section
        id="tu-vi-core"
        title="Lõi lập lá số tử vi Quan Âm Trang Viện"
        lead="Tử Vi Core / Đẩu Số Engine — kết tinh R&D Tập đoàn, được xem là lõi lập lá số hoàn hảo nhất từ trước tới nay trong hệ sinh thái công cụ tâm linh số dành cho trụ trì."
      >
        <p>
          Lõi lập lá số do{' '}
          <strong className="font-medium text-ink">
            Công ty CP Tập đoàn Quan Âm Trang Viện nghiên cứu và phát triển độc
            quyền
          </strong>
          : đủ 12 cung, chính tinh – phụ tinh, tứ hóa, đại vận / tiểu vận / lưu
          niên; liên thông luận giải AI đa phái (Bắc phái · Nam phái · Phi
          tinh) và các công cụ hạn năm, đại vận, Bát tự, dụng thần. Không dừng ở
          “ra lá số” — mà nối thành hành trình kết duyên với chùa và trụ trì.
        </p>

        <h3 className="font-display text-xl text-ink pt-2">
          Giúp Phật tử / người xem
        </h3>
        <BulletList
          items={[
            'Tự lập lá số mọi lúc, không cần chờ thầy rảnh mới “xem hộ”.',
            'Nhìn toàn cảnh cung mệnh – quan lộc – tài bạch – phu thê… bằng tiếng Việt dễ hiểu.',
            'Hỏi AI sâu theo lá số thật (không chung chung): hạn năm, đại vận đang đi, hướng thiện hóa giải.',
            'Lộ trình tiếp theo trong hệ: sao chiếu mệnh → dâng sao / sớ cầu an; việc hệ trọng → chọn ngày; hết lượt luận → công đức nước hoặc gọi trụ trì — từ tò mò mệnh lý thành duyên lành với chùa.',
            'Khung tham khảo có cấu trúc, vẫn nhắc thỉnh ý trụ trì khi việc lớn.',
          ]}
        />

        <h3 className="font-display text-xl text-ink pt-2">Giúp trụ trì</h3>
        <BulletList
          items={[
            'Phật tử đến gặp thầy đã có sẵn lá số + câu hỏi → buổi luận ngắn, chuyên sâu hơn, tiết kiệm giờ vàng.',
            'Thương hiệu trụ trì gắn mọi phiên luận (persona + hotline) → thầy hiện diện 24/7 dù đang bận Phật sự.',
            'Lá số là phễu kết duyên: xem tử vi → hỏi AI → hết lượt → gọi thầy / thỉnh nước / đăng ký đàn sao / vào sổ Phật tử.',
            'Ban trị sự thấy chùa có công cụ cổ học bài bản — không phải website giới thiệu suông.',
            'Nhu cầu sao hạn, cưới hỏi, tang lễ… gợi ý thầy mở đúng lễ đàn / khóa tu đúng thời điểm.',
          ]}
        />

        <h3 className="font-display text-xl text-ink pt-2">
          Giúp khách vãng lai lần đầu
        </h3>
        <BulletList
          items={[
            'Trải nghiệm ấn tượng ngay lần đầu vào web chùa → ở lại lâu hơn, nhớ tên trụ trì.',
            'QR trên chai nước / chia sẻ link → kéo thêm người mới vào hệ sinh thái.',
            'Từ khách xem online → Phật tử gắn bó (sổ đăng ký, công đức, dự lễ).',
          ]}
        />

        <p className="pt-2 text-muted">
          <span className="text-ink font-medium">Cách dùng nhanh:</span> Phong
          thủy → Lập lá số tử vi → nhập giờ sinh → xem 12 cung → mở Luận giải /
          Hạn năm / Đại vận → hỏi AI → hết lượt thì công đức hoặc gọi{' '}
          {abbottName}.
        </p>
        <p>
          <Link
            href="/phong-thuy/lap-la-so-tu-vi"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--primary-color, #7A1F1F)' }}
          >
            Mở lập lá số tử vi trên {templeName} →
          </Link>
        </p>
      </Section>

      <Section
        id="danh-cho-ai"
        title="Dành cho ai?"
        lead="Khách hàng của Quan Âm Trang Viện là các trụ trì — không phải “bán website cho ngôi chùa” theo nghĩa sở hữu tài sản."
      >
        <BulletList
          items={[
            'Chùa thuộc sở hữu giáo hội; PR chính thức và kinh doanh trên tên chùa cần ý kiến giáo hội.',
            'Hệ thống là bộ công cụ tâm linh giúp trụ trì thuận tiện hơn trong thiện nguyện, từ bi hỷ xả, giúp chúng sinh nắm yếu tố tâm linh linh hoạt và nhanh nhất.',
            `Trang này đang mở trên website ${templeName} — gắn với ${abbottName} — để thầy đọc và thấy giá trị sở hữu hệ thống.`,
          ]}
        />
      </Section>

      <Section
        id="loi-ich"
        title="Lợi ích trụ trì hưởng được"
        lead="Tâm linh và thực tiễn không tách rời — hệ thống phục vụ cả hai."
      >
        <BulletList
          items={[
            'Lan tỏa đạo pháp & thương hiệu cá nhân trụ trì 24/7 trên web, Zalo, QR chai nước.',
            'Kết duyên Phật tử có sổ sách số hóa; gửi tin đúng người, đúng lễ.',
            'Minh bạch công đức nước — nhà hảo tâm và ban trị sự nhìn thấy dòng thiện nguyện.',
            'Tiết kiệm thời gian nghi lễ: sớ cầu online, viết sớ mẫu, lịch sự kiện, tụng kinh live.',
            'AI luận giải mang giọng thầy — giảm tải hỏi lặp, tăng buổi gặp trực tiếp chất lượng.',
            'Dữ liệu nhu cầu (sao hạn, cưới, tang…) hỗ trợ lên lịch đàn lễ đúng lúc.',
          ]}
        />
      </Section>

      <Section
        id="nuoc-qr"
        title="Chai nước mang nhãn — kênh quảng bá chân thiện mỹ"
        lead="Mỗi chai nước công đức không chỉ là vật phẩm — mà là hạt giống truyền thông tâm linh mang tên chùa và trụ trì."
      >
        <p>
          Khi Phật tử cúng dường nước, trên trai nước có{' '}
          <strong className="font-medium text-ink">
            thương hiệu chùa, tên trụ trì, số điện thoại và mã QR
          </strong>{' '}
          quét về website thông tin chùa. Công đức đó có thể ở chùa, hoặc được
          mang tới nơi khác để từ thiện — gặp Phật tử mới, họ lại phát tâm, chai
          mới lại ra đời. Vòng lặp này làm tốc độ lan tỏa tên chùa, trụ trì và
          lịch sử hình thành nhanh hơn rất nhiều so với chỉ đăng bài mạng xã hội.
        </p>
        <FlowSteps
          steps={[
            'Phật tử phát tâm thỉnh nước trên website / thanh toán VietQR.',
            'Chai mang nhãn chùa · trụ trì · SĐT · QR về trang lịch sử & Phật sự.',
            'Chai đi tới gia đình, điểm từ thiện, hoặc người mới gặp duyên.',
            'Người mới quét QR → biết chùa, thầy, hoạt động → công đức / đăng ký / dự lễ.',
            'Mỗi lần phát tâm lại sinh chai mới — vòng lan tỏa chân–thiện–mỹ tự chạy.',
          ]}
        />
        <BulletList
          items={[
            'Ban trị sự / nhà hảo tâm: quỹ nước minh bạch trên trang chủ, thiện nguyện đo được.',
            'Trụ trì: mỗi chai là danh thiếp sống — kích thích gọi điện và ghé chùa.',
            'Hướng tới chân thiện mỹ: quảng bá gắn công đức, không gắn “quảng cáo thô”.',
          ]}
        />
        <p className="flex flex-wrap gap-4 pt-1">
          <Link
            href="/thu-nhan-nuoc"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--primary-color, #7A1F1F)' }}
          >
            Xem nhãn chai nước →
          </Link>
          <Link
            href="/dat-nuoc"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--primary-color, #7A1F1F)' }}
          >
            Trang thỉnh nước →
          </Link>
        </p>
      </Section>

      <Section
        id="viet-so"
        title="Hệ viết lá sớ chuyên nghiệp"
        lead="Gần 800 lòng sớ mẫu (Quốc ngữ / Hán Nôm / song ngữ), nhiều khổ giấy — miễn phí trong giai đoạn hiện tại."
      >
        <p className="text-muted">
          Trên thị trường, phần mềm viết sớ chuyên dụng thường khoảng{' '}
          <strong className="text-ink font-medium">1,8–4 triệu</strong> (có gói
          kèm bộ gõ / biểu mẫu chạm mức{' '}
          <strong className="text-ink font-medium">2–8 triệu</strong>). Hệ thống
          Quan Âm Trang Viện đưa viết sớ vào web quản trị —{' '}
          <strong className="text-ink font-medium">miễn phí toàn bộ</strong>{' '}
          trước mắt cho trụ trì sử dụng.
        </p>
        <FlowSteps
          steps={[
            'Đăng nhập /quan-tri → vào Viết sớ.',
            'Chọn lòng sớ mẫu phù hợp đàn lễ; chọn Quốc ngữ / Hán Nôm / song ngữ.',
            'Điền hộ – tín chủ – gia tiên (hoặc import danh sách).',
            'Chọn khổ giấy → xem trước → in hàng loạt, đóng dấu triện khi cần.',
          ]}
        />
        <p className="text-muted">
          Khác với <strong className="text-ink">sớ cầu online</strong> (Phật tử
          gửi nguyện vọng từ xa để thư ký duyệt): viết sớ là công cụ nội bộ thay
          thế phần mềm trả phí — soạn lá sớ đầy đủ, trang nghiêm cho đàn lễ.
        </p>
      </Section>

      <Section
        id="hoat-dong"
        title="Đăng & quản lý hoạt động của chùa"
        lead="Đăng lịch Phật sự để Phật tử chủ động đi lễ — giảm hỏi đi hỏi lại, tạo nhịp sinh hoạt đạo."
      >
        <h3 className="font-display text-xl text-ink">Đăng để làm gì?</h3>
        <BulletList
          items={[
            'Công bố lịch Phật sự minh bạch trên trang chủ (có đếm ngược, loại lễ, địa điểm).',
            'Phật tử tự sắp xếp thời gian — giảm tin nhắn / gọi hỏi giờ giấc.',
            'Gắn gửi tin Zalo/SMS nhắc đúng sự kiện.',
            'Thể hiện chùa đang sống động trước ban trị sự và nhà hảo tâm.',
          ]}
        />
        <h3 className="font-display text-xl text-ink pt-2">
          Cách đăng (từng bước)
        </h3>
        <FlowSteps
          steps={[
            'Vào /quan-tri/hoat-dong → tạo mới.',
            'Chọn loại lễ → nhập tiêu đề, tóm tắt, ảnh.',
            'Chọn thời gian bắt đầu / kết thúc và địa điểm.',
            'Bật xuất bản → sắp xếp thứ tự hiển thị trên trang chủ.',
          ]}
        />
        <p className="text-muted">
          <span className="text-ink font-medium">11 loại sự kiện:</span>{' '}
          {eventLabels.join(' · ')}.
        </p>
        <h3 className="font-display text-xl text-ink pt-2">Cách quản lý</h3>
        <BulletList
          items={[
            'Sửa nội dung, ẩn/hiện (chỉ sự kiện đã xuất bản mới lên trang chủ).',
            'Sắp xếp thứ tự; sau lễ có thể ẩn để trang chủ gọn.',
            'Best practice: đăng trước 1–2 tuần; cập nhật ngay nếu đổi giờ/địa điểm.',
            'Chuỗi: Tạo → Xuất bản → Hiện trang chủ → Gửi tin nhắc → Phật tử đến lễ / đăng ký sớ / công đức.',
          ]}
        />
      </Section>

      <Section
        id="dang-sao"
        title="Lễ đàn dâng sao giải hạn"
        lead="Vận hành trọn vẹn trên hệ thống — từ lịch đàn đến danh sách sớ, không sót tên."
      >
        <FlowSteps
          steps={[
            'Tạo sự kiện loại «Dâng sao giải hạn» với ngày giờ đàn và địa điểm.',
            'Mở nhận sớ cầu an online (/so-cau) để Phật tử gửi tên tuổi trước ngày đàn.',
            'Ban thư ký vào /quan-tri/so-cau duyệt → in → đưa vào đàn.',
            'Đàn lớn: dùng /quan-tri/viet-so soạn lá sớ chuẩn Hán Nôm / song ngữ.',
            'Gửi tin Zalo/SMS nhắc Phật tử đã đăng ký trước ngày lễ.',
          ]}
        />
        <BulletList
          items={[
            'Không sót tên, giảm viết tay, đàn trang nghiêm hơn.',
            'Phật tử tin tưởng vì quy trình rõ ràng, có trạng thái theo dõi.',
            'Công cụ «Sao chiếu mệnh» trên web tự kéo nhu cầu về đúng đàn thầy tổ chức.',
          ]}
        />
      </Section>

      <Section
        id="phat-tu"
        title="Hệ thống đăng ký & sổ Phật tử"
        lead="Sổ hộ tịch đạo số hóa — nền tảng nuôi dưỡng đạo tình lâu dài."
      >
        <FlowSteps
          steps={[
            'Phật tử đăng ký trên /dang-ky-phat-tu hoặc form trang chủ (lưu theo SĐT).',
            'Trụ trì vào /quan-tri/phat-tu xem / bổ sung pháp danh, nguồn, kênh liên hệ.',
            'Chỉ gửi tin cho người đã đồng ý nhận liên hệ (consent).',
            'Dùng sổ làm audience khi broadcast khóa tu, đàn sao, từ thiện.',
          ]}
        />
        <BulletList
          items={[
            'Biết ai đồng ý nhận tin — không spam, giữ duyên lành.',
            'Nguồn đăng ký: web, nhập tay, sự kiện, import.',
            'Kênh ưa thích: Zalo / SMS / điện thoại — gửi đúng nơi Phật tử đọc.',
          ]}
        />
      </Section>

      <Section
        id="so-cau"
        title="Quản lý sớ cầu của Phật tử"
        lead="Phật tử gửi cầu an / cầu siêu từ xa — thư ký duyệt, in, hoàn tất theo trạng thái."
      >
        <p className="text-muted">
          Workflow:{' '}
          <strong className="text-ink">Chờ duyệt → Đã duyệt → Đã in → Hoàn tất</strong>{' '}
          (hoặc Hủy). Trang in riêng từng phiếu tại quản trị.
        </p>
        <FlowSteps
          steps={[
            'Phật tử gửi form /so-cau (tên người cầu, năm sinh, địa chỉ, ngày lễ…).',
            'Trụ trì / thư ký lọc theo loại & trạng thái tại /quan-tri/so-cau.',
            'Duyệt → in → đưa vào đàn → đánh dấu hoàn tất.',
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2 pt-2">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-gilt">
              Sớ cầu online
            </p>
            <p className="mt-1 text-muted">
              Phật tử đăng ký nguyện vọng từ xa — danh sách đưa vào đàn.
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-gilt">
              Viết sớ chuyên nghiệp
            </p>
            <p className="mt-1 text-muted">
              Thầy / thư ký soạn lá sớ đầy đủ từ gần 800 mẫu — thay phần mềm trả
              phí.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="tung-kinh"
        title="Tụng kinh online YouTube & kết duyên Phật tử"
        lead="Phật tử ở xa vẫn đồng tu — chùa hiện diện mỗi ngày trên điện thoại."
      >
        <FlowSteps
          steps={[
            'Vào /quan-tri/tung-kinh → gắn kênh / URL YouTube.',
            'Tạo lịch: mỗi ngày / hàng tuần (chọn thứ) / một lần.',
            'Khi đang phát: bật trạng thái đang live.',
            'Khối tụng kinh hiện trang chủ — Phật tử bấm xem.',
            'Gửi tin từ sổ Phật tử: nhắc “hôm nay có tụng kinh live” + link.',
          ]}
        />
        <BulletList
          items={[
            'Kết hợp đăng sự kiện khóa tu / vía + lịch tụng + broadcast.',
            'Không cần app riêng — mọi thứ trên website trụ trì.',
            'Tăng duyên lành với Phật tử xa quê, bệnh, bận việc.',
          ]}
        />
      </Section>

      <Section
        id="tuan-mau"
        title="Một tuần vận hành mẫu"
        lead="Để trụ trì thấy ngay nhịp hệ thống phục vụ Phật sự."
      >
        <BulletList
          items={[
            'Thứ 2: đăng sự kiện dâng sao + khóa tu tuần tới.',
            'Thứ 3–4: Phật tử đăng ký sớ cầu + kết duyên sổ Phật tử.',
            'Thứ 5: duyệt sớ, in / viết sớ mẫu.',
            'Thứ 6: gửi tin nhắc lịch + link tụng kinh.',
            'Ngày lễ: bật live YouTube; ghi nhận công đức nước; hoàn tất sớ.',
            'Sau lễ: cập nhật trạng thái sớ hoàn tất; giữ ảnh sự kiện trên trang.',
          ]}
        />
      </Section>

      <Section
        id="cong-cu"
        title="Hướng dẫn 67 công cụ phong thủy · Phật học"
        lead="Từng công cụ một: giới thiệu, cách dùng, lợi ích với thầy. Mở từng nhóm bên dưới."
      >
        <ToolGuideCatalog />
      </Section>

      <Section
        id="sim"
        title="Hệ thống Sim phong thủy"
        lead="Giúp Phật tử tìm hiểu sâu sim hợp bản mệnh, phù trợ công việc — đồng thời là kênh kết duyên và mở khóa AI."
      >
        <FlowSteps
          steps={[
            'Vào /sim → lọc theo giá, mục đích, mệnh, quẻ.',
            'Nhập ngày sinh để chấm điểm cá nhân hóa theo Bát tự / dụng thần.',
            'Xem chi tiết số: Du Niên, 81 số lý, quẻ Kinh Dịch, radar 5 phương diện, hóa giải.',
            'So sánh nhiều số (/sim/so-sanh) hoặc xem theo nghề.',
            'Đặt hàng → thanh toán → theo dõi đơn; có trang báo cáo in.',
          ]}
        />
        <BulletList
          items={[
            'Lợi ích thầy: Phật tử hiểu sâu duyên số – công việc; gọi thầy khi cần luận tiếp.',
            simEnabled
              ? `Kho sim đang bật trên ${templeName} — đơn hàng có thể mang hoa hồng đại lý.`
              : 'Khi trụ trì được bật kho đại lý sim: hưởng hoa hồng theo cấu hình hệ thống.',
            'Đơn sim đã thanh toán cũng cộng lượt AI luận giải (giống thỉnh nước).',
          ]}
        />
        {simEnabled ? (
          <p>
            <Link
              href="/sim"
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--primary-color, #7A1F1F)' }}
            >
              Mở kho Sim phong thủy →
            </Link>
          </p>
        ) : null}
      </Section>

      <Section
        id="ai-quota"
        title="AI tự động kết nối công đức — mở khóa tính năng"
        lead="Không phải ép mua: Phật tử đã nhận giá trị luận giải miễn phí, rồi phát tâm để hỏi sâu hơn — mỗi lần phát tâm là thêm duyên với chùa và trụ trì."
      >
        <FlowSteps
          steps={[
            'Mỗi thiết bị có 3 lượt luận giải AI miễn phí / chu kỳ 30 ngày.',
            'Hết lượt → khóa chat, hiện CTA: thỉnh nước ủng hộ chùa, hoặc gọi trụ trì / chọn sim hợp mệnh.',
            'Thanh toán đơn nước hoặc sim → nhập mã đơn → cộng +5 lượt bonus (dùng trong 30 ngày).',
            'Có thể lặp lại với đơn mới; sticky bar & mốc gõ mõ nhắc nhẹ, không spam.',
          ]}
        />
        <p className="text-muted">
          <strong className="text-ink font-medium">Cửa ngõ mạnh nhất:</strong>{' '}
          lập lá số tử vi — người xem thường hỏi sâu nhất, dễ hết lượt, dễ gọi{' '}
          {abbottName} nhất.
        </p>
      </Section>

      <Section
        id="sdt-tru-tri"
        title="Hệ thống bám số điện thoại trụ trì"
        lead="Mọi điểm chạm đều dẫn về thầy — kích thích gọi điện khi duyên đang nóng."
      >
        <BulletList
          items={[
            'ContactDock cố định: Zalo, hotline tel:, bản đồ — luôn trong tầm tay.',
            'Hết lượt AI: nút gọi trực tiếp trụ trì đứng cạnh CTA nước/sim — Phật tử đang cần câu trả lời mệnh lý.',
            'Nhãn chai nước in SĐT + QR → gọi hoặc quét về website.',
            'Luận giải xưng hô theo tên trụ trì (persona) — gắn thương hiệu cá nhân thầy, không chỉ tên chùa.',
            'Vòng: thấy giá trị → muốn hỏi sâu → gọi thầy / công đức → kết duyên thật ngoài đời.',
          ]}
        />
        {phone ? (
          <p className="pt-1">
            Hotline đang gắn trên site:{' '}
            <a
              href={phoneHref(phone)}
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--primary-color, #7A1F1F)' }}
            >
              {phone}
            </a>{' '}
            ({abbottName})
          </p>
        ) : (
          <p className="text-muted pt-1">
            Hotline trụ trì lấy từ cấu hình chùa trong quản trị — luôn hiển thị
            cho Phật tử khi cần gọi.
          </p>
        )}
      </Section>

      <Section
        id="quyen"
        title="Phạm vi quyền sử dụng của Phật tử"
        lead="Ranh giới rõ ràng bảo vệ Phật sự và dữ liệu trụ trì."
      >
        <h3 className="font-display text-xl text-ink">Được</h3>
        <BulletList
          items={[
            'Xem trang chùa, dùng công cụ tra cứu, xin xăm, gõ mõ, xem tụng kinh.',
            'Đăng ký sổ Phật tử, gửi sớ cầu, thỉnh nước / sim.',
            'Dùng 3 lượt AI miễn phí mỗi chu kỳ; mở thêm bằng mã đơn đã thanh toán.',
          ]}
        />
        <h3 className="font-display text-xl text-ink pt-2">Không được</h3>
        <BulletList
          items={[
            'Truy cập /quan-tri; sửa CMS; xem sổ Phật tử người khác.',
            'Duyệt / in sớ hàng loạt; dùng viết sớ mẫu Hán Nôm chuyên nghiệp.',
            'Đối soát quỹ; gửi broadcast; tải kho lòng sớ đầy đủ.',
            'Vượt hạn mức AI / IP khi chưa công đức mở khóa.',
          ]}
        />
        <p className="text-muted pt-1">
          SĐT đăng ký chỉ dùng liên hệ Phật sự khi đã đồng ý nhận tin. Luận giải
          AI mang tính <strong className="text-ink">tham khảo văn hóa – tâm linh</strong>
          , không thay thế tư vấn y tế – pháp lý – tài chính; việc hệ trọng nên
          thỉnh ý trực tiếp trụ trì.
        </p>
      </Section>

      <Section
        id="tinh-nang"
        title="Bản đồ tính năng website (phía ngoài)"
        lead={`Những gì Phật tử thấy trên ${templeName}.`}
      >
        <BulletList
          items={[
            'Trang chủ: hero, trụ trì, lịch sử / timeline, di tích, gallery, video.',
            'Google Maps + đánh giá; sự kiện sắp tới; tụng kinh live.',
            'Cúng dường nước + minh bạch quỹ; đăng ký Phật tử; sớ cầu; gõ mõ.',
            'Hub Phong thủy & Phật học (~67 công cụ); Sim phong thủy (khi bật).',
            'Liên hệ Zalo / hotline / MXH qua ContactDock.',
          ]}
        />
      </Section>

      <Section
        id="quan-tri"
        title="Phần quản trị — tổng quan"
        lead="Đăng nhập bằng SĐT + mật khẩu 6 số tại /quan-tri/dang-nhap."
      >
        <BulletList
          items={[
            'Tổng quan: đơn chờ, thùng nước, sớ, Phật tử, cảnh báo kho.',
            'Cộng đồng: Phật tử, hoạt động, tụng kinh, gửi tin.',
            'Vận hành: đơn thỉnh nước, đối soát 50%, sớ cầu, viết sớ, kho vận.',
            'Sim (nếu được cấp quyền): kho & thống kê đơn.',
            'Nội dung: hình ảnh, liên hệ; đổi mật khẩu có nhật ký.',
          ]}
        />
        <p>
          <Link
            href="/quan-tri"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--primary-color, #7A1F1F)' }}
          >
            Vào khu vực quản trị →
          </Link>
        </p>
      </Section>

      <Section
        id="chi-phi"
        title="Chi phí & cam kết"
        lead="Minh bạch để trụ trì yên tâm sở hữu lâu dài."
      >
        <BulletList
          items={[
            'Hiện tại: miễn phí sử dụng tất cả công cụ và dịch vụ có trong website.',
            'Trong tương lai: 500.000đ / tháng — phí duy trì để hệ thống tồn tại và nâng cấp liên tục.',
            'So với tự xây website + mua phần mềm viết sớ 2–8 triệu + vận hành AI riêng: gói trụ trì tiết kiệm thời gian và chi phí cơ hội rất lớn.',
          ]}
        />
      </Section>

      <Section
        id="lien-he"
        title="Sở hữu hệ thống ngay"
        lead="Công ty CP Tập đoàn Quan Âm Trang Viện đồng hành cùng trụ trì trên hành trình thiện nguyện số."
      >
        <p>
          Thầy đang xem bản triển khai thực tế trên{' '}
          <strong className="font-medium text-ink">{templeName}</strong>
          {abbottName ? (
            <>
              {' '}
              — gắn với <strong className="font-medium text-ink">{abbottName}</strong>
            </>
          ) : null}
          . Để được cấp website và bộ công cụ tương tự, hãy liên hệ Tập đoàn
          Quan Âm Trang Viện (kênh triển khai phần mềm tới các trụ trì).
        </p>
        {phone ? (
          <p>
            Liên hệ nhanh qua hotline đang gắn trên site này:{' '}
            <a
              href={phoneHref(phone)}
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--primary-color, #7A1F1F)' }}
            >
              {phone}
            </a>
          </p>
        ) : null}
        <p className="text-muted">
          Sở hữu hệ thống hôm nay — hành thiện nhanh hơn, lan tỏa đạo pháp xa
          hơn, kết duyên Phật tử sâu hơn.
        </p>
      </Section>
    </div>
  );
}
