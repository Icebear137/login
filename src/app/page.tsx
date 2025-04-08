import { redirect } from "next/navigation";

export default function Home() {
  const token = localStorage.getItem("token");
  if (token) {
    redirect("/borrow-book");
  } else {
    redirect("/login");
  }

  // Đảm bảo không render bất cứ thứ gì
  return null;
}
