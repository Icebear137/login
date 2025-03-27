import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");

  // Đảm bảo không render bất cứ thứ gì
  return null;
}
