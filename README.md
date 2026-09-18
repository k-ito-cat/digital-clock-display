# digital-clock-display

フルスクリーンの時計とタイマー。

## Overview

時計・ポモドーロ・タイマーを一画面にまとめたもの。作業中に出しっぱなしにして使う。

## Screens

### Web

ブラウザで開くだけ。

<img width="1919" height="991" alt="Web版のフルスクリーン表示" src="https://github.com/user-attachments/assets/72700476-9569-426f-ad72-fc07e367bb83" />

### Notion

ページに埋め込んで使う。

<img width="1670" height="1040" alt="Notion埋め込みの表示" src="https://github.com/user-attachments/assets/ebdd6034-1706-422f-9c27-5c7dd150bcf9" />

## Core

- Clock：`HH:mm:ss` / `HH:mm`、日付表示の切替。
- Pomodoro：作業・休憩・長休憩の長さとセット数を調整、自動進行、進捗の線と次の状態を表示。
- Timer：時・分・秒の直接編集とプリセットで設定、進捗の線で残り時間を可視化。

## Experience

- 画面移動はタブ／スワイプ／左右キー。
- Picture-in-Pictureとフルスクリーンに対応。
- カーソルと操作UIの自動非表示。

## Visual

- ライト／ダークの切替。
- 文字色のカスタム。
- 時計の背景（なし／影／減光／面／すりガラス）。
- 背景タイプは画像／白／黒／透明／単色。

## Background

- Unsplashカテゴリから画像取得。
- 一定間隔で自動更新。
- ローカル画像のアップロードに対応。

## Install

- PWAとしてホーム画面に追加。

## Quick Start

1. 上部タブで「時計 / ポモドーロ / タイマー」を切り替える。
1. 右下の設定ボタンで背景・時計・タイマーの表示を調整する。
1. Picture-in-Picture とフルスクリーンを右下アクションから切り替える。
1. スマホは左右スワイプで画面を移動する。
