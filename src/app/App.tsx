import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { SplashScreen } from "./components/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <RouterProvider router={router} />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </>
  );
}
