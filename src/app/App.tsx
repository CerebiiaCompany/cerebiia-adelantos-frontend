import { Providers } from "./providers";
import { AppRouter } from "./router/routes";

export default function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
