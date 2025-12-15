# Next.js カンバンボード

Next.js 15+ を使用した、モダンで型安全なカンバンアプリケーションです。オニオンアーキテクチャと機能ベース（Features）のディレクトリ構造を採用しています。

## 技術スタック (Tech Stack)

- **フレームワーク**: [Next.js](https://nextjs.org) (App Router)
- **データベース**: SQLite (`better-sqlite3` 使用)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **認証**: JWT (jose), bcryptjs
- **UI**: Tailwind CSS v4, Lucide React
- **ドラッグ&ドロップ**: [dnd-kit](https://dndkit.com)
- **バリデーション**: Zod

## アーキテクチャ

このプロジェクトは **オニオンアーキテクチャ** と **機能単位（Feature-based）** のフォルダ構造を組み合わせています。

```
src/
├── app/                    # Next.js App Router (エントリーポイント)
├── infrastructure/         # 共通インフラストラクチャ (DB接続, スキーマ定義)
├── middleware.ts           # 認証ミドルウェア
└── features/
    ├── auth/               # 機能: 認証
    │   ├── domain/         # 純粋なドメインエンティティ & リポジトリインターフェース
    │   ├── application/    # ユースケース / アプリケーションサービス
    │   ├── infrastructure/ # リポジトリの実装 & セッション管理
    │   └── presentation/   # UIコンポーネント & Server Actions
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

### 2. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の内容を追加してください：

```bash
JWT_SECRET=your-secret-key-change-in-production
```

**重要**: 本番環境では、必ず強力なランダム文字列を使用してください。

### 3. データベースのセットアップ

プロジェクトは SQLite を使用します。ルートディレクトリに `sqlite.db` ファイルが自動的に作成されます。

Drizzle のマイグレーションを実行してデータベーススキーマを初期化します：

```bash
npx drizzle-kit push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

初回アクセス時は `/login` ページにリダイレクトされます。`/register` ページから新しいアカウントを作成してください。

## 機能 (Features)

### 認証機能
- **ユーザー登録**: メールアドレス、パスワード、名前でアカウント作成
- **ログイン/ログアウト**: セキュアなJWTベースのセッション管理
- **パスワード暗号化**: bcryptjsによる安全なパスワードハッシュ化
- **ミドルウェア保護**: 未認証ユーザーは自動的にログインページへリダイレクト

### カンバンボード
- **カンバンボード**: タスクとカラムのドラッグ&ドロップをサポート。
- **データ永続化**: すべての変更は SQLite データベースに保存されます。
- **Server Actions**: データの更新は堅牢な Server Actions を介して行われます。
- **Optimistic UI**: ドラッグ操作時に即座に視覚的なフィードバックを提供します。
- **確認ダイアログ**: 削除操作の前に確認メッセージを表示します。

## 開発コマンド

- `npm run dev`: 開発サーバーを起動
- `npx drizzle-kit push`: データベーススキーマを更新
- `npx drizzle-kit studio`: データベースGUIを開く
