import { BryceAppShell } from "../components/BryceAppShell/BryceAppShell";
import { ColorSchemeToggle } from "../components/ColorSchemeToggle/ColorSchemeToggle";
import { Welcome } from "../components/Welcome/Welcome";

export default function HomePage() {
  return (
    <BryceAppShell>
      <Welcome />
    </BryceAppShell>
  );
}
