const Footer = () => {
  return (
    <footer className="mt-[5%]">
      <footer className="bg-[#0B0D13] text-white">
        <div className="mx-auto p-8">
          <ul className="flex items-center justify-center flex-wrap gap-4 sm:gap-10 mb-6 sm:mb-10 text-sm md:text-base">
            <li>
              <a href="/policy">Chính sách</a>
            </li>
            <li>
              <a href="/movies">Lịch chiếu</a>
            </li>
            <li>
              <a href="/news-list">Tin tức</a>
            </li>
            <li>
              <a href="/ticket-price">Giá vé</a>
            </li>
            <li>
              <a href="/faqs">Hỏi đáp</a>
            </li>
            <li>
              <a href="/group-booking">Đặt vé nhóm, tập thể</a>
            </li>
            <li>
              <a href="/contact">Liên hệ</a>
            </li>
          </ul>

          {/* <div className="mb-6 flex flex-wrap items-center justify-center gap-4 sm:gap-10">
            <div className="flex items-center gap-6">
              <a href="https://www.facebook.com/" target="_blank">
                <img
                  alt="facebook"
                  loading="lazy"
                  width={30}
                  height={30}
                  decoding="async"
                  data-nimg={1}
                  className="rounded-sm"
                  style={{ color: "transparent" }}
                  srcSet="/_next/image?url=%2Fimages%2Ffacebook.png&w=32&q=75 1x, /_next/image?url=%2Fimages%2Ffacebook.png&w=64&q=75 2x"
                  src="/_next/image?url=%2Fimages%2Ffacebook.png&w=64&q=75"
                />
              </a>
              <a href="https://oa.zalo.me/ttcpqg" target="_blank">
                <img
                  alt="zalo"
                  loading="lazy"
                  width={30}
                  height={30}
                  decoding="async"
                  data-nimg={1}
                  style={{ color: "transparent" }}
                  srcSet="/_next/image?url=%2Fimages%2Fzalo.webp&w=32&q=75 1x, /_next/image?url=%2Fimages%2Fzalo.webp&w=64&q=75 2x"
                  src="/_next/image?url=%2Fimages%2Fzalo.webp&w=64&q=75"
                />
              </a>
              <a
                href="https://www.youtube.com/@TrungtamChieuphimQuocgiaNCC"
                target="_blank"
              >
                <img
                  alt="youtube"
                  loading="lazy"
                  width={30}
                  height={30}
                  decoding="async"
                  data-nimg={1}
                  className="rounded-sm"
                  style={{ color: "transparent" }}
                  srcSet="/_next/image?url=%2Fimages%2Fyoutube2.png&w=32&q=75 1x, /_next/image?url=%2Fimages%2Fyoutube2.png&w=64&q=75 2x"
                  src="/_next/image?url=%2Fimages%2Fyoutube2.png&w=64&q=75"
                />
              </a>
            </div>
            <div className="flex gap-5 items-center">
              <a
                href="https://play.google.com/store/apps/details?id=vn.com.chieuphimquocgia.app&hl=en_US"
                target="_blank"
              >
                <img
                  alt="googlePlay"
                  loading="lazy"
                  width={140}
                  height={38}
                  decoding="async"
                  data-nimg={1}
                  style={{ color: "transparent" }}
                  srcSet="/_next/image?url=%2Fimages%2Fgoogleplay.png&w=256&q=75 1x, /_next/image?url=%2Fimages%2Fgoogleplay.png&w=384&q=75 2x"
                  src="/_next/image?url=%2Fimages%2Fgoogleplay.png&w=384&q=75"
                />
              </a>
              <a
                href="https://apps.apple.com/vn/app/chi%E1%BA%BFu-phim-qu%E1%BB%91c-gia-ncc/id6446946150"
                target="_blank"
              >
                <img
                  alt="appStore"
                  loading="lazy"
                  width={130}
                  height={38}
                  decoding="async"
                  data-nimg={1}
                  style={{ color: "transparent" }}
                  srcSet="/_next/image?url=%2Fimages%2Fappstore.png&w=256&q=75 1x, /_next/image?url=%2Fimages%2Fappstore.png&w=384&q=75 2x"
                  src="/_next/image?url=%2Fimages%2Fappstore.png&w=384&q=75"
                />
              </a>
              <a
                href="http://online.gov.vn/Home/WebDetails/4519"
                target="_blank"
              >
                <img
                  alt="certification"
                  loading="lazy"
                  width={130}
                  height={38}
                  decoding="async"
                  data-nimg={1}
                  style={{ color: "transparent" }}
                  srcSet="/_next/image?url=%2Fimages%2Fcertification.png&w=256&q=75 1x, /_next/image?url=%2Fimages%2Fcertification.png&w=384&q=75 2x"
                  src="/_next/image?url=%2Fimages%2Fcertification.png&w=384&q=75"
                />
              </a>
            </div>
          </div> */}
          <div className="text-center space-y-2 text-xs md:text-base mb-6">
            <p>Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH</p>
            <p>Bản quyền thuộc Trung tâm Chiếu phim CinemaLM.</p>
            <p>
              Giấy phép số: 224/GP- TTĐT ngày 31/8/2010 - Chịu trách nhiệm -
              Giám đốc.
            </p>
            <p>
              Địa chỉ: Trịnh Văn Bô, Phường Nam Từ Liên, TP.Hà Nội - Điện thoại:
              012 3456 789
            </p>
          </div>
          <div className="text-center text-sm">
            Copyright 2023. NCC All Rights Reservered. Dev by Ngũ Hổ Tướng{/* */}{" "}
          </div>
        </div>
      </footer>
    </footer>
  );
};

export default Footer;
