# Next.js カンバンボード

Next.js 15+ を使用した、モダンで型安全なカンバンアプリケーションです。オニオンアーキテクチャと機能ベース（Features）のディレクトリ構造を採用しています。

## 技術スタック (Tech Stack)

- **フレームワーク**: [Next.js](https://nextjs.org) (App Router)
- **データベース**: SQLite (`better-sqlite3` 使用)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **UI**: Tailwind CSS v4, Lucide React
- **ドラッグ&ドロップ**: [dnd-kit](https://dndkit.com)
- **バリデーション**: Zod

## アーキテクチャ

このプロジェクトは **オニオンアーキテクチャ** と **機能単位（Feature-based）** のフォルダ構造を組み合わせています。

```
src/
├── app/                    # Next.js App Router (エントリーポイント)
├── infrastructure/         # 共通インフラストラクチャ (DB接続, スキーマ定義)
└── features/
    └── kanban/             # 機能: カンバンボード
        ├── domain/         # 純粋なドメインエンティティ & リポジトリインターフェース
        ├── application/    # ユースケース / アプリケーションサービス
        ├── infrastructure/ # リポジトリの実装 (Drizzle)
        └── presentation/   # UIコンポーネント & Server Actions
```

### なぜこの構成なのか？
- **Domain Layer**: 外部レイヤーやフレームワークへの依存を持ちません。純粋なビジネスロジックと型定義のみを含みます。
- **Application Layer**: ドメインオブジェクトを操作し、ユースケースを実現します。
- **Infrastructure Layer**: Domain/Application層で定義されたインターフェースの実装（データベースアクセスなど）を提供します。
- **Presentation Layer**: ReactコンポーネントとNext.js Server Actionsを含みます。

## 始め方 (Getting Started)

### 1. 依存関係のインストール

```bash
npm install
```

### 2. データベースのセットアップ

プロジェクトは SQLite を使用します。ルートディレクトリに `sqlite.db` ファイルが自動的に作成されます。

Drizzle のマイグレーションを実行してデータベーススキーマを初期化します：

```bash
npx drizzle-kit push
```

### 3. 特発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能 (Features)

- **カンバンボード**: タスクとカラムのドラッグ&ドロップをサポート。
- **データ永続化**: すべての変更は SQLite データベースに保存されます。
- **Server Actions**: データの更新は堅牢な Server Actions を介して行われます。
- **Optimistic UI**: ドラッグ操作時に即座に視覚的なフィードバックを提供します。
- **確認ダイアログ**: 削除操作の前に確認メッセージを表示します。

## 開発コマンド

- `npm run dev`: 開発サーバーを起動
- `npx drizzle-kit push`: データベーススキーマを更新
- `npx drizzle-kit studio`: データベースGUIを開く
