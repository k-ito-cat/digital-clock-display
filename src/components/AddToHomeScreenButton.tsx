import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const AddToHomeScreenButton = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent;

      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);

      setIsVisible(true);
    };

    // beforeinstallprompt イベントは、ブラウザがPWAをホーム画面に追加できると判断したときに発火
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleAddToHomeScreen = () => {
    if (deferredPrompt) {
      // インストールプロンプトを表示
      deferredPrompt.prompt();
      // ユーザーがプロンプトに応答するまで待機
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        // プロンプトの状態をリセット
        setDeferredPrompt(null);
        setIsVisible(false);
      });
    }
  };

  return (
    isVisible && (
      <button onClick={handleAddToHomeScreen}>ホーム画面に追加</button>
    )
  );
};
