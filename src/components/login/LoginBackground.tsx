import Image from "next/image";

export function LoginBackground() {
  return (
    <div
      className="img-info w-1/3 p-8"
      style={{
        backgroundImage:
          'url("https://devcms.thuvien.edu.vn/images/img-bg-login.png")',
        backgroundSize: "cover",
      }}
    >
      <div className="flex flex-col h-full p-8 gap-5">
        <div className="flex items-center gap-2">
          <Image
            src="https://devcms.thuvien.edu.vn/images/img-library.svg"
            width={70}
            height={70}
            alt="Logo"
            className="bg-white p-2 rounded"
          />
          <span className="text-white">eNetLibrary</span>
        </div>

        <div className="mt-8 flex flex-wrap">
          <p className="text-white text-4xl font-bold mb-4">Hệ thống</p>
          <span className="text-[#32C36C] text-4xl font-bold mb-4 ml-2">
            Thư viện điện tử{" "}
          </span>
          <p className="text-white text-4xl font-bold mb-4">trường học</p>
        </div>
        <div>
          <p className="text-white text-lg">
            Quản lý các tài liệu, bài giảng, hoạt động, hình ảnh của trường
            thông qua các tài liệu dạng Video, hình ảnh, audio, e-Learning. Quản
            lý mượn sách từ hệ thống quản lý thư viện truyền thống
          </p>
        </div>
        <div className="pt-5">
          <Image
            src="https://devcms.thuvien.edu.vn/images/img-login-slide-1.svg"
            width={400}
            height={400}
            alt="Login slide"
          />
        </div>
      </div>
    </div>
  );
}
