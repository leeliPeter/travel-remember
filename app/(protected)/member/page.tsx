import { currentUser } from "@/lib/auth";
import { MemberPage } from "@/app/(protected)/_components/member-content";
export default async function MemberPageWrapper() {
  const user = await currentUser();
  return <MemberPage user={user} />;
}
