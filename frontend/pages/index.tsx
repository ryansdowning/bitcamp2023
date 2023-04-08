import { OpenTicketAppShell } from "../components/OpenTicketAppShell/OpenTicketAppShell";
import { Welcome } from "../components/Welcome/Welcome";

export default function HomePage() {
  return (
    <OpenTicketAppShell>
      <Welcome />
    </OpenTicketAppShell>
  );
}
