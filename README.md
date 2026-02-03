# digital-clock-display

## Web

<img width="1919" height="991" alt="スクリーンショット 2026-02-03 203927" src="https://github.com/user-attachments/assets/72700476-9569-426f-ad72-fc07e367bb83" />


## Notion

埋め込みすることでウィジェットとして利用が可能。

Webで可能な文字色や背景の変更やサイズ変更などのほか、表示サイズ調整も自由。

<img width="1670" height="1040" alt="スクリーンショット 2026-02-03 204810" src="https://github.com/user-attachments/assets/ebdd6034-1706-422f-9c27-5c7dd150bcf9" />


## 使用技術


- React + TypeScript + Vite
- Tailwind CSS / PostCSS
- Material UI (一部 UI コンポーネント)
- Unsplash API (背景画像取得)
- PWA (VitePWA)

## 主な機能

- 時計表示（HH:mm:ss / HH:mm の切り替え、日付表示 ON/OFF）
- ポモドーロタイマー（セット数や休憩時間の設定、進捗リスト、リセット、背景表示/コントロールの ON/OFF）
- 円形プログレス付きタイマー（時・分・秒単位の設定、背景表示/コントロールの ON/OFF）
- 3 つのタブ（時計 / ポモドーロ / タイマー）のスワイプ・矢印キーによる切り替え
- 右下アクション（Picture-in-Picture / フルスクリーン / 設定ドロワー）
- 背景画像の自動切り替え（間隔設定・Unsplash カテゴリ選択・ローカル画像アップロード）
- 背景表示の ON/OFF、すりガラス効果の ON/OFF（iOS Safari 対策で排他制御あり）
- カーソル非表示タイマー、ポモドーロ/タイマーのコントロール表示切り替え

## 使い方

1. 画面下部のタブで「時計 / ポモドーロ / タイマー」を切り替え
2. 画面右下の設定ボタンから以下を設定：
   - 背景画像（Unsplash カテゴリ・ローカルアップロード）と切り替え間隔
   - 背景色／すりガラス効果の ON/OFF
   - 時計表示（日付、時刻フォーマット）
   - ポモドーロ／タイマーのコントロール表示、カーソル非表示秒数
3. Picture-in-Picture、フルスクリーンは右下アクションから利用可能
4. SP デバイスではタブを左右スワイプ
